import { Metadata } from "next";

const baseUrl = "https://mentark.in";
const siteName = "Mentark";
const defaultDescription =
  "India's first AI-powered personal mentorship engine. Guiding students and institutes with hyper-personalized learning, career, and psychology-driven recommendations.";

export function generatePageMetadata({
  title,
  description = defaultDescription,
  path = "",
  image = "/logo.png",
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${baseUrl}${path}`;
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  return {
    title: `${title} | ${siteName}`,
    description,
    keywords: [
      "AI mentorship",
      "education technology",
      "student wellbeing",
      "personalized learning",
      "adaptive roadmaps",
      "Indian education",
      "career guidance",
      "college matcher",
      "ARK engine",
    ],
    authors: [{ name: "Mentark" }],
    creator: "Mentark",
    publisher: "Mentark",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName,
      title: `${title} | ${siteName}`,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [imageUrl],
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
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mentark",
  url: "https://mentark.in",
  logo: "https://mentark.in/logo.png",
  description: defaultDescription,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "connect@mentark.com",
    contactType: "Customer Service",
  },
  sameAs: ["https://www.linkedin.com/company/mentark"],
};

export const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Mentark",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: defaultDescription,
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "100",
  },
};





