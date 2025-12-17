import { getAllEducations } from '@/modules/education/education.controller';
import { EducationList } from '@/components/EducationList';

export default async function EducationAdminPage() {
    const { data: educations } = await getAllEducations();

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-100">Manage Education</h1>
            <EducationList educations={educations || []} />
        </div>
    );
}
