import { differenceInDays, parseISO } from 'date-fns';
import { capitalize } from 'lodash';
import { by639_1 } from 'iso-language-codes';

import Badge from '../Badge';

import { hasGameDevStreamTag } from '../../lib/util';

import { NEW_STREAMER_AGE_DAYS } from '../../lib/config';

export default function ChannelBadges({ channel }) {
  const {
    latestStreamLanguage,
    latestStreamGameName,
    latestStreamTags,
    channelType,
    team,
    creationDate,
  } = channel;
  const teams = team ? team.split(',') : undefined;

  return (
    <>
      {latestStreamLanguage && latestStreamLanguage !== 'en' && (
        <Badge key={'lang'} color='yellow'>
          🗣 {by639_1[latestStreamLanguage]?.name || latestStreamLanguage}
        </Badge>
      )}
      {latestStreamTags && hasGameDevStreamTag(channel.latestStreamTags) && (
        <Badge key={'gamedev'} color='green'>
          GameDev
        </Badge>
      )}
      {latestStreamGameName &&
        !['Science & Technology', 'Software and Game Development'].includes(
          latestStreamGameName
        ) && (
          <Badge key={'gamename'} color='red'>
            In: {latestStreamGameName}
          </Badge>
        )}
      {channelType && channelType !== 'USER' && (
        <Badge key={'channeltype'} color='cyan'>
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
        <Badge key={'newstreamer'} color='gray'>
          New Streamer
        </Badge>
      )}
    </>
  );
}
