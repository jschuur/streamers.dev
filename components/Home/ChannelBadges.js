import { differenceInDays, parseISO } from 'date-fns';
import { capitalize } from 'lodash';
import { by639_1 } from 'iso-language-codes';

import Badge from '../Badge';

import { NEW_STREAMER_AGE_DAYS } from '../../lib/config';

export default function ChannelBadges({
  channel: {
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
        <Badge key={1} color='green'>
          🗣 {by639_1[latestStreamLanguage]?.name || latestStreamLanguage}
        </Badge>
      )}
      {latestStreamGameName &&
        !['Science & Technology', 'Software and Game Development'].includes(
          latestStreamGameName
        ) && (
          <Badge key={2} color='red'>
            In: {latestStreamGameName}
          </Badge>
        )}
      {channelType && channelType !== 'USER' && (
        <Badge key={3} color='yellow'>
          {capitalize(channelType.toLowerCase())}
        </Badge>
      )}
      {teams &&
        teams.map((team) => (
          <Badge key={team} color='purple'>
            Team: {team}
          </Badge>
        ))}
      {differenceInDays(new Date(), parseISO(creationDate)) <= NEW_STREAMER_AGE_DAYS && (
        <Badge key={4} color='gray'>
          New Streamer
        </Badge>
      )}
    </>
  );
}
