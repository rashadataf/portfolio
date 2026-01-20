'use client';
import { useCallback } from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Container from '@mui/material/Container';
import { ThemeToggler } from '@/components/DarkModeToggle';
import { useSafeState } from '@/hooks/useSafeState.hook';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from '@/components/NavLink';

export const Navbar = () => {
    const [open, setOpen] = useSafeState(false);

    const toggleDrawer = useCallback(() => {
        setOpen(!open);
    }, [setOpen, open]);

    const menuItems = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/projects', label: 'Projects' },
        { href: '/articles', label: 'Articles' },
    ];

    return (
        <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)', borderBottom: 1, borderColor: 'divider', backgroundColor: 'transparent' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: 64, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Link href="/" aria-label="Go to Home Page" style={{ textDecoration: 'none' }}>
                            <Typography 
                                variant="h6" 
                                component="span" 
                                sx={{ 
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    '&:hover': { 
                                        color: 'primary.main',
                                        textDecoration: 'none'
                                    }
                                }}
                            >
                                {`"<Rashad Ataf>"`}
                            </Typography>
                        </Link>
                    </Box>

                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2 }}>
                        {menuItems.map((m) => (
                            <NavLink key={m.href} href={m.href} title={m.label} />
                        ))}
                        <ThemeToggler />
                    </Box>

                    <IconButton edge="end" color="inherit" aria-label="menu" onClick={toggleDrawer} sx={{ display: { lg: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </Container>

            <Drawer anchor="right" open={open} onClose={toggleDrawer}>
                <Box sx={{ width: 260 }} role="presentation" onClick={toggleDrawer} onKeyDown={toggleDrawer}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.href} disablePadding>
                                <ListItemButton component="a" href={item.href}>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <ListItem>
                            <ListItemButton>
                                <ThemeToggler />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    );
};
