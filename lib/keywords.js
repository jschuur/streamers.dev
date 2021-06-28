import regexCreator from 'emoji-regex';
import pluralize from 'pluralize';

import { getKeywords } from './db';
import { isCoding } from './util';

const emojiRegex = regexCreator();

// Build lookup table of keyword that map to one or more tags
let tagsByKeywords;
let keywordsWithSpaces;

export async function loadKeywords() {
  const keywordList = await getKeywords();

  keywordsWithSpaces = keywordList.reduce((acc, { tag, keywords }) => {
    const spaceKeywords = keywords.filter((keyword) => keyword.indexOf(' ') > 0);
    return spaceKeywords.length ? [...acc, { tag, keywords: spaceKeywords }] : acc;
  }, []);

  // TODO: actually delete the keywords with spaces, since you don't need to search for them later
  // TODO: build up a new array by pushing into it, so I don't have to weed out non space ones again

  tagsByKeywords = {};

  keywordList.forEach((entry) => {
    const keywords = entry.keywords || [entry];
    const tag = entry.tag || entry;

    keywords.forEach((keyword) => {
			const lowerCaseKeyword = keyword.toLowerCase();

      if (tagsByKeywords[lowerCaseKeyword]) tagsByKeywords[lowerCaseKeyword].push(tag);
      else tagsByKeywords[lowerCaseKeyword] = [tag];
    });
  });

  return tagsByKeywords;
}

// Helper functions
const stripEmoji = (str) => str.replace(emojiRegex, '');
const removePunctuation = (str) => str.replace(/([!\.]$|^#|[\n\(\)\[\]!\?])/g, '');
const lookupTags = (str) => {
  if (!str?.length) return [];

  return tagsByKeywords[str.toLowerCase()] || [];
};

// Return all the keywords found in a given string
export function findKeywords(str) {
  if (!str) return [];

  process.env.DEBUG && console.log(`Scanning ${str} for tag keywords...`);

  // Find words with spaces first...
  const spaceKeywordMatches = keywordsWithSpaces
    .filter(({ keywords }) =>
      keywords.some((keyword) => str.toLowerCase().indexOf(keyword.toLowerCase()) >= 0)
    )
    .map(({ tag }) => tag);

  // ..then break apart the stream title...
  const titleWords = stripEmoji(str)
    .replace(/[,\|\-\+\/]/g, ' ')
    .split(' ')
    .map(removePunctuation)
    .filter(Boolean);
  process.env.DEBUG && console.log(`titleWords: ${JSON.stringify(titleWords)}`);

  // ...now match those against the keyword variants and merge it all together
  const streamTags = [...new Set([...titleWords.flatMap(lookupTags), ...spaceKeywordMatches])];
  process.env.DEBUG && console.log(`Tags identified: ${JSON.stringify(streamTags)}`);

  return streamTags;
}

export async function addStreamKeywords(channels) {
  if (!tagsByKeywords) await loadKeywords();

  process.env.DEBUG &&
    console.log(`Adding stream tags... (${pluralize('channel', channels?.length, true)})`);

  channels
    .filter((channel) => isCoding(channel) && channel.latestStreamTitle?.length)
    .forEach((channel) => {
      const tags = findKeywords(channel.latestStreamTitle.trim());
      process.env.DEBUG && console.log(`Adding tags to ${channel.displayName}: ${tags}`);

      channel.latestStreamTags = tags;
    });
}
