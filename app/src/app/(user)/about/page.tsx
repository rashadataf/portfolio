import { Metadata } from 'next';
import { AboutPage } from '@/components/AboutPage';
import { getAllSkills } from '@/modules/skill/skill.controller';
import { getAllExperiences } from '@/modules/experience/experience.controller';
import { getAllEducations } from '@/modules/education/education.controller';
import { getProfile } from '@/modules/profile/profile.controller';

export const metadata: Metadata = {
    title: "About Rashad Ataf - Full Stack Developer",
    description: "Learn more about Rashad Ataf's background in Full Stack Development, skills, experience in the tech industry, and professional journey.",
    keywords: "About Rashad Ataf, Full Stack Developer, Developer Background, Programming Skills, Tech Experience, Zim Connections",
    alternates: {
        canonical: "https://www.rashadataf.com/about"
    }
}

export default async function About() {
    const { data: skills } = await getAllSkills();
    const { data: experiences } = await getAllExperiences();
    const { data: educations } = await getAllEducations();
    const { data: profile } = await getProfile();
    return <AboutPage skills={skills} experiences={experiences} educations={educations} profile={profile} />
}

