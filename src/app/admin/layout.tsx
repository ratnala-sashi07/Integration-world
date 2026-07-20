import Link from "next/link";
import { LayoutDashboard, BookOpen, ClipboardCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6 border-b pb-3 overflow-x-auto">
        <span className="font-bold mr-2">Admin</span>
        <Link href="/admin" className="btn-ghost">
          <LayoutDashboard size={16} /> Overview
        </Link>
        <Link href="/admin" className="btn-ghost">
          <BookOpen size={16} /> Courses
        </Link>
        <Link href="/admin/submissions" className="btn-ghost">
          <ClipboardCheck size={16} /> Submissions
        </Link>
      </div>
      {children}
    </div>
  );
}
