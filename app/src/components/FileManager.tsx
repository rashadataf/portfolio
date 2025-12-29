'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/UI/Button';
import {
    deleteUploadedFile,
    getUploadedFiles,
    uploadFile,
    type UploadedFileMeta,
} from '@/modules/file/file.controller';

function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes)) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export const FileManager = ({ initialFiles }: { initialFiles: UploadedFileMeta[] }) => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<UploadedFileMeta[]>(initialFiles);
    const [isUploading, setIsUploading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleting, setDeleting] = useState<Record<string, boolean>>({});

    const refresh = async () => {
        setIsRefreshing(true);
        try {
            const res = await getUploadedFiles();
            if (res.success) {
                setFiles(res.data);
            } else {
                toast.error(res.error);
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    const handlePickFile = () => fileInputRef.current?.click();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await uploadFile(file);
            if (res.success && res.url) {
                await navigator.clipboard.writeText(res.url);
                toast.success('Uploaded. URL copied to clipboard.');
                await refresh();
                router.refresh();
            } else {
                toast.error(res.error || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleCopy = async (url: string) => {
        await navigator.clipboard.writeText(url);
        toast.success('URL copied');
    };

    const handleDelete = async (filename: string) => {
        const ok = confirm(`Delete "${filename}"? This cannot be undone.`);
        if (!ok) return;

        setDeleting((m) => ({ ...m, [filename]: true }));
        try {
            const res = await deleteUploadedFile(filename);
            if (res.success) {
                toast.success('File deleted');
                await refresh();
                router.refresh();
            } else {
                toast.error(res.error || 'Delete failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Delete failed');
        } finally {
            setDeleting((m) => ({ ...m, [filename]: false }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Files</h2>
                    <p className="text-sm text-gray-600">Uploads are stored in <span className="font-mono">public/uploads</span>.</p>
                </div>

                <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" />
                    <Button type="button" variant="secondary" onClick={handlePickFile} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload file'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={refresh} disabled={isRefreshing}>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Filename</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Size</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Updated</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {files.map((f) => (
                            <tr key={f.filename} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-900">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{f.filename}</span>
                                        <a
                                            className="text-xs text-blue-600 hover:underline break-all"
                                            href={f.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {f.url}
                                        </a>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700 text-sm">{formatBytes(f.size)}</td>
                                <td className="px-4 py-3 text-gray-700 text-sm">{new Date(f.updatedAt).toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            asChild
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                        >
                                            <a href={f.url} target="_blank" rel="noreferrer">
                                                Preview
                                            </a>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopy(f.url)}
                                        >
                                            Copy URL
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(f.filename)}
                                            disabled={!!deleting[f.filename]}
                                        >
                                            {deleting[f.filename] ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {files.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-gray-600">
                                    No files found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
