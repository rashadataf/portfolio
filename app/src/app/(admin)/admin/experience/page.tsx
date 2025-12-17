import { getAllExperiences } from '@/modules/experience/experience.controller';
import { ExperienceList } from '@/components/ExperienceList';

export default async function ExperienceAdminPage() {
    const { data: experiences } = await getAllExperiences();

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-100">Manage Experience</h1>
            <ExperienceList experiences={experiences || []} />
        </div>
    );
}
