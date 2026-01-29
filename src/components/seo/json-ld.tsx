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
    name: "JEE Pulse",
    alternateName: "JEE Pulse by ZenithSchool.ai",
    url: BASE_URL,
    description:
      "AI-powered JEE trend intelligence and diagnostic testing platform. Analyze JEE Main and Advanced patterns, chapter weightage, and get personalized study recommendations.",
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
    name: "JEE Pulse Diagnostic Test",
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
      "Free 12-question JEE readiness diagnostic test with AI-powered analysis and personalized study recommendations",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is JEE Pulse?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JEE Pulse is an AI-powered platform that analyzes 5+ years of JEE Main and Advanced exam papers to provide trend intelligence, chapter weightage analysis, and personalized study recommendations for JEE aspirants.",
        },
      },
      {
        "@type": "Question",
        name: "Is the JEE diagnostic test free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the 12-question JEE readiness diagnostic test is completely free. You get instant results with personalized recommendations without any payment required.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate is the JEE trend analysis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our AI analyzes 500+ questions from JEE Main and Advanced papers spanning 5+ years, achieving 95% accuracy in predicting high-frequency concepts and chapter weightage patterns.",
        },
      },
      {
        "@type": "Question",
        name: "What subjects are covered in JEE Pulse?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JEE Pulse covers all three subjects tested in JEE: Physics, Chemistry, and Mathematics. Each subject includes detailed chapter weightage, rising/declining concepts, and difficulty analysis.",
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
