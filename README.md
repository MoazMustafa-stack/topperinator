# Topper-inator

> **Never miss a lecture again** ✨ Extract YouTube transcripts instantly with a sleek, modern interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)](https://python.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

## What is Topper-inator?

A full-stack web application that transforms YouTube videos into readable transcripts. Perfect for students who want to:
- 📚 Study lectures without watching the entire video
- 🎯 Search through transcript content instantly
- 📝 Export in multiple formats (TXT, JSON, SRT)
- 🔐 Save your favorite transcripts securely

---

## Why Build This?

YouTube transcripts are goldmines for learning, but accessing them is clunky. Topper-inator makes it seamless—paste a link, get a transcript, study smarter. Built as a learning project showcasing modern full-stack development with Next.js and Python.

---

## Tech Stack

**Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui  
**Backend**: FastAPI (Python), yt-dlp  
**Database**: Supabase (Auth + PostgreSQL)  

---

## Features at a Glance

✨ **Smart Extraction** - Pulls transcripts directly from YouTube with zero hassle  
🎨 **Beautiful UI** - Modern, responsive design that feels great on any device  
🔒 **Secure Auth** - User authentication via Supabase  
📤 **Multiple Formats** - Export as TXT, JSON, or SRT subtitle files  
⚡ **Fast Processing** - Optimized backend for instant results  

---

## Architecture

```
Frontend (Next.js) → API Proxy → Python Backend (FastAPI) → YouTube
```

Clean separation: React UI handles the beautiful frontend, Python handles the heavy lifting of transcript extraction.

---

## Project Structure

```
topperinator/
├── src/                 # React/Next.js code
│   ├── app/            # Pages and API routes
│   ├── components/      # Reusable UI components
│   ├── lib/            # Utilities and helpers
│   └── ...
├── backend/            # Python FastAPI server
│   ├── main.py         # FastAPI app with transcript extraction
│   └── requirements.txt # Dependencies
└── ...
```

---

## Built For Learning

This project demonstrates:
- Full-stack web development with modern frameworks
- Frontend-backend integration and API design
- Python async programming with FastAPI
- User authentication and secure databases

Perfect for portfolio projects, learning full-stack development, or understanding how to integrate multiple technologies.

---

## Community

Have ideas for Topper-inator? Love transcripts? Found a bug? Contributions welcome!

---

*Built by a student, for students.* 🚀
