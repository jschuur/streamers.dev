import regexCreator from 'emoji-regex';
import pluralize from 'pluralize';

import { getKeywords } from './db';
import { isCoding, debug } from './util';

const emojiRegex = regexCreator();

let tagsByFragmentKeywords,
  fullMatchKeywords = [],
  fragmentMatchRegexps = [];

// Create two lists of tags/keywords, one for full title subsrting matches,
// one for fragments(white space separated words)
function buildKeywordLists(tagList) {
	let fullMatchKeywords = [], fragmentMatchKeywords = [], fragmentMatchRegexps = [];
  const fullMatchCandidate = (str) => (str?.search(/[ \+]/) > 0) && !str.startsWith('/');

	tagList.forEach(({ tag, keywords }) => {
		let fullMatches = [],
      fragmentMatches = [],
      fragmentMatchesRegexp = [];

		keywords.forEach(keyword => {
			if (fullMatchCandidate(keyword))
				fullMatches.push(keyword);
      else if (keyword.startsWith('/'))
        fragmentMatchesRegexp.push(keyword);
      else
				fragmentMatches.push(keyword);
		});

		if (fullMatches.length) fullMatchKeywords.push({ tag, keywords: fullMatches });
		if (fragmentMatches.length) fragmentMatchKeywords.push({ tag, keywords: fragmentMatches });
		if (fragmentMatchesRegexp.length) fragmentMatchRegexps.push({ tag, regexps: fragmentMatchesRegexp });
	});

		return [fullMatchKeywords, fragmentMatchKeywords, fragmentMatchRegexps];
}

export async function loadKeywords() {
	debug('Loading keywords...');
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

	debug(
    `...done (${pluralize('tag', tagList.length, true)}, ${pluralize(
      'full match',
      countKeywords(fullMatchList),
      true
    )}, ${pluralize('fragment matches', countKeywords(fragmentMatchList), true)})`
  );
}

// Helper functions
const stripEmoji = (str) => str.replace(emojiRegex, '');
const removeCenterPluses = (str) =>
  str.replace(/(\w)\++(\w)/gm, '$1 $2').replace(/\s+\+\s+/gm, ' ');
const removeBangCommands = (str) => !str.startsWith('!'); // Avoids unintended matches on !discord e.g.
const removePunctuation = (str) => str.replace(/([!\.]$|^#|[\n\(\)\[\]!\?])/gm, '');
const lookupTags = (str) => {
  if (!str?.length) return [];

  return tagsByFragmentKeywords[str.toLowerCase()] || [];
};

function splitStreamTitle(str) {
	return stripEmoji(str)
    .replace(/[,\|\-\/]/gm, ' ')
    .split(/\s+/)
    .filter(removeBangCommands)
    .map(removePunctuation)
    .filter(Boolean);
}

// Return all the tags found in a given string
export function findTags(str) {
  if (!str) return [];

  debug(`Scanning stream title '${str}' for tag keywords...`);

  // Look for full matches over the entire title first (for space separated terms or keywords like C++)...
  const fullKeywordMatches = fullMatchKeywords
    .filter(({ keywords }) =>
      keywords.some((keyword) => str.toLowerCase().indexOf(keyword.toLowerCase()) >= 0)
    )
    .map(({ tag }) => tag);

  // ..then split the stream title into word fragments based on whitespace
  // and some punctuation separators...
  const titleWords = splitStreamTitle(str);
  debug(`titleWords: ${JSON.stringify(titleWords)}`);

  // ...now match those against the all the possible keywords for a tag...
  const fragmentRegexpMatches = fragmentMatchRegexps
    .filter(({ tag, regexps }) =>
      regexps.some((regexp) => {
        const [, pattern, options] = regexp.split('/');
        const re = new RegExp(pattern, options);

        return titleWords.some((word) => word.match(re));
      })
    )
    .map(({ tag }) => tag);

  // ...now match those against the all the possible keywords for a tag...
  const fragmentKeywordMatches = titleWords.flatMap(lookupTags);

  // ... and finally, merge it all together into a unique list
  const streamTags = [...new Set([...fullKeywordMatches, ...fragmentKeywordMatches, ...fragmentRegexpMatches])];

  debug(`Tags identified: ${JSON.stringify(streamTags)}`);

  return streamTags;
}

export async function addStreamTags(channels) {
  console.log(`Looking for stream tags for ${pluralize('channel', liveCodingChannels?.length, true)}...`);

  if (!tagsByFragmentKeywords) await loadKeywords();

	const liveCodingChannels = channels.filter((channel) => isCoding(channel) && channel.isLive && channel.latestStreamTitle?.length);

	liveCodingChannels.forEach((channel) => {
    const tags = findTags(channel.latestStreamTitle.trim());

    channel.latestStreamTags = tags;
  });

  console.log('...done')
}
