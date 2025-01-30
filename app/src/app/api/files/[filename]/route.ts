import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const { filename } = await params;
        const filePath = path.join(process.cwd(), "public", "uploads", filename);
        // Read the image file
        const imageBuffer = await fs.readFile(filePath);

        // Determine content type based on file extension
        const ext = path.extname(filename).toLowerCase();
        const mimeType = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
        }[ext] || "application/octet-stream";

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        return new NextResponse("Image not found", { status: 404 });
    }
}
