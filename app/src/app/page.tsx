'use client'

import Image from "next/image";
import Link from "next/link";
import profilePic from '../../public/images/rashad.png';

export default function Home() {

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-around flex-grow">
        <Image
          src={profilePic}
          alt="Hero Image"
          className="w-full p-28 md:w-1/2"
          width={2000}
          height={2300}
          priority
        />
        <div className="w-full md:w-1/2 p-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">Welcome to My Portfolio</h1>
          <p className="text-lg">
            I am a MERN stack developer with a passion for building engaging and efficient web applications.
          </p>
          <div className="flex flex-col max-w-[200px] md:max-w-none md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-8">
            <Link
              href="/resume.pdf"
              className="bg-primary hover:text-main text-secondary font-semibold py-2 px-4 rounded shadow"
              download
            >
              Download Resume
            </Link>
            <Link
              href="mailto:rashadattaf@gmail.com"
              className="bg-secondary hover:text-main text-primary font-semibold py-2 px-4 rounded shadow"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
