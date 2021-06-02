import { pick, sortBy } from 'lodash';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default function Queue({ queue }) {
  return (
    <div>
      <h1 className='text-2xl p-1'>Queues</h1>

      <h2 className='text-xl p-1'>Web Development</h2>

      <ul>
        {queue &&
          queue.map((channel) => (
            <li>
              <a href={`https://twitch.tv/${channel.name}`}>{channel.name}</a> ({channel.language}{' '}
              {channel.views}: {channel.title})
            </li>
          ))}
      </ul>
    </div>
  );
}

export async function getServerSideProps() {
  const result = await prisma.queue.findMany({
    where: {
      status: 'PENDING',
    },
  });

  const queue = sortBy(
    result.map((channel) => pick(channel, ['name', 'title', 'language', 'views', 'viewers'])),
    'views'
  ).reverse();

  return { props: { queue } };
}
