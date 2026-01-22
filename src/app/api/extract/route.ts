import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";
const APP_ORIGIN = process.env.APP_ORIGIN;
const API_TOKEN = process.env.API_TOKEN;

const VIDEO_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export async function POST(request: NextRequest) {
    try {
        const requestId = crypto.randomUUID();
        const startTime = Date.now();
        // Basic origin and token check (optional if env not set)
        const origin = request.headers.get("origin") || request.headers.get("Origin");
        const token = request.headers.get("X-APP-KEY");
        if (APP_ORIGIN && origin !== APP_ORIGIN) {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
        if (API_TOKEN && token !== API_TOKEN) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { videoId, options } = body;

        if (!videoId) {
            return NextResponse.json(
                { success: false, error: "Video ID is required" },
                { status: 400 }
            );
        }

        if (!VIDEO_ID_RE.test(videoId)) {
            return NextResponse.json(
                { success: false, error: "Invalid Video ID" },
                { status: 400 }
            );
        }

        console.log(
            JSON.stringify({
                event: "extract.request",
                requestId,
                videoId,
                ts: new Date().toISOString(),
            })
        );
        console.log(`Forwarding to Python API: ${PYTHON_API_URL}`);

        // Call Python backend
        const response = await fetch(`${PYTHON_API_URL}/api/extract`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Request-Id": requestId,
            },
            body: JSON.stringify({ videoId, options }),
        });

        if (!response.ok) {
            console.error("Python API error status", response.status);
            console.log(
                JSON.stringify({
                    event: "extract.response",
                    requestId,
                    status: response.status,
                    success: false,
                    durationMs: Date.now() - startTime,
                    ts: new Date().toISOString(),
                })
            );
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to extract transcript",
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log(
            JSON.stringify({
                event: "extract.response",
                requestId,
                status: response.status,
                success: true,
                wordCount: result.wordCount,
                durationMs: Date.now() - startTime,
                ts: new Date().toISOString(),
            })
        );

        return NextResponse.json(result);
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`✗ API Error:`, errorMessage);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to extract transcript",
            },
            { status: 400 }
        );
    }
}
