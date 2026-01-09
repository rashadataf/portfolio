'use client';
import Link from 'next/link';
import Button from '@mui/material/Button';
import { usePathname } from 'next/navigation';
import { NavLinkProp } from '@/types';

export const NavLink = ({ href, title, className }: NavLinkProp) => {
    const currentPath = usePathname();
    const isActive = currentPath === href;

    return (
        <Button
            component={Link}
            href={href}
            disableRipple
            color={isActive ? 'primary' : 'inherit'}
            sx={{
                textTransform: 'none',
                fontWeight: isActive ? 700 : 600,
                px: 2,
                py: 1,
                '&:hover': { color: 'primary.main' },
                ...(className ? { className } : {}),
            }}
            aria-current={isActive ? 'page' : undefined}
        >
            {title}
        </Button>
    );
};
