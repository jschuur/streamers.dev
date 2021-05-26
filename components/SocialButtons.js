import React from 'react';

import {
  TwitterButton,
  GitHubButton,
  InstagramButton,
  DiscordButton,
  YouTubeButton,
  HomepageButton,
} from './SocialButton';

export default function SocialButtons({ user }) {
  return (
    <div className='grid grid-cols-3 sm:grid-cols-${} gap-y-2 gap-x-3 mr-2'>
      <TwitterButton user={user} />
      <GitHubButton user={user} />
      <YouTubeButton user={user} />
      <DiscordButton user={user} />
      <HomepageButton user={user} />
      <InstagramButton user={user} />
    </div>
  );
}
