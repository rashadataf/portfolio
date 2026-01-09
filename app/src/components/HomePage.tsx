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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-around', flexGrow: 1, px: { xl: 8 } }}>

            <Section id="main-image" ariaLabelledBy="main-page-image" className="p-10 md:p-30 md:w-1/2">
                <Paper elevation={3} sx={{ p: 2, display: 'flex', justifyContent: 'center', borderRadius: 2 }}>
                    <Image
                        src={profile?.heroImageUrl || profilePic}
                        alt="Portrait of Rashad Ataf, Full Stack Developer."
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        loading="eager"
                        width={450}
                        height={450}
                        priority
                        quality={75}
                    />
                </Paper>
            </Section>

            <Section id="main-page" ariaLabelledBy="main-page-header" className="w-full p-4 md:w-1/2">
                <Typography id="main-page-header" variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                    {profile?.headline ? (
                        <span>{profile.headline}</span>
                    ) : (
                        <>Welcome to My <span style={{ color: 'var(--accent-color)' }}>Portfolio</span></>
                    )}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.125rem' }}>
                    {profile?.bioEn || "I am a Full Stack Developer with a focus on crafting user-centric web and mobile applications. My expertise lies in delivering simple yet effective solutions across diverse platforms, ensuring a seamless user experience."}
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 4 }}>
                    <Button component={Link} href={profile?.resumeUrl || "/Rashad Ataf.pdf"} variant="default" size="sm">
                        Download Resume
                    </Button>
                    <Button component={Link} href={`mailto:${profile?.contactEmail || "rashadattaf@gmail.com"}`} variant="ghost" size="sm">
                        Contact Me
                    </Button>
                </Stack>
            </Section>
        </Box>
    )
}