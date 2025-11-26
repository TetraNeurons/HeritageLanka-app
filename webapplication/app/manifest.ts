import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Heritage Lanka - Local Guides in Sri Lanka',
    short_name: 'Heritage Lanka',
    description: 'Connect with verified local guides in Sri Lanka for authentic travel experiences',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/images/logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
