'use client';
import Link from 'next/link';
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, StackOverflowIcon, TwitterIcon, WhatsAppIcon } from '@/components/Icons';

export const Footer = () => {
    return (
        <footer className="sticky bottom-0 bg-primary p-4 text-secondary">
            <ul className="flex justify-center space-x-4 list-none">
                <li>
                    <Link href="https://www.linkedin.com/in/rashad-ataf-99081416b/" target="_blank" rel="noreferrer" title="linkedin" aria-label="Visit my LinkedIn">
                        <LinkedinIcon className="w-6 h-6 hover:text-accent" />
                    </Link>
                </li>
                <li>
                    <Link href="https://github.com/rashadataf/" target="_blank" rel="noreferrer" title="github" aria-label="Visit my GitHub">
                        <GithubIcon className="w-6 h-6 hover:text-accent" />
                    </Link>
                </li>
                <li>
                    <Link href="https://www.facebook.com/Rashad.Attaf" target="_blank" rel="noreferrer" title="facebook" aria-label="Visit my Facebook">
                        <FacebookIcon className="w-6 h-6 hover:text-accent" />
                    </Link>
                </li>
                <li>
                    <Link href="https://twitter.com/ataf_rasha95156" target="_blank" rel="noreferrer" title="twitter" aria-label="Visit my Twitter">
                        <TwitterIcon className="w-6 h-6 hover:text-accent" />
                    </Link>
                </li>
                <li>
                    <Link href="https://www.instagram.com/rashad_ataf/" target="_blank" rel="noreferrer" title="instagram" aria-label="Visit my Instagram">
                        <InstagramIcon className="w-6 h-6 hover:text-accent" />
                    </Link>
                </li>
                <li>
                    <Link href="https://stackoverflow.com/users/11755926/rashad-ataf" target="_blank" rel="noreferrer" title="stackoverflow" aria-label="Visit my Stackoverflow">
                        <StackOverflowIcon className="w-6 h-6 hover:text-accent" />
                    </Link>
                </li>
                <li>
                    <Link href="https://wa.me/+447438461336" target="_blank" rel="noreferrer" title="whatsapp" aria-label="Chat with me via Whatsapp">
                        <WhatsAppIcon className="w-6 h-6 hover:text-accent" />
                    </Link>
                </li>
            </ul>
        </footer>
    );
};
