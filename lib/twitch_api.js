import _, { chunk } from 'lodash';
import { ApiClient } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';

// TODO: Use RefreshableAuthProvider
const authProvider = new ClientCredentialsAuthProvider(
  process.env.TWITCH_CLIENT_ID,
  process.env.TWITCH_CLIENT_SECRET
);
const apiClient = new ApiClient({ authProvider });

// The Twitch API allows lookups in chunks of up to 100 for some types, so batch those API calls
async function twitchAPIinChunks({
  method,
  data,
  chunkSize = 100,
  buildOptions = (a) => a,
  buildResults = (a) => a,
}) {
  let results = [];
  const [modelName, methodName] = method.split('.');

  for (const dataChunk of chunk(data, chunkSize)) {
    const chunkResponse = await apiClient.helix[modelName][methodName](buildOptions(dataChunk));
    const chunkResults = buildResults(chunkResponse);

    if (chunkResults?.length) results.push(...chunkResults);
  }

  return results;
}

async function twitchAPIPaginated({ method, options }) {
  const [modelName, methodName] = method.split('.');

  return apiClient.helix[modelName][methodName](options).getAll();
}

export async function twitchGetStreamsAll(options) {
  return twitchAPIPaginated({
    method: 'streams.getStreamsPaginated',
    options,
  });
}

export async function twitchGetStreamsByIds(data) {
  return twitchAPIinChunks({
    method: 'streams.getStreams',
    data,
    buildOptions: (dataChunk) => ({ userId: dataChunk }),
    buildResults: (results) => results.data,
  });
}

export async function twitchGetUsersByIds(data) {
  return twitchAPIinChunks({ method: 'users.getUsersByIds', data });
}

export async function twitchGetUsersByNames(data) {
  return twitchAPIinChunks({ method: 'users.getUsersByNames', data });
}

export async function twitchGetStreamTagsByIds(data) {
  return twitchAPIinChunks({ method: 'tags.getStreamTagsByIds', data });
}