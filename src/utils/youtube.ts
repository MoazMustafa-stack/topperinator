export function extractVideoId(url: string): string | null {
  const videoIdRegex = /(?:v=([^&]+))/;
  const match = url.match(videoIdRegex);
  return match ? match[1] : null;
}

export function extractPlaylistId(url: string): string | null {
  const playlistIdRegex = /(?:list=([^&]+))/;
  const match = url.match(playlistIdRegex);
  return match ? match[1] : null;
}

export function extractChannelId(url: string): string | null {
  const channelIdRegex = /(?:@([^&]+))/;
  const match = url.match(channelIdRegex);
  return match ? match[1] : null;
}

export function extractVideoIdFromShortUrl(url: string): string | null {
  const shortUrlRegex = /(?:youtu\.be\/([^?]+))/;
  const match = url.match(shortUrlRegex);
  return match ? match[1] : null;
}

