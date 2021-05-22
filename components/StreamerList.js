import React from 'react';
import sortBy from 'lodash/sortby';
import { intervalToDuration, formatDuration } from 'date-fns';

export default function StreamerList({ users }) {
  return (
    <ul>
      {users &&
        sortBy(users, 'isLive')
          .reverse()
          .map((user) => {
            let userInfo;

            if (user.isLive)
              userInfo = (
                <>
                  <a href={`https://twitch.tv/${user.name}`}>{user.displayName}</a> (live:{' '}
                  {user.latestStreamTitle}{' '}
                  {formatDuration(
                    intervalToDuration({ start: user.latestStreamStartedAt, end: new Date() })
                  )}
                  )
                </>
              );
            else userInfo = <>{user.displayName} (offline)</>;

            return <li key={user.twitchId}>{userInfo}</li>;
          })}
    </ul>
  );
}
