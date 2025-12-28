from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import re
from urllib.parse import urlparse
import time
import json
from typing import Optional, List

# Default thumbnail for videos without thumbnails
DEFAULT_THUMBNAIL = "/assets/images/default-thumbnail.svg"

app = FastAPI(title="Topperinator API", version="1.0.0")

APP_ORIGIN = os.getenv("APP_ORIGIN", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_ORIGIN],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-APP-KEY", "Origin"],
)

class ExtractRequest(BaseModel):
    videoId: str
    options: Optional[dict] = None

class ExtractResponse(BaseModel):
    success: bool
    transcript: str = ""
    wordCount: int = 0
    error: Optional[str] = None

class VideoInfo(BaseModel):
    id: str
    title: str
    thumbnail: str
    channelName: Optional[str] = None

class PlaylistRequest(BaseModel):
    playlistUrl: str

class ChannelRequest(BaseModel):
    channelUrl: str
    maxVideos: Optional[int] = 50  # Limit to prevent abuse

class VideoListResponse(BaseModel):
    success: bool
    videos: List[VideoInfo] = []
    playlistName: Optional[str] = None
    channelName: Optional[str] = None
    error: Optional[str] = None

# Rate limiting: 16 requests per 14 days per IP
RATE_LIMIT_MAX = 16
RATE_LIMIT_WINDOW_SECONDS = 14 * 24 * 60 * 60
_rate_limit_store: dict[str, list[float]] = {}


def enforce_rate_limit(ip: str):
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW_SECONDS
    timestamps = _rate_limit_store.get(ip, [])
    # Keep only recent timestamps inside the window
    fresh = [t for t in timestamps if t >= window_start]
    if len(fresh) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Rate limit exceeded: 16 requests per 14 days per IP")
    fresh.append(now)
    _rate_limit_store[ip] = fresh

def extract_subtitles(video_id: str, format: str = "txt", include_timestamps: bool = False) -> dict:
    """Extract subtitles using yt-dlp"""
    import os
    import tempfile
    
    url = f"https://www.youtube.com/watch?v={video_id}"
    
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            ydl_opts = {
                'quiet': False,
                'no_warnings': True,
                'writesubtitles': True,
                'writeautomaticsub': True,
                'skip_download': True,
                'outtmpl': os.path.join(tmpdir, '%(id)s'),
                'subtitlesformat': 'srt',
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                print(f"Fetching info for {video_id}...")
                # Trigger download flow only for subtitles; media download is skipped by 'skip_download'
                info = ydl.extract_info(url, download=True)
                
                # List files in temp directory
                files = os.listdir(tmpdir)
                print(f"Files in temp dir: {files}")
                
                # Find .srt or .vtt file
                srt_file = None
                for ext in ['.en.srt', '.srt', '.en.vtt', '.vtt']:
                    for f in files:
                        if f.endswith(ext):
                            srt_file = os.path.join(tmpdir, f)
                            print(f"Found subtitle file: {f}")
                            break
                    if srt_file:
                        break
                
                if not srt_file:
                    print(f"No subtitle file found. Available files: {files}")
                    return {"success": False, "error": "No subtitle file found"}
                
                with open(srt_file, 'r', encoding='utf-8') as f:
                    srt_data = f.read()
                
                if not srt_data or len(srt_data.strip()) == 0:
                    return {"success": False, "error": "Subtitle file is empty"}
                
                transcript = parse_srt(srt_data, format, include_timestamps)
                word_count = len(transcript.split())
                
                return {
                    "success": True,
                    "transcript": transcript,
                    "wordCount": word_count
                }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Error extracting transcript: {str(e)}"
        }

