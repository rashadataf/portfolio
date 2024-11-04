import { Metadata } from "next";
import { HomePage } from "@/components/HomePage";

export const metadata: Metadata = {
  title: "Rashad Ataf - Full Stack Developer",
  description: "Welcome to Rashad Ataf's Portfolio - Discover my journey as a Full Stack Developer, my skills, projects, and more.",
  keywords: "Rashad Ataf, Full Stack Developer, Web Development, Mobile Development, Software Engineer, Zim Connections",
  alternates: {
    canonical: "https://www.rashadataf.tech/"
  }
}

export default function Home() {

  return <HomePage />
}
