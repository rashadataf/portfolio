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

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Image from 'next/image';
import NextLink from 'next/link';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

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
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewName, setPreviewName] = useState<string | null>(null);

    const isImage = (url: string) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(url);

    const handlePreview = (url: string, name: string) => {
        setPreviewUrl(url);
        setPreviewName(name);
        setPreviewOpen(true);
    };

    const closePreview = () => {
        setPreviewOpen(false);
        setPreviewUrl(null);
        setPreviewName(null);
    };

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
        <Box>
            <input ref={fileInputRef} type="file" onChange={handleUpload} style={{ display: 'none' }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h5">Files</Typography>
                    <Typography variant="body2" color="text.secondary">Uploads are stored in <Box component="span" sx={{ fontFamily: 'Monospace' }}>public/uploads</Box>.</Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button type="button" variant="default" onClick={handlePickFile} disabled={isUploading} startIcon={<UploadFileIcon />}>
                        {isUploading ? 'Uploading...' : 'Upload file'}
                    </Button>
                    <Button type="button" variant="outline" onClick={refresh} disabled={isRefreshing} startIcon={<RefreshIcon />}>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </Stack> 
            </Stack>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Filename</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Updated</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {files.map((f) => (
                            <TableRow key={f.filename} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                                <TableCell>
                                    <Box>
                                                        <Typography variant="body1">{f.filename}</Typography>
                                        <Link href={f.url} target="_blank" rel="noreferrer" underline="hover" sx={{ fontSize: 12, wordBreak: 'break-all' }}>{f.url}</Link>
                                    </Box>
                                </TableCell>
                                <TableCell>{formatBytes(f.size)}</TableCell>
                                <TableCell>{new Date(f.updatedAt).toLocaleString()}</TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                        <Tooltip title="Preview">
                                            <span>
                                                <IconButton aria-label={`preview-${f.filename}`} size="small" onClick={() => handlePreview(f.url, f.filename)}>
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Tooltip title="Copy URL">
                                            <span>
                                                <IconButton aria-label={`copy-${f.filename}`} size="small" onClick={() => handleCopy(f.url)}>
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Tooltip title="Delete">
                                            <span>
                                                <IconButton aria-label={`delete-${f.filename}`} size="small" color="error" onClick={() => handleDelete(f.filename)} disabled={!!deleting[f.filename]}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}

                        {files.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No files found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={previewOpen} onClose={closePreview} fullWidth maxWidth="md">
                <DialogTitle>{previewName}</DialogTitle>
                <DialogContent>
                    {previewUrl && isImage(previewUrl) ? (
                        <Box sx={{ width: '100%', height: { xs: 240, md: 480 }, position: 'relative' }}>
                            <Image src={previewUrl} alt={previewName || 'preview'} fill style={{ objectFit: 'contain' }} />
                        </Box>
                    ) : (
                        <Box sx={{ width: '100%', height: { xs: 300, md: 600 } }}>
                            {previewUrl ? <iframe src={previewUrl} title={previewName || 'preview'} style={{ width: '100%', height: '100%', border: 0 }} /> : null}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="outline" onClick={closePreview}>Close</Button>
                    <Button component={NextLink} variant="secondary" href={previewUrl ?? '#'} target="_blank" rel="noreferrer">
                        Open in new tab
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
