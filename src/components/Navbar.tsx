import { useState } from 'react';
import { Link } from 'react-router-dom';

import { navLinks } from '../constants';
import { logo, menu, close } from '../assets';
import { useScroll } from '../hooks/useScroll';

export const Navbar = () => {
    const [active, setActive] = useState('');
    const [isMenuOpen, toggleMenu] = useState(false);
    const isScrolled = useScroll(100);

    return (
        <nav className={`w-full flex items-center py-5 fixed top-0 z-50 sm:px-16 px-6 ${isScrolled ? 'bg-primary' : 'bg-transparent'}`}>
            <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
                <Link
                    to='/'
                    className='flex items-center gap-2'
                    onClick={() => setActive('')}
                >
                    <img src={logo} alt='rashad portfolio logo' className='sm:h-12 h-10' />
                    <p className='text-white sm:text-xl text-base font-bold cursor-pointer flex'>
                        Rashad &nbsp;
                        <span className='xs:block hidden'> | Full Stack</span>
                    </p>
                </Link>

                <ul className='list-none hidden sm:flex flex-row gap-10'>
                    {
                        navLinks.map(
                            (nav) => (
                                <li
                                    key={nav.id}
                                    className={`${active === nav.title ? 'text-white' : 'text-secondary'} hover:text-white text-xl font-medium cursor-pointer`}
                                    onClick={() => setActive(nav.title)}
                                >
                                    <a href={`#${nav.id}`}>{nav.title}</a>
                                </li>
                            )
                        )
                    }
                </ul>

                <div className='sm:hidden flex flex-1 justify-end items-center'>
                    <img
                        src={isMenuOpen ? close : menu}
                        alt='menu'
                        className='w-7 h-7 object-contain menu'
                        onClick={() => toggleMenu(!isMenuOpen)}
                    />

                    <div
                        className={`${!isMenuOpen ? 'hidden' : 'flex'} mene-gradient p-6 absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
                    >
                        <ul className='list-none flex justify-end items-start flex-1 flex-col gap-4'>
                            {
                                navLinks.map(
                                    (nav) => (
                                        <li
                                            key={nav.id}
                                            className={`font-medium cursor-pointer hover:text-white text-[16px] ${active === nav.title ? 'text-white' : 'text-sky-300'}`}
                                            onClick={() => {
                                                toggleMenu(!isMenuOpen);
                                                setActive(nav.title);
                                            }}
                                        >
                                            <a href={`#${nav.id}`}>{nav.title}</a>
                                        </li>
                                    )
                                )
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};