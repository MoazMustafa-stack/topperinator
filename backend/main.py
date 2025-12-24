from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import json
from typing import Optional

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

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Topperinator API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "extract": "/api/extract"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
