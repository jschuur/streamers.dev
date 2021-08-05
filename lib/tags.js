import pluralize from 'pluralize';
import { uniq } from 'lodash';

import { getKeywords } from './db';
import { isCoding } from './util';
import logger from './logger';

let tagsByFragmentKeywords,
  fullMatchKeywords = [],
  fragmentMatchRegexps = [];

// Create several lists of tags/keywords, one for full title subsrting matches, two for
// fragments (white space separated words) based on regexps and regular string matches
function buildKeywordLists(tagList) {
  let fullMatchKeywords = [],
    fragmentMatchKeywords = [],
    fragmentMatchRegexps = [];

  // Keywords with certain characters are searched across the whole stream title, pre sanitising
  // This way both 'C++' can be found for matches and +s turned into spaces for keyword splitting
  const fullMatchCandidate = (str) => str?.search(/[ \+\#\-\.]/) >= 0 && !str.startsWith('/');

  tagList.forEach(({ tag, keywords }) => {
    let fullMatches = [],
      fragmentMatches = [],
      fragmentMatchesRegexp = [];

    keywords.forEach((keyword) => {
      if (fullMatchCandidate(keyword)) fullMatches.push(keyword);
      else if (keyword.startsWith('/')) fragmentMatchesRegexp.push(keyword);
      else fragmentMatches.push(keyword);
    });

    if (fullMatches.length) fullMatchKeywords.push({ tag, keywords: fullMatches });
    if (fragmentMatches.length) fragmentMatchKeywords.push({ tag, keywords: fragmentMatches });
    if (fragmentMatchesRegexp.length)
      fragmentMatchRegexps.push({ tag, regexps: fragmentMatchesRegexp });
  });

  return [fullMatchKeywords, fragmentMatchKeywords, fragmentMatchRegexps];
}

export async function loadKeywords() {
  logger.verbose('Loading keywords...');
  const tagList = await getKeywords();

  const [fullMatchList, fragmentMatchList, fragmentMatchRegexpList] = buildKeywordLists(tagList);

  fullMatchKeywords = fullMatchList;
  fragmentMatchRegexps = fragmentMatchRegexpList;
  tagsByFragmentKeywords = {};

  // Build a lookup table that maps a split match keyword to a tag
  fragmentMatchList.forEach((entry) => {
    const keywords = entry.keywords || [entry];
    const tag = entry.tag || entry;

    keywords.forEach((keyword) => {
      const lowerCaseKeyword = keyword.toLowerCase();

      if (tagsByFragmentKeywords[lowerCaseKeyword])
        tagsByFragmentKeywords[lowerCaseKeyword].push(tag);
      else tagsByFragmentKeywords[lowerCaseKeyword] = [tag];
    });
  });

  const countKeywords = (list) => list.reduce((acc, tag) => acc + (tag.keywords?.length || 0), 0);

  logger.verbose(
    `...done (${pluralize('tag', tagList.length, true)}, ${pluralize(
      'full match',
      countKeywords(fullMatchList),
      true
    )}, ${pluralize('fragment matches', countKeywords(fragmentMatchList), true)})`
  );
}

// Helper functions
const stripNonASCII = (str) => str.replace(/[^\x00-\xFF]/gm, ' ');
//
// Remove anything that starts with a !, to avoid unintended matches on !discord or !github
const removeBangCommands = (str) => str.replace(/!\w+/gm, ' ');
// Convert a bunch of punctuation to spaces, so we can split the title easier into potenial keywords
const removePunctuation = (str) => str.replace(/[#\n\(\)\[\]\{\}\<\>!\?\.,&\\\/\|\-"'\`:;]/gm, ' ');
const lookupTags = (str) => {
  if (!str?.length) return [];

  return tagsByFragmentKeywords[str.toLowerCase()] || [];
};

// Create parse friendly list of keywords by removing special characters and punctuation and then
// splitting the stream title based on whitespace characters
function splitStreamTitle(str) {
  return removePunctuation(removeBangCommands(stripNonASCII(str)))
    .split(/\s+/)
    .filter(Boolean);
}

// Return all the tags found in a given string
export function findTags(str) {
  if (!str) return [];

  logger.verbose(`Scanning stream title '${str}' for tag keywords...`);

  // Look for full matches over the entire title first (for space separated terms or keywords like C++)...
  const fullKeywordMatches = fullMatchKeywords
    .filter(({ keywords }) =>
      keywords.some((keyword) => str.toLowerCase().indexOf(keyword.toLowerCase()) >= 0)
    )
    .map(({ tag }) => tag);

  // ..first split the stream title into word fragments based on whitespace
  // and some punctuation separators...
  const titleWords = splitStreamTitle(str);
  logger.verbose(`titleWords: ${JSON.stringify(titleWords)}`);

  // ...then match those against any regular expressions for a tag. This allows us to look for
  // stuff like 'Go' with uppercase instead of matching on normal use of 'go'...
  const fragmentRegexpMatches = fragmentMatchRegexps
    .filter(({ tag, regexps }) =>
      regexps.some((regexp) => {
        const [, pattern, options] = regexp.split('/');
        const re = new RegExp(pattern, options);

        return titleWords.some((word) => word.match(re));
      })
    )
    .map(({ tag }) => tag);

  // ...now look for normal string matches for all the possible keywords. Seems quicker than
  // just doing a bunch of regexp and substring matches, right?...
  const fragmentKeywordMatches = titleWords.flatMap(lookupTags);

  // ... and finally, merge it all together into a unique list
  const streamTags = [
    ...new Set([...fullKeywordMatches, ...fragmentKeywordMatches, ...fragmentRegexpMatches]),
  ];

  logger.verbose(`Tags identified: ${JSON.stringify(streamTags)}`);

  return streamTags;
}

export async function addStreamTags(channels) {
  if (!tagsByFragmentKeywords) await loadKeywords();

  const liveCodingChannels = channels.filter(
    (channel) => channel.isLive && channel.latestStreamTitle?.length && isCoding(channel)
  );
  logger.verbose(
    `Looking for stream tags for ${pluralize('channel', liveCodingChannels?.length, true)}...`
  );

  liveCodingChannels.forEach((channel) => {
    const { latestStreamTags = [], latestStreamTitle, allStreamTags = [] } = channel;
    const currentTags = findTags(latestStreamTitle.trim());

    // Add any new tags to the old list, so we also handle stream title changes
    channel.allStreamTags = uniq([...allStreamTags, ...currentTags]);
    channel.latestStreamTags = currentTags;
  });

  logger.verbose('...done adding stream tags');
}
