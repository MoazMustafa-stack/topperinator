import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { channelUrl, maxVideos } = body;

        if (!channelUrl) {
            return NextResponse.json(
                { success: false, error: "Channel URL is required" },
                { status: 400 }
            );
        }

        console.log(`=== Channel Extraction Request ===`);
        console.log(`Channel URL: ${channelUrl}`);

        const response = await fetch(`${PYTHON_API_URL}/api/channel/videos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ channelUrl, maxVideos: maxVideos || 50 }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Python API error:", error);
            return NextResponse.json(
                {
                    success: false,
                    error: error.detail || "Failed to extract channel videos",
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log(`Channel extracted. Videos: ${result.videos?.length || 0}`);

        return NextResponse.json(result);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`API Error:`, errorMessage);
        return NextResponse.json(
            {
                success: false,
                error: `Failed to extract channel: ${errorMessage}`,
            },
            { status: 400 }
        );
    }
}

