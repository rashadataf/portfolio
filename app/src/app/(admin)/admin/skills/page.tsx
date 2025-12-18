import { getAllSkills } from '@/modules/skill/skill.controller';
import { SkillList } from '@/components/SkillList';

export default async function SkillsAdminPage() {
    const { data: skills } = await getAllSkills();

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Skills</h1>
            <SkillList skills={skills || []} />
        </div>
    );
}
