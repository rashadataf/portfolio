import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material';

interface SectionProps {
    id: string;
    ariaLabelledBy: string;
    className?: string;
    children: React.ReactNode;
    sx?: SxProps<Theme>;
}

export const Section = ({ id, ariaLabelledBy, className = "", children, sx }: SectionProps) => {
    return (
        <Box component="section" id={id} aria-labelledby={ariaLabelledBy} className={className} sx={sx}>
            {children}
        </Box>
    )
}
