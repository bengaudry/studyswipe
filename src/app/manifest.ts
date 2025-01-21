import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Studyswipe - Study with flashcards',
    short_name: 'Studyswipe',
    description: 'An app that allows you to study by gamifying your courses with flashcards.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-png.png',
        sizes: '100x100',
        type: 'image/png',
      },
    ],
  }
}