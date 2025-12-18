'use server';

import fs from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";

export async function uploadFile(file: File, folder: string = 'uploads') {
    try {
        await isAdmin();
        if (!file) {
            throw new Error("No file provided for upload.");
        }

        const timestamp = Date.now();
        // Sanitize filename to remove special characters
        const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `${timestamp}_${originalName}`;

        // Store in "public/uploads"
        const uploadPath = path.join(process.cwd(), "public", folder, fileName);

        await fs.mkdir(path.dirname(uploadPath), { recursive: true });

        const buffer = await file.arrayBuffer();
        await fs.writeFile(uploadPath, Buffer.from(buffer));

        // API route for serving files
        // Assuming the existing route /api/files/[filename] serves from public/uploads
        // If folder is different, we might need to adjust the URL or the API route.
        // For now, let's stick to 'uploads' as the default which matches the existing API.
        const fileUrl = `/api/files/${fileName}`;

        return { success: true, url: fileUrl };
    } catch (error) {
        console.error("Error uploading file:", error);
        return { success: false, error: "Error uploading file" };
    }
}
