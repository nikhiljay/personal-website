import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const description =
  "Co-founder & CTO of Vitalize Care (YC W23), building technology to address critical nursing workforce challenges.";

export const metadata: Metadata = {
  title: "Nikhil D'Souza",
  description,
  metadataBase: new URL("https://nikhil.ai"),
  openGraph: {
    title: "Nikhil D'Souza",
    description,
    url: "https://nikhil.ai",
    siteName: "Nikhil D'Souza",
    type: "website",
    images: ["/images/screenshot.png"],
  },
  twitter: {
    card: "summary",
    creator: "@nikhiljdsouza",
    title: "Nikhil D'Souza",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
