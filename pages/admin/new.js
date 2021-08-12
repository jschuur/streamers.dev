import { formatDistanceToNow } from 'date-fns';
import { sortBy } from 'lodash';
import { AdminProvider } from '../../lib/stores';
import { NextSeo } from 'next-seo';
import { getSession } from 'next-auth/client';

import Layout from '../../components/Layout/Layout';
import Section from '../../components/Layout/Section';
import { TwitchLink } from '../../lib/util';

import { getNewChannels } from '../../lib/db';

import { adminAuthorised } from '../../lib/util';

export default function AdminNewChannels({ newChannels }) {
  let previousTimeHeader;

  return (
    <Layout page='Admin Dashboard - New Channels'>
      <NextSeo noindex nofollow />

      <Section className='p-2'>
        {newChannels?.length ? (
          <div>
            <h2 className='font-header text-lg sm:text-xl mb-1'>
              Recently added channels without details ({newChannels.length}):
            </h2>
            <ul>
              {sortBy(newChannels, 'createdAt')
                .reverse()
                .map((channel) => {
                  const timeAgo = formatDistanceToNow(new Date(channel.createdAt), {
                    addSuffix: true,
                  });
                  const timeHeader =
                    timeAgo == previousTimeHeader ? null : (
                      <h3 className='font-header sm:text-sm mt-2'> {timeAgo}</h3>
                    );
                  previousTimeHeader = timeAgo;

                  return (
                    <li key={channel.name}>
                      {timeHeader}
                      <TwitchLink username={channel.name}>{channel.name}</TwitchLink>
                    </li>
                  );
                })}
            </ul>
          </div>
        ) : (
          <div>No new channels in need of updating found</div>
        )}
      </Section>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!adminAuthorised({ session })) return { redirect: { destination: '/', statusCode: 302 } };

  const newChannels = await getNewChannels();

  return { props: { newChannels } };
}
