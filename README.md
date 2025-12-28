# Topper-inator

> **YouTube Transcript Extractor at Scale** - Extract transcripts from single videos, playlists, or entire channels instantly.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)

---

## Features

### Core Functionality
-  **Single Video Extraction** - Extract transcript from any YouTube video
-  **Playlist Mode** - Batch extract from entire playlists
-  **Channel Mode** - Extract from channel's videos (up to 50 videos)
-  **Multiple Formats** - Export as TXT, JSON, or SRT
-  **Timestamp Options** - Toggle timestamp inclusion
-  **Real-time Progress** - Live status updates during batch extraction

### User Interface

-  **URL Validation** - Real-time YouTube URL verification
-  **Metadata Preview** - Shows video/channel info before extraction
-  **Stats Dashboard** - Success/failure counts, total word count
-  **Bulk Actions** - Download all as ZIP, copy all to clipboard
-  **Help Section** - Interactive guide for features

### Technical
-  **Authentication** - Supabase Auth with protected routes
-  **Database** - PostgreSQL with Row-Level Security
-  **Error Handling** - Graceful failures with detailed error messages
-  **Default Thumbnails** - Fallback SVG for videos without thumbnails
-  **API Testing** - Postman collections included

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- JSZip for bulk downloads

**Backend**
- FastAPI (Python)
- yt-dlp for YouTube extraction
- Uvicorn server

**Database & Auth**
- Supabase (PostgreSQL + Auth)



## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

*Built for students by a student*
