import Link from 'next/link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, StackOverflowIcon, TwitterIcon, WhatsAppIcon } from '@/components/Icons';

export const Footer = () => {
    return (
        <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', py: 2, mt: 4 }}>
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {[
                    { href: 'https://www.linkedin.com/in/rashad-ataf-99081416b/', icon: <LinkedinIcon /> , label: 'Visit my LinkedIn'},
                    { href: 'https://github.com/rashadataf/', icon: <GithubIcon /> , label: 'Visit my GitHub'},
                    { href: 'https://www.facebook.com/Rashad.Attaf', icon: <FacebookIcon /> , label: 'Visit my Facebook'},
                    { href: 'https://twitter.com/ataf_rasha95156', icon: <TwitterIcon /> , label: 'Visit my Twitter'},
                    { href: 'https://www.instagram.com/rashad_ataf/', icon: <InstagramIcon /> , label: 'Visit my Instagram'},
                    { href: 'https://stackoverflow.com/users/11755926/rashad-ataf', icon: <StackOverflowIcon /> , label: 'Visit my Stackoverflow'},
                    { href: 'https://wa.me/+447438461336', icon: <WhatsAppIcon /> , label: 'Chat with me via Whatsapp'},
                ].map((item) => (
                    <IconButton
                        key={item.href}
                        component="a"
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={item.label}
                        sx={{ color: 'text.primary', '& svg': { width: 24, height: 24 } }}
                    >
                        {item.icon}
                    </IconButton>
                ))}
            </Stack>
            <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>© {new Date().getFullYear()} Rashad Ataf</Typography>
        </Box>
    );
};
