'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { Button } from '@/components/UI/Button';
import {
    deleteBackup,
    listBackups,
    restoreBackup,
    triggerBackupNow,
    type BackupMeta,
    type BackupLogEntry,
} from '@/modules/backup/backup.controller';

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

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

export const BackupManager = ({
    initialBackups,
    initialLog,
}: {
    initialBackups: BackupMeta[];
    initialLog: BackupLogEntry[];
}) => {
    const router = useRouter();
    const [backups, setBackups] = useSafeState<BackupMeta[]>(initialBackups);
    const [logEntries] = useSafeState<BackupLogEntry[]>(initialLog);
    const [isRefreshing, setIsRefreshing] = useSafeState(false);
    const [busy, setBusy] = useSafeState<Record<string, boolean>>({});
    const [restoreTarget, setRestoreTarget] = useSafeState<BackupMeta | null>(null);
    const [deleteTarget, setDeleteTarget] = useSafeState<BackupMeta | null>(null);
    const [isBackingUp, setIsBackingUp] = useSafeState(false);

    // Poll for new backups while a manual backup is in progress.
    // The scheduler picks up the trigger within ~30s, then the dump itself
    // takes a few seconds. Poll every 10s for up to 2 minutes.
    const pollForNewBackup = useCallback(() => {
        const initialCount = backups.length;
        let attempts = 0;
        const maxAttempts = 12; // 12 * 10s = 2 minutes
        const interval = setInterval(async () => {
            attempts += 1;
            try {
                const result = await listBackups();
                if (result.success && result.data.length > initialCount) {
                    setBackups(result.data);
                    toast.success('Backup completed');
                    setIsBackingUp(false);
                    clearInterval(interval);
                    return;
                }
            } catch {
                // ignore polling errors, keep trying
            }
            if (attempts >= maxAttempts) {
                setIsBackingUp(false);
                toast.info('Backup is still running — refresh in a moment to see it');
                clearInterval(interval);
            }
        }, 10000);
    }, [backups.length, setBackups, setIsBackingUp]);

    const handleBackupNow = useCallback(async () => {
        setIsBackingUp(true);
        try {
            const result = await triggerBackupNow();
            if (result.success) {
                toast.info('Backup triggered — it will appear in the list shortly');
                pollForNewBackup();
            } else {
                toast.error(result.error);
                setIsBackingUp(false);
            }
        } catch {
            toast.error('Failed to trigger backup');
            setIsBackingUp(false);
        }
    }, [pollForNewBackup, setIsBackingUp]);

    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            router.refresh();
        } finally {
            setIsRefreshing(false);
        }
    }, [router, setIsRefreshing]);

    const handleRestore = useCallback(async (backup: BackupMeta) => {
        setBusy((prev) => ({ ...prev, [backup.filename]: true }));
        try {
            const result = await restoreBackup(backup.filename);
            if (result.success) {
                toast.success(`Restored ${backup.filename}`);
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Restore failed');
        } finally {
            setBusy((prev) => ({ ...prev, [backup.filename]: false }));
            setRestoreTarget(null);
        }
    }, [setBusy, setRestoreTarget]);

    const handleDelete = useCallback(async (backup: BackupMeta) => {
        setBusy((prev) => ({ ...prev, [backup.filename]: true }));
        try {
            const result = await deleteBackup(backup.filename);
            if (result.success) {
                toast.success(`Deleted ${backup.filename}`);
                setBackups((prev) => prev.filter((b) => b.filename !== backup.filename));
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error('Delete failed');
        } finally {
            setBusy((prev) => ({ ...prev, [backup.filename]: false }));
            setDeleteTarget(null);
        }
    }, [setBackups, setBusy, setDeleteTarget]);

    return (
        <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Backup Files</Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleBackupNow}
                        disabled={isBackingUp}
                    >
                        <CloudUploadIcon fontSize="small" sx={{ mr: 1 }} />
                        {isBackingUp ? 'Backing up...' : 'Backup Now'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
                        <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
                        Refresh
                    </Button>
                </Stack>
            </Stack>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Filename</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {backups.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                        No backups yet. The first automatic backup runs at 02:00 UTC.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {backups.map((backup) => (
                            <TableRow key={backup.filename}>
                                <TableCell sx={{ wordBreak: 'break-all' }}>{backup.filename}</TableCell>
                                <TableCell>{formatBytes(backup.size)}</TableCell>
                                <TableCell>{formatDate(backup.createdAt)}</TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Download">
                                            <IconButton
                                                component="a"
                                                href={`/api/backups/${encodeURIComponent(backup.filename)}`}
                                                download
                                                size="small"
                                            >
                                                <DownloadIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Restore to database">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    disabled={busy[backup.filename]}
                                                    onClick={() => setRestoreTarget(backup)}
                                                >
                                                    <RestoreIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    disabled={busy[backup.filename]}
                                                    onClick={() => setDeleteTarget(backup)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Backup Log</Typography>
                <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
                    {logEntries.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            No log entries yet.
                        </Typography>
                    ) : (
                        logEntries.map((entry, i) => (
                            <Typography
                                key={i}
                                variant="body2"
                                sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    whiteSpace: 'pre-wrap',
                                    color: entry.message.startsWith('ERROR')
                                        ? 'error.main'
                                        : 'text.primary',
                                }}
                            >
                                [{entry.timestamp}] {entry.message}
                            </Typography>
                        ))
                    )}
                </Paper>
            </Box>

            {/* Restore confirmation dialog */}
            <Dialog open={restoreTarget !== null} onClose={() => setRestoreTarget(null)}>
                <DialogTitle>Restore backup?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        This will <strong>overwrite the current database</strong> with the contents of:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', my: 1, wordBreak: 'break-all' }}>
                        {restoreTarget?.filename}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        The restore drops and recreates all tables. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="ghost" onClick={() => setRestoreTarget(null)}>Cancel</Button>
                    <Button
                        variant="destructive"
                        disabled={restoreTarget ? busy[restoreTarget.filename] : false}
                        onClick={() => restoreTarget && handleRestore(restoreTarget)}
                    >
                        Restore
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete backup?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Permanently delete this backup file?
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', my: 1, wordBreak: 'break-all' }}>
                        {deleteTarget?.filename}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button
                        variant="destructive"
                        disabled={deleteTarget ? busy[deleteTarget.filename] : false}
                        onClick={() => deleteTarget && handleDelete(deleteTarget)}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};
