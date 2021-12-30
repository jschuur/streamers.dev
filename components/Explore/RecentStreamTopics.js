import Link from 'next/link';

import Badge from '../Badge';

function RecentStreamTopicsBadge({ name, count, slug }) {
  const url = `/?topic=${slug}`;
  let color = 'gray';

  if (count >= 100) color = 'purple';
  else if (count >= 25) color = 'red';
  else if (count >= 10) color = 'green';
  else if (count > 1) color = 'blue';

  return (
    <Link href={url} passHref>
      <Badge color={color}>
        {name} ({count})
      </Badge>
    </Link>
  );
}

export default function RecentStreamTopics({ topicPopularity }) {
  return (
    <>
      {topicPopularity.map((topic) => (
        <RecentStreamTopicsBadge key={topic.name} {...topic} />
      ))}
    </>
  );
}
