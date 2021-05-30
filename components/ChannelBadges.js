import { capitalize } from 'lodash';
import { by639_1 } from 'iso-language-codes';

import { RedBadge, GreenBadge, YellowBadge, PurpleBadge } from './Badge';

export default function ChannelBadges({
  user: { latestStreamLanguage, latestStreamGameName, channelType, team },
}) {
  return (
    <>
      {latestStreamLanguage && latestStreamLanguage !== 'en' && (
        <GreenBadge>{by639_1[latestStreamLanguage].name}</GreenBadge>
      )}
      {latestStreamGameName && latestStreamGameName !== 'Science & Technology' && (
        <RedBadge>{latestStreamGameName}</RedBadge>
      )}
      {channelType && channelType !== 'USER' && (
        <YellowBadge>{capitalize(channelType.toLowerCase())}</YellowBadge>
      )}
      {team && <PurpleBadge>{team}</PurpleBadge>}
    </>
  );
}
