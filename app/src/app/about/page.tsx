import React from 'react';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { Metadata } from 'next';
import { Skill } from '@/components/Skill';
import { Experience } from '@/components/Experience';
import { Education } from '@/components/Education';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Rashad Portfolio | Software Engineer | About',
    description: 'portfolio for Rashad Ataf',
}

const proficientSkills = {
    "HTML": 90,
    "CSS": 85,
    "Tailwind CSS": 80,
    "JavaScript": 90,
    "React.js": 85,
    "React Native": 80,
    "Redux.js": 75,
    "Next.js": 80,
    "Node.js": 85,
    "Express": 80,
    "MongoDB": 75,
    "Nest.js": 70,
    "RESTful APIs": 80,
    "Git": 90,
    "GitHub": 85,
    "Clouds (AWS, GCP)": 75,
    "Linux": 70,
    "Docker": 75,
};

const familiarSkills = {
    "Android (Java)": 65,
    "Objective-C": 50,
    "SwiftUI": 55,
    "PHP": 60,
    "Laravel": 60,
    "C": 50,
    "C++": 60,
    "WordPress": 60,
    "Photoshop": 40,
    "Figma": 70,
    "C#": 55,
    "Vue.js": 40,
    "SQL": 60,
    "MySQL": 60,
};

const experiences = [
    {
        position: "Full Stack Software Developer",
        location: "London",
        company: "ZIM Connections",
        from: "Dec 2021",
        to: "Present",
        responsibilities: [
            "Spearheaded the development of a full-stack mobile app, optimizing data processing and visualization in JavaScript (React Native, Node.js, MongoDB).",
            "Implemented 20+ features, reducing load time by 75% and enhancing user experience.",
            "Resolved 50+ bugs, fortifying security and stability.",
            "Collaborated with the marketing team to introduce new features, boosting user engagement.",
            "Conducted research on cutting-edge technologies for application enhancement."
        ]
    },
    {
        position: "Full Stack Software Developer",
        location: "Istanbul",
        company: "Alphatech",
        from: "Feb 2021",
        to: "Nov 2021",
        responsibilities: [
            "Engineered role-based dashboards, tailoring user permissions and enhancing user experience.",
            "Conducted in-depth analysis of application requirements, crafting efficient and scalable database designs.",
            "Explored and implemented best practices in HTTP standards, REST, and web security for optimal application performance and user authentication."
        ]
    },
    {
        position: "Freelancer, Full Stack Software Developer",
        location: "",
        company: "",
        from: "Aug 2017",
        to: "Feb 2021",
        responsibilities: [
            "Executed comprehensive redesigns for websites, enhancing navigation, aesthetics, and search engine rankings.",
            "Integrated apps with REST APIs for various services.",
            "Conducted thorough searches for suitable hosting and VPS, deploying projects and configuring servers.",
            "Engineered RESTful web services to manipulate dynamic datasets.",
            "Designed and implemented both NoSQL and SQL databases."
        ]
    }
];



const AboutPage = () => {

    return (
        <>
            <main className="bg-main text-main flex flex-col items-center p-8">
                <div className="text-center py-10">
                    <h1 className="text-5xl font-bold">About Me</h1>
                </div>
                <div className="container mx-auto px-4">
                    <p className="text-xl leading-relaxed max-w-prose mx-auto">
                        Embarking on my programming journey in 2010,
                        I began with Visual Basic 6 during my high school years.
                        Since then, my passion for technology has led me to a Bachelor&apos;s degree in Computer Engineering and over five years of professional experience in the tech industry.
                        Currently, I am part of the <Link className='text-primary' href="https://www.zimconnections.com" target="_blank" rel="noopener noreferrer">ZIM Connections</Link> team,
                        where I continue to hone my expertise in various JavaScript technologies,
                        frameworks, and libraries.
                        My career has been marked by a rapid adaptation to new challenges and a commitment to innovative problem-solving.
                        With a keen interest in continuous learning and skill development,
                        I consistently seek out opportunities to grow and excel in the ever-evolving landscape of software development.

                    </p>
                </div>
                <div className="container mx-auto px-8 py-10 flex flex-wrap justify-around items-center">
                    <Image
                        src='/images/selfie.png'
                        alt="Rashad Ataf"
                        className="rounded-full w-60 h-72 shadow-secondary shadow-lg"
                        width={1280}
                        height={1280}
                        quality={100}
                    />
                    <div className="m-4">
                        <h2 className="text-3xl font-semibold">Key Achievements</h2>
                        <p className="text-lg mt-2">Happy Clients: 100+</p>
                        <p className="text-lg">Projects Completed: 200+</p>
                        <p className="text-lg">Years of Experience: 5</p>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-10 my-10">
                    <h2 className="text-4xl my-6 sm:text-6xl font-semibold sm:my-32 text-center">Skills</h2>
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="my-10 w-full md:w-5/12">
                            <h3 className="text-xl font-semibold mb-5 md:mb-10">Proficient</h3>
                            {Object.entries(proficientSkills).map(([skill, proficiency]) => (
                                <Skill key={skill} name={skill} percentage={proficiency} />
                            ))}
                        </div>
                        <div className="hidden md:block my-4 md:my-0 md:mx-4 bg-gray-300 w-px h-full"></div>
                        <div className="my-10 w-full md:w-5/12">
                            <h3 className="text-xl font-semibold mb-5 md:mb-10">Familiar</h3>
                            {Object.entries(familiarSkills).map(([skill, proficiency]) => (
                                <Skill key={skill} name={skill} percentage={proficiency} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="container mx-auto px-4 py-10">
                        <h2 className="text-4xl mb-20 my-6 sm:text-6xl font-semibold sm:my-32 text-center">Experience</h2>
                        <div className="relative border-l-2 border-gray-300 pl-5 md:pl-20 w-full">
                            {
                                experiences.map(
                                    (item, index) => <Experience key={index} company={item.company} from={item.from} to={item.to} location={item.location} position={item.position} responsibilities={item.responsibilities} />
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="container mx-auto px-4 py-10">
                        <h2 className="text-4xl mb-20 my-6 sm:text-6xl font-semibold sm:my-32 text-center">Education</h2>
                        <div className="relative border-l-2 border-gray-300 pl-5 md:pl-20 w-full">
                            <Education degree='Bachelor' field='Computer Sceincs' from='SEP 2012' to='SEP 2019' institution='Tishreen University' />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default AboutPage;
