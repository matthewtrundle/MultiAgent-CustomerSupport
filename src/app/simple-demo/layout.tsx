import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agents Being Salty - AI Personalities Clash & Solutions Emerge',
  description: 'Watch 5 opinionated AI agents roast each other while solving your problems. They throw shade, argue about everything, and somehow find solutions. Like a tech Twitter thread come to life!',
  keywords: 'AI agents, artificial intelligence, AI personalities, multi-agent systems, AI debate, tech humor, problem solving, roasting',
  authors: [{ name: 'Agents Being Salty' }],
  openGraph: {
    title: 'Agents Being Salty - AI Personalities Clash & Solutions Emerge',
    description: 'Watch 5 opinionated AI agents roast each other while solving your problems. They throw shade, argue about everything, and somehow find solutions. Like a tech Twitter thread come to life!',
    url: 'https://your-domain.com/simple-demo',
    siteName: 'Agents Being Salty',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Agents Being Salty - AI agents roasting each other while problem solving',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agents Being Salty - AI Personalities Clash & Solutions Emerge',
    description: 'Watch 5 opinionated AI agents roast each other while solving your problems. They throw shade, argue about everything, and somehow find solutions. Like a tech Twitter thread come to life!',
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function SimpleDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}