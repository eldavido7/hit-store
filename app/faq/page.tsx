// app/faq/page.tsx
import { Metadata } from "next";
import FAQClient from "./FAQClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Explore our FAQ page for answers to frequently asked questions about Her Immigrant Tales, community, and storytelling platform.",
  keywords: "faq, frequntly asked questions",
  authors: [{ name: "Her Immigrant Tales" }],
  openGraph: {
    title: "Frequently Asked Questions",
    description:
      "Explore our FAQ page for answers to frequently asked questions about Her Immigrant Tales, community, and storytelling platform.",
    url: "https://herimmigranttales.org/faq",
    images: [
      {
        url: "https://herimmigranttales.org/logo1.svg",
        width: 1200,
        height: 630,
        alt: "Her Immigrant Tales",
      },
    ],
    type: "website",
    siteName: "Her Immigrant Tales",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions",
    description:
      "Explore our FAQ page for answers to frequently asked questions about Her Immigrant Tales, community, and storytelling platform.",
    images: ["https://herimmigranttales.org/logo1.svg"],
  },
  alternates: {
    canonical: "https://herimmigranttales.org/faq",
  },
};

// Hardcoded FAQs (same as in your component)
const faqs = [
  {
    question: "What is Her Immigrant Tales (HIT)",
    answer:
      "HIT is a storytelling platform and community that celebrates immigrant women by sharing their journeys, amplifying their voices, and fostering belonging.",
  },
  {
    question: "How can I share my story with HIT?",
    answer:
      "You can share your story by submitting it through our website's story submission form, or by reaching out to us directly through our contact page.",
  },
  {
    question: "Do I have to pay to be part of the HIT community?",
    answer:
      "No, joining the HIT community is completely free. We believe in making our platform accessible to all immigrant women.",
  },
  {
    question: "Can I collaborate or volunteer with HIT?",
    answer:
      "Yes! We welcome volunteers and collaborators. You can help with events, content creation, community outreach, and more.",
  },
  {
    question: "Is HIT a nonprofit?",
    answer:
      "Yes, HIT operates as a nonprofit organization dedicated to supporting and empowering immigrant women through storytelling.",
  },
  {
    question: "What type of stories do you publish?",
    answer:
      "We publish authentic stories from immigrant women about their journeys, challenges, triumphs, and experiences in their new homelands.",
  },
  {
    question: "Do you host events?",
    answer:
      "Yes, we regularly host workshops, panels, and community meetups both virtually and in-person to bring immigrant women together.",
  },
  {
    question: "How can I support HIT financially?",
    answer:
      "You can support us through donations, sponsoring events, or partnering with us on initiatives that empower immigrant women.",
  },
];

// Server Component - no fetching needed, just metadata and schemas
export default function FAQPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://herimmigranttales.org",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "FAQ",
        item: "https://herimmigranttales.org/faq",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* Separate script tags for each schema - like your blog and story pages */}
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* Client component with hardcoded FAQs */}
      <FAQClient faqs={faqs} />
    </>
  );
}
