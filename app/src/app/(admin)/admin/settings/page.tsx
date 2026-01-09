import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Settings() {
    return (
        <Box component="main" sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{ mb: 2 }}>Settings</Typography>
                <Typography variant="body1">Manage your admin settings here.</Typography>
            </Container>
        </Box>
    );
}
