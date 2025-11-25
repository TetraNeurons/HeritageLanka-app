import type { Metadata } from "next";
import { Inter, Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AccessibilityWidget } from "@/components/accessibility/AccessibilityWidget";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const dancingScript = Dancing_Script({ 
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Heritage Lanka - Connect with Local Guides in Sri Lanka",
  description: "Discover Sri Lanka with verified local guides. Connect directly with experienced guides for authentic travel experiences across Sri Lanka. Manual verification, direct connection, local expertise.",
  keywords: "Sri Lanka travel, local guides Sri Lanka, tour guides Sri Lanka, travel Sri Lanka, Sri Lanka tourism, authentic travel experiences, verified guides, local tours",
  authors: [{ name: "Heritage Lanka" }],
  creator: "Heritage Lanka",
  publisher: "Heritage Lanka",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://heritagelanka.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Heritage Lanka',
    title: 'Heritage Lanka - Connect with Local Guides in Sri Lanka',
    description: 'Discover Sri Lanka with verified local guides. Connect directly with experienced guides for authentic travel experiences.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Heritage Lanka - Local Guides in Sri Lanka',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heritage Lanka - Connect with Local Guides in Sri Lanka',
    description: 'Discover Sri Lanka with verified local guides. Authentic travel experiences.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${dancingScript.variable} font-sans antialiased`}>
        {children}
        <AccessibilityWidget />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
