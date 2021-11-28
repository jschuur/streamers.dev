export default ({ username, children }) => (
  <a target='_blank' href={`https://twitch.tv/${username}`}>
    {children}
  </a>
);
