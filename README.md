# Topper-inator

[![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.1-blue?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

A powerful web application for extracting YouTube transcripts at scale. Built with modern web technologies and designed for seamless transcript extraction from single videos, playlists, and entire channels.

---

## Features

**Video Transcript Extraction**
- Extract transcripts from single YouTube videos
- Batch process entire playlists
- Scrape entire channel content
- Multiple output formats (TXT, JSON, SRT)
- Optional timestamp inclusion

**User Authentication**
- Secure authentication via Supabase
- Protected dashboard with user profiles
- Session management with middleware protection

**Advanced Formatting**
- Plain text export with formatting options
- JSON structured data output
- SRT subtitle format support
- Configurable timestamp precision

---

## Tech Stack

**Frontend**
- [Next.js 16](https://nextjs.org) - React framework with App Router
- [React 19](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling with custom theme
- [shadcn/ui](https://ui.shadcn.com) - Pre-built UI components

**Backend & Database**
- [Supabase](https://supabase.com) - Authentication and PostgreSQL
- Next.js API Routes - Serverless backend
- Row Level Security (RLS) - Database protection

**Libraries**
- [youtube-transcript](https://www.npmjs.com/package/youtube-transcript) - Transcript fetching
- [Lucide React](https://lucide.dev) - Icon library

---


## Usage

### Extract a Single Video
1. Navigate to the Extractor page
2. Select "Single Video" mode
3. Paste the YouTube URL
4. Choose format and options
5. Click "Extract Transcripts"

### Batch Processing
1. Select "Playlist" or "Channel" mode
2. Paste the playlist/channel URL
3. Select your output preferences
4. Process multiple videos at once

### Output Formats
- **TXT** - Plain text with optional timestamps
- **JSON** - Structured data with metadata
- **SRT** - Subtitle format for video editors

---

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication pages (sign-up, sign-in)
│   ├── api/            # API routes (transcript extraction)
│   ├── dashboard/      # Protected user dashboard
│   └── extractor/      # Main transcript extractor
├── components/         # Reusable React components
│   ├── extractor/      # Feature-specific components
│   └── ui/             # shadcn/ui components
├── constants/          # App-wide configuration
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```



## API Endpoints

**POST /api/extract**
Extract transcript from a video.

Request:
```json
{
  "videoId": "dQw4w9WgXcQ",
  "options": {
    "format": "txt",
    "includeTimestamps": true,
    "language": "en"
  }
}
```

Response:
```json
{
  "success": true,
  "transcript": "...",
  "wordCount": 1234
}
```

---

## Development Notes

- Middleware handles authentication for protected routes
- Supabase RLS policies secure the database
- Client-side validation before API calls
- Error handling with user-friendly messages

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## License

MIT License - see LICENSE file for details

---

## Support

For issues and questions:
- Open a GitHub issue
- Check the documentation
- Review existing issues for solutions

---

Built with care for transcript extraction at scale.
