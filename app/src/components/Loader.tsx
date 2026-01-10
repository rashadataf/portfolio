'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export const Loader = () => {
    return (
        <Box
            role="status"
            aria-live="polite"
            sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.45)',
                zIndex: 1300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress size={72} thickness={5} color="primary" aria-label="Loading" />
        </Box>
    );
}