import { FileManager } from '@/components/FileManager';
import { getUploadedFiles } from '@/modules/file/file.controller';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default async function FilesAdminPage() {
    const res = await getUploadedFiles();
    const files = res.success ? res.data : [];

    return (
        <Box component="main" sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{ mb: 3 }}>Manage Files</Typography>
                <FileManager initialFiles={files} />
            </Container>
        </Box>
    );
} 
