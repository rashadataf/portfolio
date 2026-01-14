'use client';
import Link from 'next/link';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';

const SidebarContent = ({
    isMobile,
    items,
    isActive,
    signOut,
    handleDrawerClose,
    isCollapsed
}: {
    isMobile: boolean;
    items: { href: string; label: string }[];
    isActive: (path: string) => boolean;
    signOut: () => void;
    handleDrawerClose: () => void;
    isCollapsed: boolean;
}) => (
    <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, flexShrink: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Admin Panel</Typography>
            {isMobile && (
                <IconButton onClick={handleDrawerClose} size="small">
                    <ChevronLeftIcon fontSize="small" />
                </IconButton>
            )}
        </Box>

        <Box sx={{ flex: '1 1 auto', p: 1 }}>
            <List>
                {items.map((it) => (
                    <ListItemButton 
                        key={it.href} 
                        component={Link} 
                        href={it.href} 
                        selected={isActive(it.href)} 
                        sx={{ borderRadius: 1, mb: 0.5 }}
                        onClick={isMobile ? handleDrawerClose : undefined}
                    >
                        <ListItemText primary={it.label} slotProps={{ primary: { noWrap: isCollapsed } }} />
                    </ListItemButton>
                ))}
            </List>
        </Box>

        <Box sx={{ p: 2 }}>
            <form action={signOut}>
                <Stack>
                    <Button type="submit" variant="contained" color="error" size="small" fullWidth>
                        Logout
                    </Button>
                </Stack>
            </form>
        </Box>
    </>
);

export const AdminSidebar = ({
    signOut,
}: {
    signOut: () => void
}) => {
    const [isCollapsed, setIsCollapsed] = useSafeState(false);
    const [mobileOpen, setMobileOpen] = useSafeState(false);
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const isActive = (path: string) => pathname === path;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerClose = () => {
        setMobileOpen(false);
    };

    const items = [
        { href: '/admin', label: 'Home' },
        { href: '/admin/articles', label: 'All Articles' },
        { href: '/admin/profile', label: 'Profile' },
        { href: '/admin/skills', label: 'Skills' },
        { href: '/admin/experience', label: 'Experience' },
        { href: '/admin/education', label: 'Education' },
        { href: '/admin/projects', label: 'Projects' },
        { href: '/admin/files', label: 'Files' },
        { href: '/admin/articles/drafts', label: 'Drafts' },
        { href: '/admin/articles/published', label: 'Published' },
        { href: '/admin/articles/archived', label: 'Archived' },
        { href: '/admin/settings', label: 'Settings' },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            {isMobile && (
                <IconButton
                    onClick={handleDrawerToggle}
                    sx={{ position: 'fixed', top: 16, left: 16, zIndex: theme.zIndex.appBar + 1, bgcolor: 'background.paper' }}
                    aria-label="Open admin menu"
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* Mobile Drawer */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerClose}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': { 
                            width: 280,
                            bgcolor: 'background.paper',
                            color: 'text.primary'
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                        <SidebarContent 
                            isMobile={isMobile}
                            items={items}
                            isActive={isActive}
                            signOut={signOut}
                            handleDrawerClose={handleDrawerClose}
                            isCollapsed={isCollapsed}
                        />
                    </Box>
                </Drawer>
            ) : (
                /* Desktop Sidebar */
                <Box sx={{ position: 'sticky', top: 0, alignSelf: 'flex-start', bgcolor: 'background.paper', color: 'text.primary', display: 'flex', flexDirection: 'column', height: '100vh', transition: 'width .2s', width: isCollapsed ? 72 : 240, borderRight: 1, borderColor: 'divider', zIndex: (theme) => theme.zIndex.appBar }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, flexShrink: 0 }}>
                        {!isCollapsed && <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Admin Panel</Typography>}
                        <IconButton onClick={() => setIsCollapsed(!isCollapsed)} size="small" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                            {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                        </IconButton>
                    </Box>

                    <Box sx={{ flex: '1 1 auto', p: 1 }}>
                        <List>
                            {items.map((it) => (
                                <ListItemButton key={it.href} component={Link} href={it.href} selected={isActive(it.href)} sx={{ borderRadius: 1, mb: 0.5 }}>
                                    <ListItemText primary={it.label} slotProps={{ primary: { noWrap: isCollapsed } }} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>

                    {!isCollapsed && (
                        <Box sx={{ p: 2 }}>
                            <form action={signOut}>
                                <Stack>
                                    <Button type="submit" variant="contained" color="error" size="small" fullWidth>
                                        Logout
                                    </Button>
                                </Stack>
                            </form>
                        </Box>
                    )}
                </Box>
            )}
        </>
    );
};
