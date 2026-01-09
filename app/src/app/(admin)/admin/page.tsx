import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function AdminHome() {
    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>Admin Home</Typography>
            <Typography variant="body1">Welcome to the Admin Dashboard!</Typography>
        </Box>
    );
}