'use client';
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { trackPageVisit } from "@/modules/analytics/analytics.controller";
import { Project } from "@/components/Project";
import { Loader } from "@/components/Loader";

const projects = [
    {
        title: "Rashad Ataf's Portfolio",
        description: "This portfolio showcases my journey and achievements as a Full Stack Developer. It's a reflection of my professional skills, featuring a clean, modern design and a user-friendly interface. The site includes detailed sections about my work experience, education, projects, and skills, each designed to provide a comprehensive view of my capabilities. Built using Next.js, it demonstrates my expertise in frontend and backend development, offering a seamless and interactive user experience.",
        imageUrl: "/images/rashad.webp",
        technologies: ["Next.js", "React", "Tailwind CSS"],
        liveUrl: "https://rashadataf.com",
        sourceCodeUrl: "https://github.com/rashadataf/portfolio"
    },
    {
        title: "ZIM Connections Application",
        description: "ZIM Connections Application is a cross-platform mobile app developed for both Android and iOS. The app serves as a comprehensive platform for community engagement and connectivity. ZIM is an eSIM marketplace where you can browse and purchase affordable eSIM data plans from over 190 countries",
        imageUrl: "/images/zim.png",
        technologies: ["React Native", "Stripe", "Firebase"],
        appStoreUrl: "https://apps.apple.com/us/app/zim-esim-calls-data-plans/id1611244114",
        playStoreUrl: "https://play.google.com/store/apps/details?id=com.zim_cli"
    }

];

const Section = dynamic(() =>
    import('@/components/Section').then((mod) => mod.Section),
    {
        loading: () => <Loader />,
        ssr: true
    }
)

export async function getStaticProps() {
    return {
        props: {},
    };
}

export const ProjectsPage = () => {
    useEffect(
        () => {
            trackPageVisit('Projects');
        },
        []
    )

    return (
        <Section id="projects" ariaLabelledBy="projects-page-heder" className="container mx-auto py-10">
            <h1 id="projects-page-header" className="text-4xl font-bold text-center mb-10">Projects</h1>
            <div className="flex flex-wrap justify-evenly px-4 lg:px-10 xl:px-24">
                {
                    projects.map((project, index) => (
                        <article key={index} className="w-full p-6 md:w-1/2 md:p-5 lg:w-1/3 lg:p-3 xl:w-1/4 xl:p-2">
                            <Project {...project} />
                        </article>
                    ))
                }
            </div>
        </Section>
    );
}