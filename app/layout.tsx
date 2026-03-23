import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PromptPal - Research-First Prompt System",
  description:
    "Share the idea once, let PromptPal research the stack and layout, and leave with a larger build-ready prompt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", spaceGrotesk.variable, ibmPlexMono.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
