import { permanentRedirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JEE Pulse - AI-Powered JEE Main & Advanced Trend Analysis | ZenithSchool.ai",
  description:
    "Free AI-powered JEE trend intelligence. Analyze 5+ years of JEE Main & Advanced patterns, chapter weightage, and get personalized study recommendations. Take free diagnostic tests.",
  alternates: {
    canonical: "/jee-intelligence",
  },
};

export default function Home() {
  permanentRedirect("/jee-intelligence");
}
