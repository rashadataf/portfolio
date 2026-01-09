import { getAllProjects } from '@/modules/project/project.controller';
import { ProjectList } from '@/components/ProjectList';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default async function ProjectsAdminPage() {
    const { data: projects } = await getAllProjects();

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 4 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Manage Projects</Typography>
            <ProjectList projects={projects || []} />
        </Box>
    );
}
