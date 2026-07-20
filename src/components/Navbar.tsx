import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { UserMenu } from "@/components/UserMenu";

export async function Navbar() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-40 border-b bg-[var(--surface)]/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-brand-600 text-white">
            <GraduationCap size={20} />
          </span>
          Integration World
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/courses" className="btn-ghost">
            Courses
          </Link>
          {profile ? (
            <>
              <Link href="/dashboard" className="btn-ghost hidden sm:inline-flex">
                My learning
              </Link>
              {profile.role === "admin" && (
                <Link href="/admin" className="btn-ghost hidden sm:inline-flex">
                  Admin
                </Link>
              )}
              <UserMenu profile={profile} />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
