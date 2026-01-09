import { getProfile } from '@/modules/profile/profile.controller';
import { ProfileForm } from '@/components/ProfileForm';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default async function ProfileAdminPage() {
    const { data: profile } = await getProfile();

    if (!profile) {
        return <div>Error loading profile. Please ensure the database is initialized.</div>;
    }

    return (
        <Box component="main" sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" sx={{ mb: 3 }}>Edit Profile</Typography>
                <ProfileForm initialData={profile} />
            </Container>
        </Box>
    );
} 
