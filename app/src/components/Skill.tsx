'use client';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { useSafeState } from '@/hooks/useSafeState.hook';

interface SkillProps {
    name: string;
    percentage: number;
}

export const Skill = ({ name, percentage }: SkillProps) => {
    const [value, setValue] = useSafeState<number>(0);

    useEffect(() => {
        const el = document.getElementById(`skill-${name}`);
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setValue(percentage);
            } else {
                setValue(0);
            }
        }, { threshold: 0.6 });

        if (el) observer.observe(el);
        return () => { if (el) observer.disconnect(); };
    }, [name, percentage, setValue]);

    return (
        <Box id={`skill-${name}`} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Typography sx={{ width: '40%', fontWeight: 600 }}>{name}</Typography>
            <Box sx={{ width: '60%' }}>
                <LinearProgress variant="determinate" value={value} sx={{ height: 8, borderRadius: 2 }} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} />
                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>{percentage}% proficient</Typography>
            </Box>
        </Box>
    );
}
