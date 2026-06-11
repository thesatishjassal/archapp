import "./globals.css";
import Header from "./componets/header";

export const metadata = {
  metadataBase: new URL("https://partners.panvik.com"),

  title: {
    default: "PANVIK Partners Portal",
    template: "%s | PANVIK Partners",
  },

  description:
    "Official PANVIK Partners Portal. Manage leads, commissions, referrals, client onboarding, earnings, and partner business growth from a single dashboard.",

  keywords: [
    "PANVIK Partners",
  ],

  applicationName: "PANVIK Partners",

  authors: [
    {
      name: "PANVIK",
    },
  ],

  creator: "PANVIK",
  publisher: "PANVIK",

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

  openGraph: {
    title: "PANVIK Partners Portal",
    description:
      "Manage commissions, referrals, clients, and partner growth with the official PANVIK Partners dashboard.",
    url: "https://partners.panvik.com",
    siteName: "PANVIK Partners",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PANVIK Partners",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PANVIK Partners Portal",
    description:
      "Manage commissions, referrals, clients, and partner growth with the official PANVIK Partners dashboard.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: "https://partners.panvik.com",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body suppressHydrationWarning>
        <Header />
        {children}
      </body>
    </html>
  );
}