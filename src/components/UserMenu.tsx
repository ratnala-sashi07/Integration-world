"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export function UserMenu({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = (profile.full_name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid place-items-center h-9 w-9 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm hover:ring-2 hover:ring-brand-400 transition"
        aria-label="Account menu"
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 card p-1.5 shadow-lg">
          <div className="px-3 py-2 border-b mb-1">
            <div className="font-medium truncate">{profile.full_name || "Learner"}</div>
            <div className="text-xs text-muted capitalize">{profile.role}</div>
          </div>
          <Link href="/dashboard" className="menu-item" onClick={() => setOpen(false)}>
            <LayoutDashboard size={16} /> My learning
          </Link>
          {profile.role === "admin" && (
            <Link href="/admin" className="menu-item" onClick={() => setOpen(false)}>
              <Shield size={16} /> Admin panel
            </Link>
          )}
          <button onClick={signOut} className="menu-item w-full text-left text-red-600">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}

      <style jsx>{`
        :global(.menu-item) {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        :global(.menu-item:hover) {
          background: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
