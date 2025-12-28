from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import json
from typing import Optional, List

# Default thumbnail for videos without thumbnails
DEFAULT_THUMBNAIL = "/assets/images/default-thumbnail.svg"

app = FastAPI(title="Topperinator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
                'subtitle format': 'srt',
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                print(f"Fetching info for {video_id}...")
                info = ydl.extract_info(url, download=True)  # Need download=True to get subtitles
                
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
async def extract_transcript(request: ExtractRequest):
    """Extract YouTube transcript"""
    
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
        raise HTTPException(status_code=400, detail=result.get('error', 'Unknown error'))
    
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
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': 'in_playlist',  # Extract flat for faster performance
            'skip_download': True,
            'playlistend': max_videos,  # Limit number of videos
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"Extracting channel info from: {channel_url}")
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
                    
                    video_id = entry.get('id')
                    if not video_id:
                        print(f"No ID found for entry at index {idx}: {entry}")
                        continue
                    
                    # Ensure we're not using channel IDs as video IDs
                    if video_id.startswith('UC') and len(video_id) > 15:
                        print(f"Skipping channel ID mistaken as video ID: {video_id}")
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
async def get_playlist_videos(request: PlaylistRequest):
    """Get list of videos from a YouTube playlist"""
    if not request.playlistUrl:
        raise HTTPException(status_code=400, detail="playlistUrl is required")
    
    result = extract_playlist_videos(request.playlistUrl)
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error', 'Unknown error'))
    
    return VideoListResponse(
        success=True,
        videos=result['videos'],
        playlistName=result.get('playlistName')
    )

@app.post("/api/channel/videos", response_model=VideoListResponse)
async def get_channel_videos(request: ChannelRequest):
    """Get list of videos from a YouTube channel"""
    if not request.channelUrl:
        raise HTTPException(status_code=400, detail="channelUrl is required")
    
    result = extract_channel_videos(request.channelUrl, request.maxVideos or 50)
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error', 'Unknown error'))
    
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
