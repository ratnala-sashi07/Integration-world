import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Integration World — Learn by building",
  description:
    "Online courses with videos, quizzes and assignments. Learn, build, and ship real products.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t mt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} Integration World</span>
            <span>Built with Next.js · Supabase · Stripe · Mux</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
