'use client';
import Image from "next/image";
import Link from "next/link";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
        <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ position: 'relative', width: '100%', height: 220 }}>
                <Image
                    src={imageUrl}
                    alt={`Screenshot of ${title}`}
                    className="w-full object-cover"
                    sizes="(max-width: 600px) 30vw, 20vw"
                    placeholder="blur"
                    blurDataURL={imageUrl}
                    quality={40}
                    fill
                    priority
                />
            </Box>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', maxHeight: 56 }}>
                    {description}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                    {technologies.map((tech, index) => (
                        <Chip key={index} label={tech} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))}
                </Stack>
            </CardContent>

            <CardActions sx={{ mt: 'auto', px: 2, pb: 2, justifyContent: 'space-between' }}>
                <Box>
                    {liveUrl && <Button asChild variant="ghost" size="sm"><a href={liveUrl} target="_blank" rel="noreferrer">Live Demo</a></Button>}
                    {sourceCodeUrl && <Button asChild variant="ghost" size="sm"><a href={sourceCodeUrl} target="_blank" rel="noreferrer">Source Code</a></Button>}
                </Box>
                <Box>
                    <Button variant="default" size="sm" onClick={() => setModalOpen(true)}>Read More</Button>
                </Box>
            </CardActions>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>{title}</Typography>
                <Typography variant="body1">{description}</Typography>
            </Modal>
        </Card>
    );
}
