'use client';
import Link from 'next/link';
import { NavLinkProp } from '@/types';
import { usePathname } from 'next/navigation';
import { ThemeToggler } from './DarkModeToggle';
import React, { useCallback } from 'react';
import { useSafeState } from '@/hooks/useSafeState.hook';
import { MenuIcon } from './Icons';

const NavLink = ({ href, title, className }: NavLinkProp) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const linkClass = `${className ? className : 'py-5 px-3 hover:text-secondary'} 
                       ${isActive ? 'text-secondary font-bold' : ''}`;
    return (
        <Link href={href} className={linkClass} >
            {title}
        </Link >
    );
}

const Navbar = () => {
    const [isOpen, setIsOpen] = useSafeState(false);
    const handleMenuClick = useCallback(
        () => {
            setIsOpen(!isOpen);
        },
        [setIsOpen, isOpen]
    );
    return (
        <nav className="bg-primary p-4 text-main">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between">
                    <div className="flex space-x-16">
                        <div>
                            <Link href="/" className="flex items-center py-5 hover:text-secondary" >
                                <span className="font-bold">Rashad Ataf</span>
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-10">
                            <NavLink href='/' title='Home' />
                            <NavLink href='/about' title='About' />
                            <NavLink href='/projects' title='Projects' />
                            <NavLink href='/articles' title='Articles' />
                            <ThemeToggler className='py-5 px-3 hover:text-secondary' />
                        </div>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button className="mobile-menu-button" onClick={handleMenuClick}>
                            <MenuIcon className={`w-6 h-6 hover:stroke-secondary ${isOpen && 'stroke-secondary'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={`mobile-menu ${!isOpen && 'hidden'} md:hidden`}>
                <NavLink href='/' title='Home' className="block py-2 px-4 hover:text-secondary" />
                <NavLink href='/about' title='About' className="block py-2 px-4 hover:text-secondary" />
                <NavLink href='/projects' title='Projects' className="block py-2 px-4 hover:text-secondary" />
                <NavLink href='/articles' title='Articles' className="block py-2 px-4 hover:text-secondary" />
                <ThemeToggler className="block py-2 px-4 hover:text-secondary" />
            </div>
        </nav>
    );
};

export default Navbar;
