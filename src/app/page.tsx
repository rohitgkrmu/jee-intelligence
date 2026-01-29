import { permanentRedirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JEE Main 2025 Chapter Wise Weightage | Free Analysis & Mock Test",
  description:
    "Free JEE Main 2025 chapter wise weightage analysis. High weightage topics in Physics, Chemistry & Maths. AI-powered trend analysis from 500+ questions. Take free JEE mock test.",
  alternates: {
    canonical: "/jee-intelligence",
  },
};

export default function Home() {
  permanentRedirect("/jee-intelligence");
}
