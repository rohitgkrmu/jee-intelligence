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
    default: "JEE Pulse - AI-Powered JEE Main & Advanced Trend Analysis | ZenithSchool.ai",
    template: "%s | JEE Pulse - ZenithSchool.ai",
  },
  description:
    "Free AI-powered JEE trend intelligence platform. Analyze 5+ years of JEE Main & Advanced patterns, chapter weightage, rising concepts, and take free diagnostic tests. Get personalized study recommendations to crack IIT JEE.",
  keywords: [
    "JEE Main 2025",
    "JEE Advanced 2025",
    "IIT JEE preparation",
    "JEE chapter weightage",
    "JEE trend analysis",
    "JEE important topics",
    "JEE question patterns",
    "JEE Physics important chapters",
    "JEE Chemistry weightage",
    "JEE Mathematics topics",
    "JEE diagnostic test",
    "JEE mock test free",
    "JEE preparation strategy",
    "IIT entrance exam",
    "JEE coaching online",
    "JEE study material",
    "JEE previous year analysis",
    "NTA JEE Main",
    "JEE 2025 preparation",
    "best topics for JEE",
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
    title: "JEE Pulse - Free AI-Powered JEE Trend Analysis & Diagnostic Test",
    description:
      "Analyze 5+ years of JEE Main & Advanced patterns with AI. Get chapter weightage, rising concepts, and take free diagnostic tests for personalized study recommendations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JEE Pulse - AI-Powered JEE Intelligence by ZenithSchool.ai",
        type: "image/png",
      },
    ],
    countryName: "India",
  },
  twitter: {
    card: "summary_large_image",
    title: "JEE Pulse - Free AI-Powered JEE Trend Analysis",
    description:
      "Analyze JEE Main & Advanced patterns with AI. Get chapter weightage, rising concepts, and free diagnostic tests.",
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
