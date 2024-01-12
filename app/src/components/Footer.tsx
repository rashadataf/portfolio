'use client';
import React from 'react';
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, StackOverflowIcon, TwitterIcon, WhatsAppIcon } from './Icons';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-primary p-4 text-secondary">
            <div className="flex justify-center space-x-4">
                <Link href="https://www.linkedin.com/in/rashad-ataf-99081416b/" target="_blank" rel="noreferrer" title="linkedin">
                    <LinkedinIcon className="w-6 h-6 hover:text-main" />
                </Link>
                <Link href="https://github.com/rashadataf/" target="_blank" rel="noreferrer" title="github">
                    <GithubIcon className="w-6 h-6 hover:text-main" />
                </Link>
                <Link href="https://www.facebook.com/Rashad.Attaf" target="_blank" rel="noreferrer" title="facebook">
                    <FacebookIcon className="w-6 h-6 hover:text-main" />
                </Link>
                <Link href="https://twitter.com/ataf_rasha95156" target="_blank" rel="noreferrer" title="twitter">
                    <TwitterIcon className="w-6 h-6 hover:text-main" />
                </Link>
                <Link href="https://www.instagram.com/rashad_ataf/" target="_blank" rel="noreferrer" title="instagram">
                    <InstagramIcon className="w-6 h-6 hover:text-main" />
                </Link>
                <Link href="https://stackoverflow.com/users/11755926/rashad-ataf" target="_blank" rel="noreferrer" title="stackoverflow">
                    <StackOverflowIcon className="w-6 h-6 hover:text-main" />
                </Link>
                <Link href="https://wa.me/+447438461336" target="_blank" rel="noreferrer" title="whatsapp">
                    <WhatsAppIcon className="w-6 h-6 hover:text-main" />
                </Link>
            </div>
        </footer>
    );
};

export default Footer;
