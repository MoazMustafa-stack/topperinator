// App-wide constants
export const COLORS = {
  primary: '#c4ff0e',
  background: '#1a1a1a',
  error: '#ff3b30',
} as const;

export const API_ENDPOINTS = {
  extract: '/api/extract',
  playlistVideos: '/api/playlist/videos',
  channelVideos: '/api/channel/videos',
} as const;

export const VALIDATION = {
  debounceDelay: 500,
} as const;

export const YOUTUBE_PATTERNS = {
  videoId: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ],
  playlistId: [
    /[?&]list=([^&\n?#]+)/,
    /youtube\.com\/playlist\?list=([^&\n?#]+)/,
  ],
  channelId: [
    /youtube\.com\/@([^/\n?#]+)/,
    /youtube\.com\/channel\/([^/\n?#]+)/,
    /youtube\.com\/c\/([^/\n?#]+)/,
    /youtube\.com\/user\/([^/\n?#]+)/,
  ],
} as const;

export const ASSETS = {
  defaultThumbnail: '/assets/images/default-thumbnail.svg',
} as const;
