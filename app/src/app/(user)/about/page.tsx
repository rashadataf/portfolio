import { Metadata } from 'next';
import { AboutPage } from '@/components/AboutPage';

export const metadata: Metadata = {
    title: "About Rashad Ataf - Full Stack Developer",
    description: "Learn more about Rashad Ataf's background in Full Stack Development, skills, experience in the tech industry, and professional journey.",
    keywords: "About Rashad Ataf, Full Stack Developer, Developer Background, Programming Skills, Tech Experience, Zim Connections",
    alternates: {
        canonical: "https://www.rashadataf.com/about"
    }
}

export default function About() {
    return <AboutPage />
}

