import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Loader } from '@/components/Loader';
import { trackPageVisit } from "@/lib/metrics";

export const metadata: Metadata = {
    title: "About Rashad Ataf - Full Stack Developer",
    description: "Learn more about Rashad Ataf's background in Full Stack Development, skills, experience in the tech industry, and professional journey.",
    keywords: "About Rashad Ataf, Full Stack Developer, Developer Background, Programming Skills, Tech Experience, Zim Connections",
    alternates: {
        canonical: "https://www.rashadataf.com/about"
    }
}

const AboutPage = dynamic(() =>
    import('@/components/AboutPage').then((mod) => mod.AboutPage),
    {
        loading: () => <Loader />,
    }
)

export default function About() {
    trackPageVisit('About');
    return <AboutPage />
}

