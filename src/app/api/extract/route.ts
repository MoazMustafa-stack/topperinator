import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { videoId, options } = body;

        if (!videoId) {
            return NextResponse.json(
                { success: false, error: "Video ID is required" },
                { status: 400 }
            );
        }

        console.log(`=== Transcript Extraction Request ===`);
        console.log(`Video ID: ${videoId}`);
        console.log(`Forwarding to Python API: ${PYTHON_API_URL}`);

        // Call Python backend
        const response = await fetch(`${PYTHON_API_URL}/api/extract`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoId, options }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Python API error:", error);
            return NextResponse.json(
                {
                    success: false,
                    error: error.detail || "Failed to extract transcript",
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log(`✓ Transcript extracted. Word count: ${result.wordCount}`);

        return NextResponse.json(result);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`✗ API Error:`, errorMessage);
        return NextResponse.json(
            {
                success: false,
                error: `Failed to extract transcript: ${errorMessage}`,
            },
            { status: 400 }
        );
    }
}
