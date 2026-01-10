import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type EducationProps = {
    institution: string;
    degree: string;
    field: string;
    from: string;
    to: string;
}

export const Education = ({ institution, degree, field, from, to }: EducationProps) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{institution}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{degree}{field ? ` in ${field}` : ''}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>{from} - {to}</Typography>
        </Box>
    );
}
