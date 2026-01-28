import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JEE Pulse | ZenithSchool.ai",
    template: "%s | JEE Pulse",
  },
  description:
    "AI-powered JEE trend intelligence and diagnostic testing. Get personalized insights and study recommendations to ace your JEE preparation.",
  keywords: [
    "JEE Main",
    "JEE Advanced",
    "IIT JEE",
    "JEE preparation",
    "JEE coaching",
    "JEE practice",
    "JEE trends",
    "JEE analysis",
    "physics",
    "chemistry",
    "mathematics",
  ],
  authors: [{ name: "ZenithSchool.ai" }],
  creator: "ZenithSchool.ai",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://jeepulse.ai",
    siteName: "JEE Pulse",
    title: "JEE Pulse | ZenithSchool.ai",
    description:
      "AI-powered JEE trend intelligence and diagnostic testing. Get personalized insights and study recommendations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JEE Pulse by ZenithSchool.ai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JEE Pulse | ZenithSchool.ai",
    description:
      "AI-powered JEE trend intelligence and diagnostic testing. Get personalized insights and study recommendations.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
