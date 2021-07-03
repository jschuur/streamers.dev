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
    <div className='hidden w-full md:flex gap-3 justify-end pt-2'>
      <TwitterButton channel={channel} />
      <GitHubButton channel={channel} />
      <YouTubeButton channel={channel} />
      <DiscordButton channel={channel} />
      <HomepageButton channel={channel} />
      <InstagramButton channel={channel} />
    </div>
  );
}
