import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://krampon.vercel.app"),
  title: "Krampon — Ta story de match",
  description:
    "Note les stats de ton pote pendant le match. Il reçoit son visuel post-match à partager.",
  openGraph: {
    title: "Krampon — Ta story de match",
    description: "Note les stats de ton pote pendant le match. Génère un visuel à partager.",
    url: "https://krampon.vercel.app",
    siteName: "Krampon",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krampon — Ta story de match",
    description: "Note les stats de ton pote pendant le match. Génère un visuel à partager.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B8F4B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
