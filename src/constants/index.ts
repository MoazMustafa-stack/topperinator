// App-wide constants for configuration, API endpoints, and validation

export const COLORS = {
  // Primary green theme color (for reference, used in Tailwind classes)
  primary: '#c4ff0e',
  primaryHover: '#d4ff3e',
  background: '#1a1a1a',
  backgroundSecondary: '#0a0a0a',
  text: '#ffffff',
} as const;

export const API_ENDPOINTS = {
  youtube: {
    oembed: 'https://www.youtube.com/oembed',
  },
} as const;

export const VALIDATION = {
  debounceDelay: 500, // ms for URL validation
  maxRetries: 3,
} as const;

export const UI_CONFIG = {
  borderWidth: 3, // pixels
  animationDuration: 200, // ms
} as const;

export const YOUTUBE_PATTERNS = {
  videoId: [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ],
} as const;