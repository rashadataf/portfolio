'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { trackPageVisit } from '@/modules/analytics/analytics.controller';
import { Skill } from '@/components/Skill';
import { Experience } from '@/components/Experience';
import { Education } from '@/components/Education';
import { Loader } from "@/components/Loader";
import { Skill as SkillType, SkillCategory } from '@/modules/skill/skill.entity';

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
        location: "Remote",
        company: "Self Employed",
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

const Section = dynamic(() =>
    import('@/components/Section').then((mod) => mod.Section),
    {
        loading: () => <Loader />,
        ssr: true
    }
)

interface AboutPageProps {
    skills?: SkillType[];
}

export const AboutPage = ({ skills = [] }: AboutPageProps) => {
    useEffect(
        () => {
            trackPageVisit('About');
        },
        []
    )

    const proficientSkills = skills.filter(s => s.category === SkillCategory.Proficient);
    const familiarSkills = skills.filter(s => s.category === SkillCategory.Familiar);

    return (
        <div className="text-main flex flex-col items-center p-8">
            <Section id='about-me' ariaLabelledBy='about-me-header' className="text-center">
                <h1 id="about-me-header" className="text-5xl font-bold my-6 sm:my-12">About Me</h1>
                <div className="container mx-auto px-4 mt-6 text-left">
                    <p className="text-base sm:text-xl leading-relaxed max-w-prose mx-auto">
                        Embarking on my programming journey in 2010,
                        I began with Visual Basic 6 during my high school years.
                        Since then, my passion for technology has led me to a Bachelor&apos;s degree in Computer Engineering and over five years of professional experience in the tech industry.
                        Currently, I am part of the <Link className='text-accent-color font-bold' href="https://www.zimconnections.com" target="_blank" rel="noopener noreferrer">ZIM Connections</Link> team,
                        where I continue to hone my expertise in various JavaScript technologies,
                        frameworks, and libraries.
                        My career has been marked by a rapid adaptation to new challenges and a commitment to innovative problem-solving.
                        With a keen interest in continuous learning and skill development,
                        I consistently seek out opportunities to grow and excel in the ever-evolving landscape of software development.

                    </p>
                </div>
                <div className="container mx-auto px-8 py-10 flex flex-wrap justify-between items-center">
                    {/* <div className="w-full md:w-1/2 flex justify-center">
                        <Image
                            src={selfiePic}
                            alt="Rashad Ataf\'s selfie image"
                            className="rounded-full w-60 h-72 shadow-accent-color shadow-xl"
                            width={300}
                            height={300}
                            quality={20}
                            priority
                        />
                    </div> */}
                    <Section id="key-achievements" ariaLabelledBy="key-achievements-header" className='w-full mt-10 md:mt-auto'>
                        <h2 id="key-achievements-header" className="text-3xl font-bold text-accent-color">Key Achievements</h2>
                        <dl>
                            <div className="mt-2">
                                <dt className="text-lg font-medium">Happy Clients:</dt>
                                <dd className="text-lg text-accent-color font-semibold">100+</dd>
                            </div>
                            <div>
                                <dt className="text-lg font-medium">Projects Completed:</dt>
                                <dd className="text-lg text-accent-color font-semibold">200+</dd>
                            </div>
                            <div>
                                <dt className="text-lg font-medium">Years of Experience:</dt>
                                <dd className="text-lg text-accent-color font-semibold">5</dd>
                            </div>
                        </dl>
                    </Section>
                </div>
            </Section>

            <Section id="skills" ariaLabelledBy="skills-header" className="container mx-auto px-4 my-8">
                <h2 id="skills-header" className="text-4xl sm:text-6xl font-semibold text-center">Skills</h2>
                <div className="flex flex-col md:flex-row justify-between">
                    <article aria-labelledby="proficient-skills-header" className="my-10 w-full md:w-5/12">
                        <h3 id="proficient-skills-header" className="text-xl font-semibold mb-5 md:mb-10 text-center">Proficient</h3>
                        <ul className="list-none">
                            {proficientSkills.map((skill) => (
                                <li key={skill.id}><Skill name={skill.name} percentage={skill.percentage} /></li>
                            ))}
                        </ul>
                    </article>

                    <div className="md:mx-4 w-px h-full my-4"></div>

                    <article aria-labelledby="familiar-skills-header" className="my-10 w-full md:w-5/12">
                        <h3 id="familiar-skills-header" className="text-xl font-semibold mb-5 md:mb-10 text-center">Familiar</h3>
                        <ul className="list-none">
                            {familiarSkills.map((skill) => (
                                <li key={skill.id}><Skill name={skill.name} percentage={skill.percentage} /></li>
                            ))}
                        </ul>
                    </article>
                </div>
            </Section>

            <Section id="experience" ariaLabelledBy="experience-header" className="flex flex-col items-center">
                <div className="container mx-auto px-4 py-6">
                    <h2 id="experience-header" className="text-4xl mb-10 sm:text-6xl font-semibold text-center">Experience</h2>
                    <ol className="relative border-l-2 border-accent-color pl-5 md:pl-20 w-full">
                        {experiences.map((item, index) => (
                            <li key={index} className="mb-10">
                                <Experience
                                    company={item.company}
                                    from={item.from}
                                    to={item.to}
                                    location={item.location}
                                    position={item.position}
                                    responsibilities={item.responsibilities}
                                />
                            </li>
                        ))}
                    </ol>
                </div>
            </Section>


            <Section id="education" ariaLabelledBy="education-header" className="flex flex-col items-center">
                <div className="container mx-auto px-4 py-6">
                    <h2 id="education-header" className="text-4xl mb-4 sm:text-6xl font-semibold text-center">Education</h2>
                    <div className="relative border-l-2 border-accent-color pl-5 md:pl-20 w-full">
                        <article>
                            <Education degree='Bachelor' field='Computer Sceincs' from='SEP 2012' to='SEP 2019' institution='Tishreen University' />
                        </article>
                    </div>
                </div>
            </Section>
        </div>
    );
}