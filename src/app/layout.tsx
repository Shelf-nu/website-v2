import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { SkipToContent } from "@/components/layout/skip-to-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shelf.nu"),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://shelf.nu",
  },
  title: {
    default: "Shelf | Open Source Asset Management Software",
    template: "%s | Shelf Asset Management",
  },
  description: "Modern open source asset tracking for teams. Track equipment, IT assets, and inventory with a clean, easy-to-use platform. Free for individuals.",
  keywords: [
    "asset tracking software",
    "open source asset management",
    "equipment tracking",
    "inventory management system",
    "IT asset management",
    "fixed asset tracking",
    "QR code tracking",
    "shelf.nu"
  ],
  authors: [{ name: "Shelf Team", url: "https://shelf.nu" }],
  creator: "Shelf",
  openGraph: {
    title: "Shelf | Open Source Asset Management",
    description: "Track anything, anywhere, with anyone. The open source alternative for modern asset tracking.",
    url: "https://shelf.nu",
    siteName: "Shelf",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://shelf.nu/og.webp",
        width: 1200,
        height: 630,
        alt: "Shelf Asset Management Interface",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelf | Open Source Asset Management",
    description: "Modern open source asset tracking for teams. Star us on GitHub.",
    creator: "@shelf_nu",
    site: "@shelf_nu",
    images: ["https://shelf.nu/og.webp"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <SkipToContent />
        <ScrollToTop />
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
