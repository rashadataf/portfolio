'use client';
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { trackPageVisit } from "@/modules/analytics/analytics.controller";
import { Project } from "@/components/Project";
import { Loader } from "@/components/Loader";
import { Project as ProjectType } from "@/modules/project/project.entity";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const Section = dynamic(() =>
    import('@/components/Section').then((mod) => mod.Section),
    {
        loading: () => <Loader />,
        ssr: true
    }
)

interface ProjectsPageProps {
    projects?: ProjectType[];
}

export const ProjectsPage = ({ projects = [] }: ProjectsPageProps) => {
    useEffect(
        () => {
            trackPageVisit('Projects');
        },
        []
    )

    return (
        <Section id="projects" ariaLabelledBy="projects-page-heder" className="container mx-auto py-10">
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography id="projects-page-header" variant="h4" component="h1" sx={{ textAlign: 'center', mb: 4 }}>Projects</Typography>

                <Box sx={{ px: { xs: 0, sm: 2 } }}>
                    <Box sx={{ display: 'grid', gap: 3, gridAutoRows: '1fr', alignItems: 'stretch', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)' } }}>
                        {projects.map((project) => (
                            <Box key={project.id} sx={{ p: { xs: 0, md: 1 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Project {...project} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Section>
    );
}