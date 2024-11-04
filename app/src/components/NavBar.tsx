'use client';
import { useState, useCallback } from 'react';
import { ThemeToggler } from '@/components/DarkModeToggle';
import { MenuIcon } from '@/components/Icons';
import { NavLink } from './NavLink';
import Link from 'next/link';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMenuClick = useCallback(
        () => setIsOpen((prev) => !prev),
        []
    );

    return (
        <nav className="sticky top-0 bg-primary p-4 text-accent z-50" aria-label="Main navigation">
            <div className="max-w-6xl mx-auto px-4 flex justify-between">
                <Link href="/" className="flex items-center py-5 text-secondary hover:text-accent" aria-label="Go to Home Page" prefetch={false}>
                    <span className="font-bold text-lg">{`"<Rashad Ataf>"`}</span>
                </Link>

                <div className="hidden md:flex items-center space-x-10" aria-label="Primary Menu">
                    <NavLink href="/" title="Home" />
                    <NavLink href="/about" title="About" />
                    <NavLink href="/projects" title="Projects" />
                    <NavLink href="/articles" title="Articles" />
                    <ThemeToggler className="py-5 px-3" />
                </div>

                <button
                    className="md:hidden flex items-center mobile-menu-button"
                    onClick={handleMenuClick}
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                >
                    <MenuIcon className={`w-6 h-6 stroke-secondary hover:stroke-accent ${isOpen && 'stroke-secondary'}`} />
                </button>
            </div>

            {isOpen && (
                <div className="mobile-menu md:hidden">
                    <NavLink href="/" title="Home" />
                    <NavLink href="/about" title="About" />
                    <NavLink href="/projects" title="Projects" />
                    <NavLink href="/articles" title="Articles" />
                    <ThemeToggler className="block px-4" />
                </div>
            )}
        </nav>
    );
};
