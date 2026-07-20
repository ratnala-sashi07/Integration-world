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
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-semibold">
              <span className="grid place-items-center h-7 w-7 rounded-md bg-brand-600 text-white text-sm">
                IW
              </span>
              Integration World
            </div>
            <nav className="flex items-center gap-5 text-sm text-muted">
              <a href="/courses" className="hover:text-brand-600 transition-colors">Courses</a>
              <a href="/login" className="hover:text-brand-600 transition-colors">Log in</a>
              <a href="/signup" className="hover:text-brand-600 transition-colors">Sign up</a>
            </nav>
            <span className="text-sm text-muted">
              © {new Date().getFullYear()} Integration World
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
