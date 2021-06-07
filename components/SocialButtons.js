import React from 'react';

import {
  TwitterButton,
  GitHubButton,
  InstagramButton,
  DiscordButton,
  YouTubeButton,
  HomepageButton,
} from './SocialButton';

export default function SocialButtons({ channel }) {
  return (
    <div className='grid grid-cols-3 auto-cols-min gap-y-2 gap-x-3 mr-2'>
      <TwitterButton channel={channel} />
      <GitHubButton channel={channel} />
      <YouTubeButton channel={channel} />
      <DiscordButton channel={channel} />
      <HomepageButton channel={channel} />
      <InstagramButton channel={channel} />
    </div>
  );
}
