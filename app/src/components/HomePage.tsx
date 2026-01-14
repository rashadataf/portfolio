'use client';
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { trackPageVisit } from "@/modules/analytics/analytics.controller";
import profilePic from '@public/images/rashad.webp';
import { Loader } from "@/components/Loader";
import { Profile } from "@/modules/profile/profile.entity";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/UI/Button';

const Section = dynamic(() =>
    import('@/components/Section').then((mod) => mod.Section),
    {
        loading: () => <Loader />,
        ssr: true
    }
)

interface HomePageProps {
    profile?: Profile;
}

export const HomePage = ({ profile }: HomePageProps) => {
    useEffect(
        () => {
            trackPageVisit('Home');
        },
        []
    )
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'center' },
            justifyContent: { xs: 'center', md: 'space-between' },
            gap: { xs: 3, sm: 4, md: 6, lg: 8 },
            flexGrow: 1,
            px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
            py: { xs: 3, sm: 4, md: 6, lg: 8 },
            minHeight: '100vh',
            maxWidth: '1400px',
            mx: 'auto'
        }}>

            <Section id="main-image" ariaLabelledBy="main-page-image" className="p-2 md:w-1/2" sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'center' },
                alignItems: 'center',
                order: { xs: 1, md: 1 },
                width: { xs: '100%', md: '50%' },
                maxWidth: { xs: '400px', sm: '480px', md: 'none' }
            }}>
                <Paper elevation={6} sx={{
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    borderRadius: { xs: 1.5, sm: 2, md: 2.5 },
                    boxShadow: { xs: 3, sm: 4, md: 6 },
                    width: '100%',
                    maxWidth: { xs: 320, sm: 480, md: 560 },
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out'
                }}>
                    <Box sx={{
                        position: 'relative',
                        width: '100%',
                        height: { xs: 400, sm: 400, md: 520 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        overflow: 'hidden'
                    }}>
                        <Image
                            src={profile?.heroImageUrl || profilePic}
                            alt="Portrait of Rashad Ataf, Full Stack Developer."
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                            quality={85}
                            sizes="(max-width: 599px) 320px, (max-width: 899px) 480px, 560px"
                            onError={(e) => {
                                console.error('Image failed to load:', profile?.heroImageUrl || '/images/rashad.webp');
                                // Fallback to a placeholder
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5IDE4QzQuOSAxOCA0IDE3LjEgNCAxNlY0QzQgMi45IDQuOSAyIDYgMkMxMC4yIDIgMTIgMTEuMiAxMiAyWk0xMiA3QzEwLjkgNyA5LjUgNy41IDkuNSA5QzkuNSA5LjUgOS45IDggMTEgOFMxMi44IDguNSA5LjUgOVoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                            }}
                        />
                    </Box>
                </Paper>
            </Section>

            <Section id="main-page" ariaLabelledBy="main-page-header" className="w-full p-2 md:w-1/2" sx={{
                display: 'flex',
                alignItems: { xs: 'center', md: 'center' },
                justifyContent: 'center',
                order: { xs: 2, md: 2 },
                width: { xs: '100%', md: '50%' },
                textAlign: { xs: 'center', md: 'left' }
            }}>
                <Box sx={{
                    maxWidth: { xs: '100%', sm: 600, md: 720, lg: 800 },
                    width: '100%',
                    px: { xs: 1, sm: 2, md: 0 }
                }}>
                    <Typography id="main-page-header" variant="h1" component="h1" sx={{
                        fontWeight: 700,
                        mb: { xs: 2, sm: 2.5, md: 3 },
                        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem', lg: '3.25rem' },
                        lineHeight: { xs: 1.1, sm: 1.05, md: 1.05 },
                        textAlign: { xs: 'center', md: 'left' }
                    }}>
                        {profile?.headline ? (
                            <span>{profile.headline}</span>
                        ) : (
                            <>Welcome to My <Box component="span" sx={{ color: 'primary.main' }}>Portfolio</Box></>
                        )}
                    </Typography>
                    <Typography variant="body1" sx={{
                        fontSize: { xs: '0.95rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' },
                        color: 'text.secondary',
                        lineHeight: { xs: 1.5, sm: 1.6, md: 1.6 },
                        mb: { xs: 3, sm: 3.5, md: 4 },
                        textAlign: { xs: 'center', md: 'left' },
                        maxWidth: { xs: '100%', md: '90%' }
                    }}>
                        {profile?.bioEn || "I am a Full Stack Developer with a focus on crafting user-centric web and mobile applications. My expertise lies in delivering simple yet effective solutions across diverse platforms, ensuring a seamless user experience."}
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{
                        mt: { xs: 3, sm: 3.5, md: 4 },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: { xs: 'center', sm: 'flex-start', md: 'flex-start' },
                        width: { xs: '100%', sm: 'auto' }
                    }}>
                        <Button
                            component={Link}
                            href={profile?.resumeUrl || "/Rashad Ataf.pdf"}
                            variant="default"
                            size="sm"
                            sx={{
                                textTransform: 'uppercase',
                                px: { xs: 3, sm: 3.5, md: 4 },
                                py: { xs: 1.25, sm: 1.5, md: 1.75 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                                width: { xs: '100%', sm: 'auto' },
                                minWidth: { xs: 'auto', sm: '160px' }
                            }}
                        >
                            DOWNLOAD RESUME
                        </Button>

                        <Button
                            component={Link}
                            href={`mailto:${profile?.contactEmail || "rashadattaf@gmail.com"}`}
                            variant="ghost"
                            size="sm"
                            sx={{
                                textTransform: 'none',
                                px: { xs: 3, sm: 3.5, md: 4 },
                                py: { xs: 1.25, sm: 1.5, md: 1.75 },
                                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                                width: { xs: '100%', sm: 'auto' },
                                minWidth: { xs: 'auto', sm: '140px' }
                            }}
                        >
                            Contact Me
                        </Button>
                    </Stack>
                </Box>
            </Section>
        </Box>
    )
}