import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { BackupManager } from '@/components/BackupManager';
import {
    listBackups,
    getBackupLog,
} from '@/modules/backup/backup.controller';

export const dynamic = 'force-dynamic';

export default async function BackupsPage() {
    const [backupsResult, logResult] = await Promise.all([
        listBackups(),
        getBackupLog(),
    ]);

    return (
        <Box component="main" sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{ mb: 1 }}>Backups</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Daily automatic backups at 02:00 UTC. Download to your machine, or restore directly to the database.
                </Typography>
                <BackupManager
                    initialBackups={backupsResult.success ? backupsResult.data : []}
                    initialLog={logResult.success ? logResult.data : []}
                />
            </Container>
        </Box>
    );
}
