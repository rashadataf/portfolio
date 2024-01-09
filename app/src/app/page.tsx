'use client'

import Image from "next/image";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-around flex-grow">
        {/* <Image
          src="/images/rashad.jpeg"
          alt="Hero Image"
          className="w-full md:w-1/2 p-32 rounded-[150px]"
          width={128}
          height={128}
          quality={100}
          
        /> */}
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

      <Footer />
    </>
  )
}
