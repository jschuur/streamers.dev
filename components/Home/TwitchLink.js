export default function TwitchLink({ username, children }) {
  return (
    <a target='_blank' href={`https://twitch.tv/${username}`} rel='noreferrer'>
      {children}
    </a>
  );
}
