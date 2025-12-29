import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(_: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const { filename } = await params;
        // Prevent path traversal
        const safe = path.basename(filename);
        if (safe !== filename) {
            return new NextResponse("Invalid filename", { status: 400 });
        }

        const filePath = path.join(process.cwd(), "public", "uploads", safe);
        const fileBuffer = await fs.readFile(filePath);

        // Determine content type based on file extension
        const ext = path.extname(safe).toLowerCase();
        const mimeType = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
            ".pdf": "application/pdf",
            ".txt": "text/plain; charset=utf-8",
            ".json": "application/json; charset=utf-8",
        }[ext] || "application/octet-stream";

        // NextResponse expects a Web BodyInit; convert Node Buffer to Uint8Array for TS compatibility
        return new NextResponse(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Length": Buffer.byteLength(fileBuffer).toString(),
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch {
        return new NextResponse("File not found", { status: 404 });
    }
}
