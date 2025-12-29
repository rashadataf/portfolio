'use server';

import fs from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

export interface UploadedFileMeta {
    filename: string;
    url: string;
    size: number;
    updatedAt: string;
}

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function extractSafeFilename(filenameOrUrl: string) {
    const apiPrefix = '/api/files/';
    const raw = filenameOrUrl.startsWith(apiPrefix)
        ? filenameOrUrl.slice(apiPrefix.length)
        : filenameOrUrl;
    const decoded = decodeURIComponent(raw);

    // Prevent path traversal
    const safe = path.basename(decoded);
    if (safe !== decoded || safe.includes('/') || safe.includes('\\')) {
        throw new Error('Invalid filename');
    }
    return safe;
}

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

        revalidatePath('/admin/files');

        return { success: true, url: fileUrl };
    } catch (error) {
        console.error("Error uploading file:", error);
        return { success: false, error: "Error uploading file" };
    }
}

export async function getUploadedFiles() {
    try {
        await isAdmin();

        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        const dirents = await fs.readdir(UPLOADS_DIR, { withFileTypes: true });

        const files = await Promise.all(
            dirents
                .filter((d) => d.isFile())
                .map(async (d) => {
                    const filename = d.name;
                    const filePath = path.join(UPLOADS_DIR, filename);
                    const stat = await fs.stat(filePath);

                    const meta: UploadedFileMeta = {
                        filename,
                        url: `/api/files/${encodeURIComponent(filename)}`,
                        size: stat.size,
                        updatedAt: stat.mtime.toISOString(),
                    };
                    return meta;
                })
        );

        files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return { success: true, data: files } as const;
    } catch (error) {
        console.error('Error listing uploaded files:', error);
        return { success: false, error: 'Error listing uploaded files' } as const;
    }
}

export async function deleteUploadedFile(filenameOrUrl: string) {
    try {
        await isAdmin();
        const filename = extractSafeFilename(filenameOrUrl);
        const targetPath = path.join(UPLOADS_DIR, filename);
        await fs.unlink(targetPath);
        revalidatePath('/admin/files');
        return { success: true } as const;
    } catch (error: unknown) {
        const code = (error as NodeJS.ErrnoException | undefined)?.code;
        if (code === 'ENOENT') {
            return { success: false, error: 'File not found' } as const;
        }
        console.error('Error deleting file:', error);
        return { success: false, error: 'Error deleting file' } as const;
    }
}
