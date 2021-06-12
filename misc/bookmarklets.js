// Create bookmarklets at https://caiorss.github.io/bookmarklet-maker/ or https://mrcoles.com/bookmarklet/

// addChannel
const SECRET = '';
// const SITE_URL = 'https://streamers.dev';
const SITE_URL = 'http://localhost:3000';

const url = window.location.href;
const match = url.match(/https?:\/\/(?:www\.)?twitch.tv\/([\w]*)\/?/i);

if (match) {
  const channelName = match[1];

  const options = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channelName, secret: SECRET }),
    // body: JSON.stringify({ channelName, secret: SECRET, backlog: 1 }),
  };

  fetch(`${SITE_URL}/api/addChannel`, options)
    .then((res) => res.json())
    .then(({ message, error }) => {
      if (message) window.alert(message);
      else if (error) window.alert(`Error: ${error}`);
    });
} else window.alert('Not on a Twitch profile URL');
