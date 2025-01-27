'use client';
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from 'next/dynamic';
import { trackPageVisit } from "@/modules/analytics/analytics.controller";
import profilePic from '@public/images/rashad.webp';
import { Loader } from "@/components/Loader";

const Section = dynamic(() =>
    import('@/components/Section').then((mod) => mod.Section),
    {
        loading: () => <Loader />,
        ssr: true
    }
)

export async function getStaticProps() {
    return {
        props: {},
    };
}

export const HomePage = () => {
    useEffect(
        () => {
            trackPageVisit('Home');
        },
        []
    )
    return (
        <div className="flex flex-col md:flex-row items-center justify-around flex-grow xl:px-64">

            <Section id="main-image" ariaLabelledBy="main-page-image" className="p-10 md:p-30 md:w-1/2">
                <Image
                    src={profilePic}
                    alt="Portrait of Rashad Ataf, Full Stack Developer."
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    loading="eager"
                    width={450}
                    height={450}
                    priority
                    quality={15}
                />
            </Section>

            <Section id="main-page" ariaLabelledBy="main-page-header" className="w-full p-4 md:w-1/2">
                <h1 id="main-page-header" className="text-2xl md:text-4xl font-bold mb-4">Welcome to My <span className="text-accent-color">Portfolio</span></h1>
                <p className="text-lg">
                    I am a Full Stack Developer with a focus on crafting user-centric web and mobile applications. My expertise lies in delivering simple yet effective solutions across diverse platforms, ensuring a seamless user experience.
                </p>
                <div className="flex flex-col max-w-[200px] md:max-w-none md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-8">
                    <Link
                        href="/Rashad Ataf.pdf"
                        className="bg-[--text-color] text-white hover:scale-110 hover:shadow-md hover:shadow-accent-color font-semibold py-2 px-4 rounded shadow"
                        aria-label="Download Rashad Ataf’s Resume"
                        target="_blank"
                    >
                        Download Resume
                    </Link>
                    <Link
                        href="mailto:rashadattaf@gmail.com"
                        className="bg-accent-color text-white hover:scale-110 hover:shadow-md hover:shadow-[--text-color] font-semibold py-2 px-4 rounded shadow"
                    >
                        Contact Me
                    </Link>
                </div>
            </Section>
        </div>
    )
}