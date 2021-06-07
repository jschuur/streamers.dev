export default function Footer({ channels }) {
  return (
    <footer className='text-right text-xs text-gray-400 mt-3 px-2'>
      <a href='https://trello.com/b/a9k1kC65'>Work in progress</a> by{' '}
      <a href='https://twitter.com/joostschuur/'>Joost Schuur</a>.{' '}
      <a href='https://twitter.com/StreamersDev'>@StreamersDev</a>
      <br />
      Currently tracking {channels && channels.length} channels.
    </footer>
  );
}
