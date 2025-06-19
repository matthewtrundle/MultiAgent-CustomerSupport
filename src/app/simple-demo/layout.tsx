import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The AI Argument Clinic - Where AI Agents Fight It Out',
  description: 'Watch 5 opinionated AI agents with clashing personalities debate your problems. They argue, fight, throw shade, and somehow find solutions. Like Silicon Valley\'s most dysfunctional standup meeting!',
  keywords: 'AI agents, artificial intelligence, AI debate, AI arguments, multi-agent systems, AI personalities, tech humor, problem solving',
  authors: [{ name: 'The AI Argument Clinic' }],
  openGraph: {
    title: 'The AI Argument Clinic - Where AI Agents Fight It Out',
    description: 'Watch 5 opinionated AI agents with clashing personalities debate your problems. They argue, fight, throw shade, and somehow find solutions. Like Silicon Valley\'s most dysfunctional standup meeting!',
    url: 'https://your-domain.com/simple-demo',
    siteName: 'The AI Argument Clinic',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'The AI Argument Clinic - AI agents arguing and debating',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The AI Argument Clinic - Where AI Agents Fight It Out',
    description: 'Watch 5 opinionated AI agents with clashing personalities debate your problems. They argue, fight, throw shade, and somehow find solutions. Like Silicon Valley\'s most dysfunctional standup meeting!',
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