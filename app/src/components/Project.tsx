'use client';
import Image from "next/image";
import Link from "next/link";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useSafeState } from "@/hooks/useSafeState.hook";
import { Modal } from "@/components/Modal";
import { Button } from '@/components/UI/Button';

interface ProjectProps {
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    liveUrl?: string;
    sourceCodeUrl?: string;
    playStoreUrl?: string;
    appStoreUrl?: string;
}

export const Project = ({
    title,
    description,
    imageUrl,
    technologies,
    liveUrl,
    sourceCodeUrl,
    playStoreUrl,
    appStoreUrl
}: ProjectProps) => {
    const [isModalOpen, setModalOpen] = useSafeState(false);
    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform .15s ease, boxShadow .15s ease', '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 } }}>
            <Box sx={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden', borderTopLeftRadius: 2, borderTopRightRadius: 2 }}>
                <Image
                    src={imageUrl}
                    alt={`Screenshot of ${title}`}
                    sizes="(max-width: 600px) 30vw, 20vw"
                    quality={60}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </Box>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {description}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    {technologies.slice(0, 3).map((tech) => (
                        <Chip key={tech} label={tech} size="small" variant="outlined" sx={{ textTransform: 'none' }} />
                    ))}
                    {technologies.length > 3 && (
                        <Chip label={`+${technologies.length - 3} more`} size="small" variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => setModalOpen(true)} />
                    )}
                </Box>
            </CardContent>

            <CardActions sx={{ mt: 'auto', px: 2, pb: 2, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    {liveUrl && (
                        <Button component={Link} href={liveUrl} target="_blank" rel="noreferrer" variant="ghost" size="sm" startIcon={<OpenInNewIcon fontSize="small" />} sx={{ color: 'primary.main', textDecoration: 'none', textTransform: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Live
                        </Button>
                    )}

                    {sourceCodeUrl && (
                        <Button component={Link} href={sourceCodeUrl} target="_blank" rel="noreferrer" variant="ghost" size="sm" startIcon={<GitHubIcon fontSize="small" />} sx={{ color: 'primary.main', textDecoration: 'none', textTransform: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Code
                        </Button>
                    )}

                    {playStoreUrl && (
                        <Button component={Link} href={playStoreUrl} target="_blank" rel="noreferrer" variant="ghost" size="sm" startIcon={<AndroidIcon fontSize="small" />} sx={{ color: 'primary.main', textDecoration: 'none', textTransform: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Play
                        </Button>
                    )}

                    {appStoreUrl && (
                        <Button component={Link} href={appStoreUrl} target="_blank" rel="noreferrer" variant="ghost" size="sm" startIcon={<AppleIcon fontSize="small" />} sx={{ color: 'primary.main', textDecoration: 'none', textTransform: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            App
                        </Button>
                    )}
                </Box>
                <Box>
                    <Button variant="default" size="sm" onClick={() => setModalOpen(true)}>Read More</Button>
                </Box>
            </CardActions>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>{title}</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{description}</Typography>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {technologies.map((tech) => (
                                <Chip key={tech} label={tech} size="small" variant="outlined" sx={{ textTransform: 'none' }} />
                            ))}
                        </Box>
                    </Box>

                    {imageUrl && (
                        <Box sx={{ width: { xs: '100%', md: 220 }, height: { xs: 160, md: 140 }, position: 'relative', borderRadius: 1, overflow: 'hidden', boxShadow: 1 }}>
                            <Image src={imageUrl} alt={`Screenshot of ${title}`} fill style={{ objectFit: 'cover' }} />
                        </Box>
                    )}
                </Box>
            </Modal>
        </Card>
    );
}
