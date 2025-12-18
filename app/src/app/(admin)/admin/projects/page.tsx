import { getAllProjects } from '@/modules/project/project.controller';
import { ProjectList } from '@/components/ProjectList';

export default async function ProjectsAdminPage() {
    const { data: projects } = await getAllProjects();

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-100">Manage Projects</h1>
            <ProjectList projects={projects || []} />
        </div>
    );
}
