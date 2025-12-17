'use client';
import { useEffect } from "react";
import dynamic from "next/dynamic";
import { trackPageVisit } from "@/modules/analytics/analytics.controller";
import { Project } from "@/components/Project";
import { Loader } from "@/components/Loader";
import { Project as ProjectType } from "@/modules/project/project.entity";

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
            <h1 id="projects-page-header" className="text-4xl font-bold text-center mb-10">Projects</h1>
            <div className="flex flex-wrap justify-evenly px-4 lg:px-10 xl:px-24">
                {
                    projects.map((project) => (
                        <article key={project.id} className="w-full p-6 md:w-1/2 md:p-5 lg:w-1/3 lg:p-3 xl:w-1/4 xl:p-2">
                            <Project {...project} />
                        </article>
                    ))
                }
            </div>
        </Section>
    );
}