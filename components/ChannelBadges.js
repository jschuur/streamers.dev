import { differenceInDays, parseISO } from 'date-fns';
import { capitalize } from 'lodash';
import { by639_1 } from 'iso-language-codes';

import { RedBadge, GreenBadge, YellowBadge, PurpleBadge, GrayBadge } from './Badge';

import { NEW_STREAMER_AGE_DAYS } from '../lib/config';

export default function ChannelBadges({
  user: {
    displayName,
    latestStreamLanguage,
    latestStreamGameName,
    channelType,
    team,
    creationDate,
  },
}) {
  const teams = team ? team.split(',') : undefined;

  return (
    <>
      {latestStreamLanguage && latestStreamLanguage !== 'en' && (
        <GreenBadge key={1}>🗣 {by639_1[latestStreamLanguage].name}</GreenBadge>
      )}
      {latestStreamGameName && latestStreamGameName !== 'Science & Technology' && (
        <RedBadge key={2}>In: {latestStreamGameName}</RedBadge>
      )}
      {channelType && channelType !== 'USER' && (
        <YellowBadge key={3}>{capitalize(channelType.toLowerCase())}</YellowBadge>
      )}
      {teams && teams.map((team) => <PurpleBadge key={4}>Team: {team}</PurpleBadge>)}
      {differenceInDays(new Date(), parseISO(creationDate)) <= NEW_STREAMER_AGE_DAYS && (
        <GrayBadge>New Streamer</GrayBadge>
      )}
    </>
  );
}
