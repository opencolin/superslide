import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Superslide — Upgrade your deck into an interactive web slideshow",
  description:
    "Drop a PPTX, PDF, or Keynote. Superslide rebuilds it as an AI-powered, fully interactive web slideshow with shadcn, Three.js, and your brand's design system.",
  metadataBase: new URL("https://superslide.app"),
  openGraph: {
    title: "Superslide",
    description:
      "Convert your existing deck into an AI-powered interactive web slideshow.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
