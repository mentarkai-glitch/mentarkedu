import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mentark - India's First AI-Powered Personal Mentorship Engine",
  description:
    "Mentark guides students and institutes with hyper-personalized learning, career, and psychology-driven recommendations. India's first AI-powered personal mentorship engine.",
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
    "JEE NEET preparation",
    "student mentorship",
  ],
  authors: [{ name: "Mentark" }],
  creator: "Mentark",
  publisher: "Mentark",
  metadataBase: new URL("https://mentark.in"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mentark.in",
    siteName: "Mentark",
    title: "Mentark - India's First AI-Powered Personal Mentorship Engine",
    description:
      "Mentark guides students and institutes with hyper-personalized learning, career, and psychology-driven recommendations.",
    images: [
      {
        url: "https://mentark.in/logo.png",
        width: 1200,
        height: 630,
        alt: "Mentark Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentark - India's First AI-Powered Personal Mentorship Engine",
    description:
      "Mentark guides students and institutes with hyper-personalized learning, career, and psychology-driven recommendations.",
    images: ["https://mentark.in/logo.png"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#00E6FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} overflow-x-hidden`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Force dark theme as default
                  document.documentElement.setAttribute('data-theme', 'dark');
                  // Clear any saved 'light' preference to enforce dark default
                  const savedTheme = localStorage.getItem('mentark-theme');
                  if (savedTheme === 'light') {
                    localStorage.removeItem('mentark-theme');
                  }
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          <PostHogProvider>
            {children}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  name: "Mentark",
                  url: "https://mentark.in",
                  logo: "https://mentark.in/logo.png",
                  description:
                    "India's first AI-powered personal mentorship engine. Guiding students and institutes with hyper-personalized learning, career, and psychology-driven recommendations.",
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
                }),
              }}
            />
          </PostHogProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
