import Script from "next/script";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://jeepulse.ai";

interface JsonLdProps {
  type?: "organization" | "website" | "faq" | "educationalOrganization";
}

export function JsonLd({ type = "website" }: JsonLdProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "ZenithSchool.ai",
    alternateName: "Zenith School",
    url: "https://zenithschool.ai",
    logo: `${BASE_URL}/logo.png`,
    description:
      "AI-powered education platform providing JEE preparation tools and analytics",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JEE Pulse - JEE Main Chapter Wise Weightage",
    alternateName: "JEE Main 2025 Weightage Analysis",
    url: BASE_URL,
    description:
      "Free JEE Main 2025 chapter wise weightage for Physics, Chemistry & Maths. AI analysis of high weightage topics, rising concepts, and free JEE mock test with instant results.",
    publisher: {
      "@type": "Organization",
      name: "ZenithSchool.ai",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/jee-intelligence?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const educationalAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JEE Main Mock Test - Free Diagnostic",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "500",
      bestRating: "5",
      worstRating: "1",
    },
    description:
      "Free JEE Main mock test covering high weightage topics from Physics, Chemistry & Maths. 12 questions with instant AI-powered results, subject-wise analysis, and personalized JEE 2025 preparation recommendations.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is JEE Main chapter wise weightage?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JEE Main chapter wise weightage shows how many questions come from each chapter in Physics, Chemistry, and Maths. High weightage chapters include Calculus (12-15 questions), Organic Chemistry (10-12 questions), and Modern Physics (8-10 questions). JEE Pulse analyzes 500+ questions from 5 years of JEE papers to show exact weightage patterns.",
        },
      },
      {
        "@type": "Question",
        name: "Which are the high weightage chapters for JEE Main 2025?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "High weightage chapters for JEE Main 2025: Physics - Modern Physics, Electrostatics, Current Electricity, Optics. Chemistry - Organic Chemistry (Aldehydes, Ketones), Physical Chemistry (Equilibrium, Thermodynamics), p-Block elements. Maths - Calculus, 3D Geometry, Matrices, Coordinate Geometry. These topics contribute 65-70% of the paper.",
        },
      },
      {
        "@type": "Question",
        name: "Is the JEE mock test on JEE Pulse free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the JEE diagnostic test is 100% free. It includes 12 questions covering high weightage topics from Physics, Chemistry, and Maths. You get instant AI-powered analysis, subject-wise score breakdown, and personalized study recommendations without any payment or signup.",
        },
      },
      {
        "@type": "Question",
        name: "How to use JEE Main chapter wise weightage for preparation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Start with high weightage chapters that appear frequently - Calculus and Algebra cover 65-70% of Maths, Organic Chemistry dominates Chemistry section. Focus on NCERT first, then practice previous year questions. Use JEE Pulse to identify rising concepts that are appearing more frequently in recent exams.",
        },
      },
    ],
  };

  const schemas = {
    organization: organizationSchema,
    website: websiteSchema,
    educationalOrganization: organizationSchema,
    faq: faqSchema,
  };

  const combinedSchema = [websiteSchema, organizationSchema, educationalAppSchema];

  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(type === "faq" ? faqSchema : combinedSchema),
      }}
      strategy="afterInteractive"
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema),
      }}
      strategy="afterInteractive"
    />
  );
}
