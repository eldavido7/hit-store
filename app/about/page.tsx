// app/about/page.tsx
import { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Her Immigrant Tales is empowering immigrants, empowering immigrant women, and amplifying voices through stories of strength, resilience, and hope.",
  keywords:
    "empowering immigrants, empowering immigrant women, amplifying voices",
  openGraph: {
    title: "About Us",
    description:
      "Her Immigrant Tales is empowering immigrants, empowering immigrant women, and amplifying voices through stories of strength, resilience, and hope.",
    url: "https://herimmigranttales.org/about",
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
    title: "About Us",
    description:
      "Her Immigrant Tales is empowering immigrants, empowering immigrant women, and amplifying voices through stories of strength, resilience, and hope.",
    images: ["https://herimmigranttales.org/logo1.svg"],
  },
  alternates: {
    canonical: "https://herimmigranttales.org/about",
  },
};

export default function AboutPage() {
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
        name: "About",
        item: "https://herimmigranttales.org/about",
      },
    ],
  };

  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <AboutPageClient />
    </>
  );
}
