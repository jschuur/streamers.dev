import { capitalize } from 'lodash';
import { by639_1 } from 'iso-language-codes';

import { RedBadge, GreenBadge, YellowBadge, PurpleBadge } from './Badge';

export default function ChannelBadges({
  user: { displayName, latestStreamLanguage, latestStreamGameName, channelType, team },
}) {
  const teams = team ? team.split(',') : undefined;

  return (
    <>
      {latestStreamLanguage && latestStreamLanguage !== 'en' && (
        <GreenBadge>🗣 {by639_1[latestStreamLanguage].name}</GreenBadge>
      )}
      {latestStreamGameName && latestStreamGameName !== 'Science & Technology' && (
        <RedBadge>In: {latestStreamGameName}</RedBadge>
      )}
      {channelType && channelType !== 'USER' && (
        <YellowBadge>{capitalize(channelType.toLowerCase())}</YellowBadge>
      )}
      {teams && teams.map((team) => <PurpleBadge>Team: {team}</PurpleBadge>)}
    </>
  );
}
