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
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
        <Box component="main" sx={{ color: 'text.primary', display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto' }}>
            {/* About Me Section */}
            <Box component={Section} id='about-me' ariaLabelledBy='about-me-header' sx={{ width: '100%', mb: 8 }}>
                <Typography id="about-me-header" variant="h3" component="h1" sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 700, my: 4, textAlign: 'center' }}>About Me</Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: '1 1 66%' }}>
                        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                            {profile?.aboutEn ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: profile.aboutEn }}
                                />
                            ) : (
                                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                    Embarking on my programming journey in 2010,
                                    I began with Visual Basic 6 during my high school years.
                                    Since then, my passion for technology has led me to a Bachelor&apos;s degree in Computer Engineering and over five years of professional experience in the tech industry.
                                    Currently, I am part of the <Link href="https://www.zimconnections.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 700, textDecoration: 'underline' }}>ZIM Connections</Link> team,
                                    where I continue to hone my expertise in various JavaScript technologies,
                                    frameworks, and libraries.
                                </Typography>
                            )}
                        </Paper>
                    </Box>

                    {/* Key Achievements Cards */}
                    <Box sx={{ flex: '1 1 34%' }}>
                        <Stack spacing={2}>
                            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'inline-flex' }}>
                                        <Users />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Happy Clients</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.happyClients ? `${profile.happyClients}+` : '100+'}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'success.main', color: 'success.contrastText', display: 'inline-flex' }}>
                                        <CheckCircle />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Projects Completed</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.projectsCompleted ? `${profile.projectsCompleted}+` : '200+'}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'inline-flex' }}>
                                        <Calendar />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Years Experience</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.yearsOfExperience || '5'}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Box>
                </Box>
            </Box>

            {/* Skills Section */}
            <Box component={Section} id="skills" ariaLabelledBy="skills-header" sx={{ width: '100%', mb: 8 }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 4 }}>
                    <Code />
                    <Typography id="skills-header" variant="h4" component="h2">Skills</Typography>
                </Stack>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Proficient</Typography>
                        <Stack spacing={2}>
                            {proficientSkills.map((skill) => (
                                <Skill key={skill.id} name={skill.name} percentage={skill.percentage} />
                            ))}
                        </Stack>
                    </Paper>

                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>Familiar</Typography>
                        <Stack spacing={2}>
                            {familiarSkills.map((skill) => (
                                <Skill key={skill.id} name={skill.name} percentage={skill.percentage} />
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            </Box>

            {/* Experience Section */}
            <Box component={Section} id="experience" ariaLabelledBy="experience-header" sx={{ width: '100%', mb: 8 }}>
                <Stack alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Briefcase />
                    <Typography id="experience-header" variant="h4" component="h2">Experience</Typography>
                </Stack>

                <Box sx={{ maxWidth: 900, mx: 'auto', position: 'relative' }}>
                    {/* Full height timeline line (visible) */}
                    <Box aria-hidden sx={{ position: 'absolute', left: { xs: '28px', md: '40px' }, top: 0, bottom: 0, width: 2, bgcolor: 'grey.300', zIndex: 0 }} />

                    <Stack spacing={6}>
                        {experiences.map((item, index) => (
                            <Box key={index} sx={{ position: 'relative', pl: { xs: '64px', md: '88px' } }}>
                                {/* Marker */}
                                <Box sx={{ position: 'absolute', left: { xs: '14px', md: '22px' }, top: { xs: 6, md: 8 }, width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 }, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '3px solid', borderColor: 'background.paper', zIndex: 2 }}>
                                    <Briefcase size={16} />
                                </Box>

                                <Experience
                                    company={item.company}
                                    from={item.startDate}
                                    to={item.endDate}
                                    location={item.location}
                                    position={item.position}
                                    responsibilities={item.responsibilities}
                                />
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>

            {/* Education Section */}
            <Box component={Section} id="education" ariaLabelledBy="education-header" sx={{ width: '100%', mb: 8 }}>
                <Stack alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <GraduationCap />
                    <Typography id="education-header" variant="h4" component="h2">Education</Typography>
                </Stack>

                <Box sx={{ maxWidth: 900, mx: 'auto', position: 'relative' }}>
                    {/* Full height timeline line (visible) */}
                    <Box aria-hidden sx={{ position: 'absolute', left: { xs: '28px', md: '40px' }, top: 0, bottom: 0, width: 2, bgcolor: 'grey.300', zIndex: 0 }} />

                    <Stack spacing={6}>
                        {educations.map((edu, index) => (
                            <Box key={index} sx={{ position: 'relative', pl: { xs: '64px', md: '88px' } }}>
                                {/* Marker */}
                                <Box sx={{ position: 'absolute', left: { xs: '14px', md: '22px' }, top: { xs: 6, md: 8 }, width: { xs: 28, md: 36 }, height: { xs: 28, md: 36 }, borderRadius: '50%', bgcolor: 'error.main', color: 'error.contrastText', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '3px solid', borderColor: 'background.paper', zIndex: 2 }}>
                                    <GraduationCap size={16} />
                                </Box>

                                <Education
                                    degree={edu.degree}
                                    field={edu.field}
                                    from={edu.startDate}
                                    to={edu.endDate}
                                    institution={edu.institution}
                                />
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}