'use client';
import Image from "next/image";
import { Modal } from "./Modal";
import { useSafeState } from "@/hooks/useSafeState.hook";
import Link from "next/link";

interface ProjectProps {
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    liveUrl?: string;
    sourceCodeUrl?: string;
    playStoreUrl?: string;
    appStoreUrl?: string;
}


export const Project = ({
    title,
    description,
    imageUrl,
    technologies,
    liveUrl,
    sourceCodeUrl,
    playStoreUrl,
    appStoreUrl
}: ProjectProps) => {
    const [isModalOpen, setModalOpen] = useSafeState(false);
    return (
        <div className="flex flex-col bg-accent shadow-lg rounded-lg overflow-hidden h-full">
            <div className="w-full h-48 relative">
                <Image
                    src={imageUrl}
                    alt={`Screenshot of ${title}`}
                    className="w-full object-cover"
                    sizes="(max-width: 600px) 30vw, 20vw"
                    placeholder="blur"
                    blurDataURL={imageUrl}
                    quality={30}
                    fill
                    priority
                />
            </div>
            <div className="bg-primary p-4 flex flex-col flex-1">
                <h4 className="text-main text-xl font-bold mb-2">{title}</h4>
                <div className="text-main text-base flex-grow overflow-hidden max-h-12 truncate my-2">
                    {description}
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    aria-label="Read more about project description"
                    className="text-sm text-main hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition duration-300 bg-main hover:bg-secondary rounded px-2 py-1 cursor-pointer my-2">
                    Read More
                </button>
                <div className="flex flex-wrap my-2">
                    {technologies.map((tech, index) => (
                        <span key={index} className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-main mr-2 mb-2">{tech}</span>
                    ))}
                </div>
                <div className="mt-auto">
                    <div className="flex justify-between items-center pt-2">
                        {liveUrl && <Link href={liveUrl} className="text-sm text-main hover:text-secondary transition duration-300" target="_blank" rel="noreferrer">Live Demo</Link>}
                        {sourceCodeUrl && <Link href={sourceCodeUrl} className="text-sm text-main hover:text-secondary transition duration-300" target="_blank" rel="noreferrer">Source Code</Link>}
                        {playStoreUrl && <Link href={playStoreUrl} className="text-sm text-main hover:text-secondary transition duration-300" target="_blank" rel="noreferrer">Play Store</Link>}
                        {appStoreUrl && <Link href={appStoreUrl} className="text-sm text-main hover:text-secondary transition duration-300" target="_blank" rel="noreferrer">App Store</Link>}
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <h3 className="text-secondary text-lg font-bold mb-3">{title}</h3>
                <p className="text-secondary">{description}</p>
            </Modal>
        </div>
    );
}
