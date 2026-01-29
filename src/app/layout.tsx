import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://jeepulse.ai";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066b3" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "JEE Main 2025 Chapter Wise Weightage | Free Analysis & Mock Test",
    template: "%s | JEE Pulse by ZenithSchool.ai",
  },
  description:
    "Free JEE Main 2025 chapter wise weightage for Physics, Chemistry & Maths. AI analysis of 500+ questions from 5 years. High weightage topics, rising concepts & free diagnostic test. Crack IIT JEE with data-driven preparation.",
  keywords: [
    "JEE Main 2025",
    "JEE Main 2026",
    "JEE Main chapter wise weightage",
    "JEE Main chapter wise weightage 2025",
    "JEE Advanced 2025",
    "JEE Main Physics weightage",
    "JEE Main Chemistry weightage",
    "JEE Main Maths weightage",
    "high weightage chapters JEE",
    "important chapters for JEE Mains 2025",
    "JEE Main syllabus 2025",
    "JEE preparation tips",
    "JEE mock test free",
    "NTA JEE Main",
    "IIT JEE preparation",
    "JEE Main percentile to rank",
    "JEE previous year analysis",
    "JEE Main expected cutoff",
    "best books for JEE 2025",
    "JEE Main marks vs percentile",
    "how to crack JEE Main",
    "JEE Main important topics Physics",
    "Organic Chemistry JEE weightage",
    "Calculus JEE Main weightage",
    "Modern Physics JEE questions",
  ],
  authors: [{ name: "ZenithSchool.ai", url: "https://zenithschool.ai" }],
  creator: "ZenithSchool.ai",
  publisher: "ZenithSchool.ai",
  category: "Education",
  classification: "Educational Tool",
  applicationName: "JEE Pulse",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-IN": BASE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "JEE Pulse",
    title: "JEE Main 2025 Chapter Wise Weightage - Physics, Chemistry, Maths | Free",
    description:
      "Free JEE Main chapter wise weightage analysis. Know high weightage topics in Physics, Chemistry & Maths. 500+ questions analyzed. Take free diagnostic test & crack IIT JEE.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JEE Main 2025 Chapter Wise Weightage - Free Analysis by JEE Pulse",
        type: "image/png",
      },
    ],
    countryName: "India",
  },
  twitter: {
    card: "summary_large_image",
    title: "JEE Main 2025 Chapter Wise Weightage | Free Analysis",
    description:
      "High weightage chapters for JEE Main 2025. Physics, Chemistry, Maths topic analysis from 5 years of papers. Free diagnostic test included.",
    images: ["/og-image.png"],
    creator: "@ZenithSchoolAI",
    site: "@ZenithSchoolAI",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these after setting up Search Console and Bing Webmaster Tools
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JEE Pulse",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0066b3",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
