import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";
const APP_ORIGIN = process.env.APP_ORIGIN;
const API_TOKEN = process.env.API_TOKEN;

function isAllowedYouTubeUrl(url: string): boolean {
    try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase();
        return u.protocol === "http:" || u.protocol === "https:" ? (host.endsWith("youtube.com") || host === "youtu.be") : false;
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const origin = request.headers.get("origin") || request.headers.get("Origin");
        const token = request.headers.get("X-APP-KEY");
        if (APP_ORIGIN && origin !== APP_ORIGIN) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
        if (API_TOKEN && token !== API_TOKEN) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { playlistUrl } = body;

        if (!playlistUrl) {
            return NextResponse.json(
                { success: false, error: "Playlist URL is required" },
                { status: 400 }
            );
        }

        console.log(`=== Playlist Extraction Request ===`);
        console.log(`Playlist URL: ${playlistUrl}`);

        if (!isAllowedYouTubeUrl(playlistUrl)) {
            return NextResponse.json(
                { success: false, error: "Invalid playlist URL" },
                { status: 400 }
            );
        }

        const response = await fetch(`${PYTHON_API_URL}/api/playlist/videos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ playlistUrl }),
        });

        if (!response.ok) {
            console.error("Python API error status", response.status);
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to extract playlist videos",
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log(`Playlist extracted. Videos: ${result.videos?.length || 0}`);

        return NextResponse.json(result);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`API Error:`, errorMessage);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to extract playlist",
            },
            { status: 400 }
        );
    }
}

