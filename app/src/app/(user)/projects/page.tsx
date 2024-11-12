import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Loader } from "@/components/Loader";

export const metadata: Metadata = {
    title: "Rashad Ataf's Projects - Full Stack Development Portfolio",
    description: "Explore the portfolio of Rashad Ataf showcasing a variety of web and mobile development projects, featuring innovative solutions and cutting-edge technologies.",
    keywords: "Rashad Ataf Projects, Web Development Projects, Mobile App Development, Software Portfolio, React Projects, Node.js Projects, Zim Connections",
    alternates: {
        canonical: "https://www.rashadataf.tech/projects"
    }
}

const ProjectsPage = dynamic(() =>
    import('@/components/ProjectsPage').then((mod) => mod.ProjectsPage),
    {
        loading: () => <Loader />,
    }
)

export default function Projects() {
    return <ProjectsPage />
}
