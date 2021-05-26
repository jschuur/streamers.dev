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
    <div className='flex'>
      <TwitterButton user={user} />
      <GitHubButton user={user} />
      <YouTubeButton user={user} />
      <DiscordButton user={user} />
      <HomepageButton user={user} />
      <InstagramButton user={user} />
    </div>
  );
}
