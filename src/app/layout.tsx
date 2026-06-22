import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Project Pace — Your community, in motion",
  description:
    "A modern community fitness platform. Feed, events, leaderboards, challenges and chat for running clubs and fitness communities.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#080a12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <div className="app-shell pb-24">{children}</div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