def parse_srt(content: str, format: str = "txt", include_timestamps: bool = False) -> str:
    """Parse SRT or VTT format to different output formats"""
    
    lines = content.strip().split('\n')
    if lines and lines[0].startswith('WEBVTT'):
        lines = lines[1:]
    
    transcripts = []
    
    i = 0
    while i < len(lines):
        if not lines[i].strip():
            i += 1
            continue
            
        # SRT: HH:MM:SS,mmm --> HH:MM:SS,mmm
        # VTT: HH:MM:SS.mmm --> HH:MM:SS.mmm
        current_line = lines[i].strip()
        
        if '-->' in current_line:
            timestamp = current_line
            start_time = timestamp.split(' --> ')[0].strip()
            i += 1
            
            text = []
            while i < len(lines) and lines[i].strip():
                text_line = lines[i].strip()
                if '-->' not in text_line and not text_line.startswith('WEBVTT'):
                    text.append(text_line)
                i += 1
            
            text_str = ' '.join(text)
            if text_str:  # Only add if text is not empty
                transcripts.append({
                    'timestamp': start_time,
                    'text': text_str
                })
        else:
            i += 1
    
    # Format output
    if format == 'json':
        return json.dumps(transcripts, indent=2)
    elif format == 'srt' or format == 'vtt':
        return content
    else:  # txt
        if include_timestamps:
            return '\n'.join([f"[{t['timestamp']}] {t['text']}" for t in transcripts])
        else:
            return ' '.join([t['text'] for t in transcripts])

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/favicon.ico")
async def favicon():
    """Favicon endpoint - returns 204 to silence browser requests"""
    from fastapi.responses import Response
    return Response(status_code=204)

@app.post("/api/extract", response_model=ExtractResponse)
async def extract_transcript(req: Request, request: ExtractRequest):
    """Extract YouTube transcript"""

    enforce_rate_limit(req.client.host if req.client else "unknown")
    
    if not request.videoId:
        raise HTTPException(status_code=400, detail="videoId is required")
    
    options = request.options or {}
    format = options.get('format', 'txt')
    include_timestamps = options.get('includeTimestamps', False)
    
    print(f"=== Transcript Extraction Request ===")
    print(f"Video ID: {request.videoId}")
    print(f"Format: {format}, Include timestamps: {include_timestamps}")
    
    result = extract_subtitles(request.videoId, format, include_timestamps)

    if not result.get('success'):
        raise HTTPException(status_code=400, detail="Failed to extract transcript")

    return ExtractResponse(
        success=True,
        transcript=result['transcript'],
        wordCount=result['wordCount']
    )

def extract_playlist_videos(playlist_url: str) -> dict:
    """Extract video information from a YouTube playlist"""
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': 'in_playlist',  # Extract flat for faster performance
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Extracting playlist info from: {playlist_url}")
            info = ydl.extract_info(playlist_url, download=False)
            
            videos = []
            playlist_name = info.get('title', 'Playlist')
            
            print(f"Playlist name: {playlist_name}")
            print(f"Found {len(info.get('entries', []))} entries")
            
            if 'entries' in info:
                for idx, entry in enumerate(info['entries']):
                    if entry is None:
                        print(f"Skipping None entry at index {idx}")
                        continue
                    
                    video_id = entry.get('id')
                    if not video_id:
                        print(f"No ID found for entry at index {idx}")
                        continue
                    
                    print(f"Adding video {idx + 1}: {video_id} - {entry.get('title', 'Unknown')}")
                    videos.append({
                        'id': video_id,
                        'title': entry.get('title', 'Unknown'),
                        'thumbnail': entry.get('thumbnail') or (entry.get('thumbnails', [{}])[0].get('url') if entry.get('thumbnails') else None) or DEFAULT_THUMBNAIL,
                        'channelName': entry.get('channel', '')
                    })
            
            print(f"Successfully extracted {len(videos)} videos from playlist")
            return {
                "success": True,
                "videos": videos,
                "playlistName": playlist_name
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Error extracting playlist: {str(e)}"
        }

