import React from 'react';
import {
  FaTwitterSquare,
  FaGithub,
  FaYoutube,
  FaDiscord,
  FaInstagram,
  FaHome,
} from 'react-icons/fa';

function SocialLink({ network, user, children }) {
  let link = user[network];

  if (!link) return null;

  if (network === 'twitter') link = `https://twitter.com/${link}`;
  else if (network === 'github') link = `https://github.com/${link}`;
  else if (network === 'instagram') link = `https://instagram.com/${link}`;

  return <a href={link}>{children}</a>;
}

function SocialButton({ network, user, children }) {
  return (
    <SocialLink network={network} user={user}>
      {children}
    </SocialLink>
  );
}

export function TwitterButton({ user }) {
  return (
    <SocialButton network={'twitter'} user={user}>
      <FaTwitterSquare size={'1.5rem'} />
    </SocialButton>
  );
}

export function GitHubButton({ user }) {
  return (
    <SocialButton network={'github'} user={user}>
      <FaGithub size={'1.5rem'} />
    </SocialButton>
  );
}

export function YouTubeButton({ user }) {
  return (
    <SocialButton network={'youtube'} user={user}>
      <FaYoutube size={'1.5rem'} />
    </SocialButton>
  );
}

export function InstagramButton({ user }) {
  return (
    <SocialButton network={'instagram'} user={user}>
      <FaInstagram size={'1.5rem'} />
    </SocialButton>
  );
}

export function DiscordButton({ user }) {
  return (
    <SocialButton network={'discord'} user={user}>
      <FaDiscord size={'1.5rem'} />
    </SocialButton>
  );
}

export function HomepageButton({ user }) {
  return (
    <SocialButton network={'homepage'} user={user}>
      <FaHome size={'1.5rem'} />
    </SocialButton>
  );
}
