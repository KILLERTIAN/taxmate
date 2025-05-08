export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: ['/dashboard/', '/api/', '/auth/'],
    },
    sitemap: 'https://taxmate.vercel.app/sitemap.xml',
  }
} 