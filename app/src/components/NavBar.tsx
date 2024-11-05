'use client';
import { useCallback } from 'react';
import Link from 'next/link';
import { ThemeToggler } from '@/components/DarkModeToggle';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { MenuIcon } from '@/components/Icons';
import { NavLink } from '@/components/NavLink';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useSafeState(false);
    const handleMenuClick = useCallback(
        () => {
            setIsOpen(!isOpen);
        },
        [setIsOpen, isOpen]
    );
    const handleKeyDown = useCallback(
        (event: { key: string; preventDefault: () => void; }) => {
            if (event.key === 'Enter' || event.key === ' ') {
                setIsOpen(!isOpen);
                event.preventDefault();
            }
        },
        [setIsOpen, isOpen]
    );
    return (
        <nav className="sticky top-0 bg-primary p-4 text-accent z-50" aria-label="Main navigation">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between">
                    <div className="flex space-x-16">
                        <div>
                            <Link href="/" className="flex items-center py-5 text-secondary hover:text-accent" aria-label="Go to Home Page">
                                <span className="font-bold text-lg">{`"<Rashad Ataf>"`}</span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-10" aria-label="Primary Menu">
                            <NavLink href='/' title='Home' />
                            <NavLink href='/about' title='About' />
                            <NavLink href='/projects' title='Projects' />
                            <NavLink href='/articles' title='Articles' />
                            <ThemeToggler className='py-5 px-3' />
                        </div>
                    </div>

                    <div id="mobile-menu" className="md:hidden flex items-center" aria-label="Mobile Menu">
                        <button
                            className="mobile-menu-button"
                            onClick={handleMenuClick}
                            onKeyDown={handleKeyDown}
                            aria-expanded={isOpen}
                            aria-controls="mobile-menu"
                        >
                            <MenuIcon className={`w-6 h-6 stroke-secondary hover:stroke-accent ${isOpen && 'stroke-secondary'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={`mobile-menu ${!isOpen && 'hidden'} md:hidden`}>
                <NavLink href='/' title='Home' className="block px-4" />
                <NavLink href='/about' title='About' className="block px-4" />
                <NavLink href='/projects' title='Projects' className="block px-4" />
                <NavLink href='/articles' title='Articles' className="block px-4" />
                <ThemeToggler className="block px-4" />
            </div>
        </nav>
    );
};
