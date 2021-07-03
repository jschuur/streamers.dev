import React from 'react';
import {
  FaTwitterSquare,
  FaGithub,
  FaYoutube,
  FaDiscord,
  FaInstagram,
  FaHome,
} from 'react-icons/fa';

function SocialLink({ network, channel, children }) {
  let link = channel[network];

  if (!link) return null;

  if (network === 'twitter') link = `https://twitter.com/${link}`;
  else if (network === 'github') link = `https://github.com/${link}`;
  else if (network === 'instagram') link = `https://instagram.com/${link}`;

  return (
    <a href={link} target='_new'>
      {children}
    </a>
  );
}

function SocialButton({ network, channel, children }) {
  return (
    <SocialLink network={network} channel={channel}>
      {children}
    </SocialLink>
  );
}

export function TwitterButton({ channel }) {
  return (
    <SocialButton network={'twitter'} channel={channel}>
      <FaTwitterSquare size={'1.5rem'} />
    </SocialButton>
  );
}

export function GitHubButton({ channel }) {
  return (
    <SocialButton network={'github'} channel={channel}>
      <FaGithub size={'1.5rem'} />
    </SocialButton>
  );
}

export function YouTubeButton({ channel }) {
  return (
    <SocialButton network={'youtube'} channel={channel}>
      <FaYoutube size={'1.5rem'} />
    </SocialButton>
  );
}

export function InstagramButton({ channel }) {
  return (
    <SocialButton network={'instagram'} channel={channel}>
      <FaInstagram size={'1.5rem'} />
    </SocialButton>
  );
}

export function DiscordButton({ channel }) {
  return (
    <SocialButton network={'discord'} channel={channel}>
      <FaDiscord size={'1.5rem'} />
    </SocialButton>
  );
}

export function HomepageButton({ channel }) {
  return (
    <SocialButton network={'homepage'} channel={channel}>
      <FaHome size={'1.5rem'} />
    </SocialButton>
  );
}
