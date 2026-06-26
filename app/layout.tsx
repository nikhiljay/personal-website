import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

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
  },
  twitter: {
    card: "summary",
    creator: "@nikhiljdsouza",
    title: "Nikhil D'Souza",
    description,
  },
};

const isVercel = process.env.VERCEL === "1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {isVercel ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
