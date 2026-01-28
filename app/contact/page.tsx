// app/contact/page.tsx
import { Metadata } from "next";
import ContactClient from "./ContactClient";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Her Immigrant Tales to share your story, ask questions, or collaborate. We’d love to connect and support you.",
  keywords: "contact",
  authors: [
    { name: "Her Immigrant Tales", url: "https://herimmigranttales.org" },
  ],
  openGraph: {
    title: "Contact Us",
    description:
      "Contact Her Immigrant Tales to share your story, ask questions, or collaborate. We’d love to connect and support you.",
    url: "https://herimmigranttales.org/contact",
    images: [
      {
        url: "https://herimmigranttales.org/logo1.svg",
        width: 1200,
        height: 630,
        alt: "Her Immigrant Tales",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us",
    description:
      "Contact Her Immigrant Tales to share your story, ask questions, or collaborate. We’d love to connect and support you.",
    images: ["https://herimmigranttales.org/logo1.svg"],
  },
  alternates: {
    canonical: "https://herimmigranttales.org/contact",
  },
};

export default function ContactPage() {
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
        name: "Contact",
        item: "https://herimmigranttales.org/contact",
      },
    ],
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Her Immigrant Tales",
    url: "https://herimmigranttales.org",
    logo: "https://herimmigranttales.org/logo1.svg",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+1 (437) 881-7400",
        contactType: "Customer Service",
        email: "hello@herimmigranttales.org",
        areaServed: "Worldwide",
        availableLanguage: ["English"],
      },
    ],
  };

  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <ContactClient />
    </>
  );
}