def extract_channel_videos(channel_url: str, max_videos: int = 50) -> dict:
    """Extract video information from a YouTube channel"""
    try:
        # For channels, we need to append /videos to get the videos tab
        if '/videos' not in channel_url:
            if channel_url.endswith('/'):
                channel_url = f"{channel_url}videos"
            else:
                channel_url = f"{channel_url}/videos"
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': 'in_playlist',  # Extract flat for faster performance
            'skip_download': True,
            'playlistend': max_videos,  # Limit number of videos
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Extracting channel videos from: {channel_url}")
            info = ydl.extract_info(channel_url, download=False)
            
            videos = []
            channel_name = info.get('channel', info.get('uploader', info.get('title', 'Channel')))
            
            print(f"Channel name: {channel_name}")
            print(f"Found {len(info.get('entries', []))} entries")
            
            if 'entries' in info:
                for idx, entry in enumerate(info['entries']):
                    if entry is None:
                        print(f"Skipping None entry at index {idx}")
                        continue
                    
                    video_id = entry.get('id') or entry.get('url')
                    if not video_id:
                        print(f"No ID found for entry at index {idx}: {entry}")
                        continue
                    
                    # Extract video ID from URL if needed
                    if 'youtube.com' in str(video_id) or 'youtu.be' in str(video_id):
                        import re
                        match = re.search(r'(?:v=|/)([a-zA-Z0-9_-]{11})', video_id)
                        if match:
                            video_id = match.group(1)
                        else:
                            print(f"Could not extract video ID from URL: {video_id}")
                            continue
                    
                    # Ensure we're not using channel IDs as video IDs
                    if video_id.startswith('UC') and len(video_id) > 15:
                        print(f"Skipping channel ID mistaken as video ID: {video_id}")
                        continue
                    
                    # Validate video ID format (11 characters, alphanumeric + _ -)
                    if len(video_id) != 11:
                        print(f"Invalid video ID length ({len(video_id)}): {video_id}")
                        continue
                    
                    print(f"Adding video {idx + 1}: {video_id} - {entry.get('title', 'Unknown')}")
                    videos.append({
                        'id': video_id,
                        'title': entry.get('title', 'Unknown'),
                        'thumbnail': entry.get('thumbnail') or (entry.get('thumbnails', [{}])[0].get('url') if entry.get('thumbnails') else None) or DEFAULT_THUMBNAIL,
                        'channelName': entry.get('channel', channel_name)
                    })
            
            print(f"Successfully extracted {len(videos)} videos from channel")
            return {
                "success": True,
                "videos": videos,
                "channelName": channel_name
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Error extracting channel: {str(e)}"
        }

@app.post("/api/playlist/videos", response_model=VideoListResponse)
async def get_playlist_videos(req: Request, request: PlaylistRequest):
    """Get list of videos from a YouTube playlist"""
    enforce_rate_limit(req.client.host if req.client else "unknown")
    if not request.playlistUrl:
        raise HTTPException(status_code=400, detail="playlistUrl is required")

    # Allow only YouTube URLs to prevent SSRF
    if not is_allowed_youtube_url(request.playlistUrl):
        raise HTTPException(status_code=400, detail="Invalid playlist URL")
    
    result = extract_playlist_videos(request.playlistUrl)

    if not result.get('success'):
        raise HTTPException(status_code=400, detail="Failed to fetch playlist videos")

    return VideoListResponse(
        success=True,
        videos=result['videos'],
        playlistName=result.get('playlistName')
    )

@app.post("/api/channel/videos", response_model=VideoListResponse)
async def get_channel_videos(req: Request, request: ChannelRequest):
    """Get list of videos from a YouTube channel"""
    enforce_rate_limit(req.client.host if req.client else "unknown")
    if not request.channelUrl:
        raise HTTPException(status_code=400, detail="channelUrl is required")

    # Allow only YouTube URLs to prevent SSRF
    if not is_allowed_youtube_url(request.channelUrl):
        raise HTTPException(status_code=400, detail="Invalid channel URL")

    # Clamp maxVideos to a safe range
    max_videos = request.maxVideos or 50
    if max_videos < 1:
        max_videos = 1
    if max_videos > 50:
        max_videos = 50
    
    result = extract_channel_videos(request.channelUrl, max_videos)

    if not result.get('success'):
        raise HTTPException(status_code=400, detail="Failed to fetch channel videos")

    return VideoListResponse(
        success=True,
        videos=result['videos'],
        channelName=result.get('channelName')
    )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Topperinator API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "extract": "/api/extract",
            "playlist": "/api/playlist/videos",
            "channel": "/api/channel/videos"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# --- Helpers ---
def is_allowed_youtube_url(url: str) -> bool:
    """Allow only YouTube and youtu.be URLs with http/https schemes."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        host = (parsed.hostname or "").lower()
        return host.endswith("youtube.com") or host == "youtu.be"
    except Exception:
        return False
