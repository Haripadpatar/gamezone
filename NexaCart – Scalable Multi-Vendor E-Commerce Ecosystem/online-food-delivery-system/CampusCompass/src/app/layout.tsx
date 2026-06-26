import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CampusCompass | Discover & Compare Top Colleges",
  description: "Find the best engineering, business, and medical colleges. Compare fees, ratings, placement percentages, and read genuine student reviews.",
  keywords: ["colleges", "college discovery", "compare colleges", "IIT", "IIM", "AIIMS", "placement statistics", "fees"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 flex flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
