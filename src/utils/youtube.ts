export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractPlaylistId(url: string): string | null {
  const patterns = [
    /[?&]list=([^&\n?#]+)/,
    /youtube\.com\/playlist\?list=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractChannelId(url: string): string | null {
  const patterns = [
    /youtube\.com\/@([^/\n?#]+)/,
    /youtube\.com\/channel\/([^/\n?#]+)/,
    /youtube\.com\/c\/([^/\n?#]+)/,
    /youtube\.com\/user\/([^/\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractVideoIdFromShortUrl(url: string): string | null {
  const shortUrlRegex = /(?:youtu\.be\/([^?]+))/;
  const match = url.match(shortUrlRegex);
  return match ? match[1] : null;
}

export function normalizePlaylistUrl(url: string): string {
  const playlistId = extractPlaylistId(url);
  if (playlistId) {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
  }
  return url;
}

export function normalizeChannelUrl(url: string): string {
  const channelId = extractChannelId(url);
  if (channelId) {
    // Check if it's already a channel ID (starts with UC) or a handle
    if (channelId.startsWith('UC') || channelId.startsWith('@')) {
      return `https://www.youtube.com/@${channelId.replace('@', '')}`;
    }
    return `https://www.youtube.com/@${channelId}`;
  }
  return url;
}

