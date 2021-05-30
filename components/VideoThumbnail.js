export default function VideoThumbnail({ username, width, height }) {
  return (
    <img
      width={width}
      height={height}
      src={`https://static-cdn.jtvnw.net/previews-ttv/live_user_${username}-${width}x${height}.jpg`}
      alt={`Channel preview for ${username}`}
    />
  );
}
