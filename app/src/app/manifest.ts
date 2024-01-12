import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rashad Ataf Portfolio',
    short_name: 'RA Portfolio',
    description: 'Portfolio of Rashad Ataf, showcasing skills and projects in Full Stack Web and Mobile Development.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f8f9fa',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }
}
