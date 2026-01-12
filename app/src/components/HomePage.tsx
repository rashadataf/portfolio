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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: { xs: 'center', md: 'space-between' }, gap: { xs: 4, md: 8 }, flexGrow: 1, px: { xs: 3, md: 6, xl: 8 }, py: { xs: 4, md: 8 } }}>

            <Section id="main-image" ariaLabelledBy="main-page-image" className="p-2 md:w-1/2" sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Paper elevation={6} sx={{ p: 2, borderRadius: 2, boxShadow: 6, width: { xs: 320, sm: 480, md: 560 }, maxWidth: '100%', overflow: 'hidden' }}>
                    <Box sx={{ position: 'relative', width: '100%', height: { xs: 400, sm: 400, md: 520 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}>
                        <Image
                            src={profile?.heroImageUrl || profilePic}
                            alt="Portrait of Rashad Ataf, Full Stack Developer."
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                            quality={75}
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

            <Section id="main-page" ariaLabelledBy="main-page-header" className="w-full p-2 md:w-1/2" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ maxWidth: 720 }}>
                    <Typography id="main-page-header" variant="h1" component="h1" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3.25rem' }, lineHeight: 1.05 }}>
                        {profile?.headline ? (
                            <span>{profile.headline}</span>
                        ) : (
                            <>Welcome to My <Box component="span" sx={{ color: 'primary.main' }}>Portfolio</Box></>
                        )}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, color: 'text.secondary' }}>
                        {profile?.bioEn || "I am a Full Stack Developer with a focus on crafting user-centric web and mobile applications. My expertise lies in delivering simple yet effective solutions across diverse platforms, ensuring a seamless user experience."}
                    </Typography>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
                        <Button component={Link} href={profile?.resumeUrl || "/Rashad Ataf.pdf"} variant="default" size="sm" sx={{ textTransform: 'uppercase', px: 3, py: 1.25 }}>
                            DOWNLOAD RESUME
                        </Button>

                        <Button component={Link} href={`mailto:${profile?.contactEmail || "rashadattaf@gmail.com"}`} variant="ghost" size="sm" sx={{ textTransform: 'none' }}>
                            Contact Me
                        </Button>
                    </Stack>
                </Box>
            </Section>
        </Box>
    )
}