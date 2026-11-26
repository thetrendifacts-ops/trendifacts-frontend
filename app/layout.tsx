import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trendifacts.com"),
  title: "Trendifacts: Power Station Sizing & Outage Guides",
  description:
    "Portable power station runtime charts, wattage sizing math, solar recharge guides, and home blackout prep—built on verified manufacturer specs.",
  openGraph: {
    siteName: "Trendifacts",
    type: "website",
    url: "https://trendifacts.com",
    title: "Trendifacts: Power Station Sizing & Outage Guides",
    description:
      "Portable power station runtime charts, wattage sizing math, solar recharge guides, and home blackout prep—built on verified manufacturer specs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trendifacts: Power Station Sizing & Outage Guides",
    description:
      "Portable power station runtime charts, wattage sizing math, solar recharge guides, and home blackout prep.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      "p:domain_verify": ["9390856b389e6d258a8f5522fbeb2957"],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Global AdSense Script — only loads when NEXT_PUBLIC_ADSENSE_ID is configured */}
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-clip"
        suppressHydrationWarning
      >
        {/* Global Navigation Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-grow">{children}</main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  );
}