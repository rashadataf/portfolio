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
import { Experience as ExperienceType } from '@/modules/experience/experience.entity';
import { Education as EducationType } from '@/modules/education/education.entity';
import { Profile } from '@/modules/profile/profile.entity';
import { Users, CheckCircle, Calendar, Briefcase, GraduationCap, Code } from 'lucide-react';

const Section = dynamic(() =>
    import('@/components/Section').then((mod) => mod.Section),
    {
        loading: () => <Loader />,
        ssr: true
    }
)

interface AboutPageProps {
    skills?: SkillType[];
    experiences?: ExperienceType[];
    educations?: EducationType[];
    profile?: Profile;
}

export const AboutPage = ({ skills = [], experiences = [], educations = [], profile }: AboutPageProps) => {
    useEffect(
        () => {
            trackPageVisit('About');
        },
        []
    )

    const proficientSkills = skills.filter(s => s.category === SkillCategory.Proficient);
    const familiarSkills = skills.filter(s => s.category === SkillCategory.Familiar);

    return (
        <div className="text-main flex flex-col items-center p-4 md:p-8 max-w-7xl mx-auto">
            {/* About Me Section */}
            <Section id='about-me' ariaLabelledBy='about-me-header' className="text-center w-full mb-16">
                <h1 id="about-me-header" className="text-5xl font-bold my-6 sm:my-12 bg-clip-text">About Me</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2 text-left">
                        <div className="bg-white/50 dark:bg-gray-900/70 p-8 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-xl backdrop-blur-sm">
                            {profile?.aboutEn ? (
                                <div
                                    className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 space-y-4"
                                    dangerouslySetInnerHTML={{ __html: profile.aboutEn }}
                                />
                            ) : (
                                <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                    Embarking on my programming journey in 2010,
                                    I began with Visual Basic 6 during my high school years.
                                    Since then, my passion for technology has led me to a Bachelor&apos;s degree in Computer Engineering and over five years of professional experience in the tech industry.
                                    Currently, I am part of the <Link className='text-accent-color font-bold hover:underline' href="https://www.zimconnections.com" target="_blank" rel="noopener noreferrer">ZIM Connections</Link> team,
                                    where I continue to hone my expertise in various JavaScript technologies,
                                    frameworks, and libraries.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Key Achievements Cards */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="bg-white/50 dark:bg-gray-900/70 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-accent-color/50 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-lg group">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 group-hover:bg-blue-500/20 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-200">Happy Clients</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white ml-16">{profile?.happyClients ? `${profile.happyClients}+` : '100+'}</p>
                        </div>

                        <div className="bg-white/50 dark:bg-gray-900/70 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-accent-color/50 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-lg group">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400 group-hover:text-green-500 dark:group-hover:text-green-300 group-hover:bg-green-500/20 transition-colors">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-200">Projects Completed</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white ml-16">{profile?.projectsCompleted ? `${profile.projectsCompleted}+` : '200+'}</p>
                        </div>

                        <div className="bg-white/50 dark:bg-gray-900/70 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-accent-color/50 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-lg group">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400 group-hover:text-purple-500 dark:group-hover:text-purple-300 group-hover:bg-purple-500/20 transition-colors">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-200">Years Experience</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white ml-16">{profile?.yearsOfExperience || '5'}</p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Skills Section */}
            <Section id="skills" ariaLabelledBy="skills-header" className="w-full mb-16">
                <div className="flex items-center justify-center gap-3 mb-10">
                    <Code className="w-8 h-8 text-accent-color" />
                    <h2 id="skills-header" className="text-4xl sm:text-5xl font-bold text-center">Skills</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <article className="bg-white/50 dark:bg-gray-900/70 p-8 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                        <h3 className="text-2xl font-semibold mb-8 text-center text-accent-color dark:text-purple-300 border-b border-gray-200 dark:border-gray-700 pb-4">Proficient</h3>
                        <ul className="space-y-6">
                            {proficientSkills.map((skill) => (
                                <li key={skill.id}><Skill name={skill.name} percentage={skill.percentage} /></li>
                            ))}
                        </ul>
                    </article>

                    <article className="bg-white/50 dark:bg-gray-900/70 p-8 rounded-2xl border border-gray-200 dark:border-gray-700/50">
                        <h3 className="text-2xl font-semibold mb-8 text-center text-accent-color dark:text-purple-300 border-b border-gray-200 dark:border-gray-700 pb-4">Familiar</h3>
                        <ul className="space-y-6">
                            {familiarSkills.map((skill) => (
                                <li key={skill.id}><Skill name={skill.name} percentage={skill.percentage} /></li>
                            ))}
                        </ul>
                    </article>
                </div>
            </Section>

            {/* Experience Section */}
            <Section id="experience" ariaLabelledBy="experience-header" className="w-full mb-16">
                <div className="flex items-center justify-center gap-3 mb-12">
                    <Briefcase className="w-8 h-8 text-accent-color" />
                    <h2 id="experience-header" className="text-4xl sm:text-5xl font-bold text-center">Experience</h2>
                </div>
                
                <div className="max-w-4xl mx-auto">
                    <ol className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-8 md:pl-12 space-y-12">
                        {experiences.map((item, index) => (
                            <li key={index} className="relative">
                                <span className="absolute -left-[2.4rem] md:-left-[3.4rem] flex items-center justify-center w-6 h-6 bg-accent-color rounded-full ring-4 ring-white dark:ring-gray-900">
                                    <Briefcase className="w-3 h-3 text-white" />
                                </span>
                                <Experience
                                    company={item.company}
                                    from={item.startDate}
                                    to={item.endDate}
                                    location={item.location}
                                    position={item.position}
                                    responsibilities={item.responsibilities}
                                />
                            </li>
                        ))}
                    </ol>
                </div>
            </Section>

            {/* Education Section */}
            <Section id="education" ariaLabelledBy="education-header" className="w-full mb-16">
                <div className="flex items-center justify-center gap-3 mb-12">
                    <GraduationCap className="w-8 h-8 text-accent-color" />
                    <h2 id="education-header" className="text-4xl sm:text-5xl font-bold text-center">Education</h2>
                </div>
                
                <div className="max-w-4xl mx-auto">
                    <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-8 md:pl-12 space-y-12">
                        {educations.map((edu, index) => (
                            <article key={index} className="relative">
                                <span className="absolute -left-[2.4rem] md:-left-[3.4rem] flex items-center justify-center w-6 h-6 bg-accent-color rounded-full ring-4 ring-white dark:ring-gray-900">
                                    <GraduationCap className="w-3 h-3 text-white" />
                                </span>
                                <Education
                                    degree={edu.degree}
                                    field={edu.field}
                                    from={edu.startDate}
                                    to={edu.endDate}
                                    institution={edu.institution}
                                />
                            </article>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
}