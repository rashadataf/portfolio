import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

type ExperienceProps = {
    position: string;
    location: string;
    company: string;
    from: string;
    to: string;
    responsibilities: string[];
}

export const Experience = ({ company, from, location, position, responsibilities, to }: ExperienceProps) => {
    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{position} - {company}{location ? `, ${location}` : ''}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', my: 1 }}>{from} - {to}</Typography>
            <List dense>
                {responsibilities.map((item, index) => (
                    <ListItem key={index} sx={{ display: 'list-item', pl: 2 }}>{item}</ListItem>
                ))}
            </List>
        </Box>
    );
}
