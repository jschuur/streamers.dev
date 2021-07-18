import { useImage } from 'react-image';

import { TwitchLink } from '../lib/util';
import { DEFAULT_AVATAR_URL } from '../lib/config';
import { profilePictureUrl } from '../lib/util';

export default function TwitchAvatar({ size = 'small', channel, src }) {
  const { name, displayName, broadcasterType } = channel;
  const { src: profilePictureSrc } = useImage({
    srcList: [profilePictureUrl(channel.profilePictureUrl, 70), DEFAULT_AVATAR_URL],
    useSuspense: false,
  });

  return (
    <TwitchLink username={name}>
      <img
        className={`${size === 'large' ? 'h-16 w-16' : 'h-12 w-12'} rounded-full ${
          broadcasterType === 'partner'
            ? 'border-purple-600 border-[3px]'
            : broadcasterType === 'affiliate' && 'border-blue-600 border-[3px]'
        }`}
        src={profilePictureSrc}
        alt={`Avatar for ${displayName}`}
      />
    </TwitchLink>
  );
}
