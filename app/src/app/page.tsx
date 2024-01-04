'use client'

import Image from "next/image";
import Footer from "@/components/Footer";

export default function Home() {

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-around flex-grow">
        {/* <Image
          src=""
          alt="Hero Image"
          className="w-full md:w-1/2 p-4"
        /> */}
        <div className="w-full md:w-1/2 p-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">Welcome to My Portfolio</h1>
          <p className="text-lg">
            I am a MERN stack developer with a passion for building engaging and efficient web applications.
          </p>
        </div>
      </div>

      <Footer />
    </>
  )
}
