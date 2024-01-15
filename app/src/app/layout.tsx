import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rashad Portfolio | Software Engineer',
  description: 'portfolio for Rashad Ataf',
  manifest: "/manifest.json",
  twitter: {
    card: "summary_large_image",
    title: 'Rashad Ataf - Full Stack Developer',
    description: 'Welcome to Rashad Ataf\'s Portfolio - Discover my journey as a Full Stack Developer, my skills, projects, and more.',
    images: {
      url: 'https://www.rashadataf.tech/images/social.jpg'
    }
  },
  openGraph: {
    type: "website",
    url: "https://www.rashadataf.tech",
    title: 'Rashad Ataf - Full Stack Developer',
    description: 'Welcome to Rashad Ataf\'s Portfolio - Discover my journey as a Full Stack Developer, my skills, projects, and more.',
    images: {
      url: "https://www.rashadataf.tech/images/social.jpg"
    }
  },
  generator: "Next.js",
  authors: {
    name: "Rashad Ataf",
    url: "https://www.rashadataf.tech"
  },
  applicationName: "Rashad Attaf\'s Portfolio",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {children}
    </html>
  )
}
