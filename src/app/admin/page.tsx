import Link from "next/link";
import { Plus, ExternalLink, Circle, CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCourse } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import type { Course } from "@/lib/types";

export const metadata = { title: "Admin · Integration World" };

export default async function AdminHome() {
  const admin = createAdminClient();
  const { data: courses } = await admin
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });
  const list = (courses as Course[]) ?? [];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold mb-4">Your courses</h1>
        {list.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            No courses yet — create your first one on the right.
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((c) => (
              <div key={c.id} className="card p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {c.published ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <Circle size={16} className="text-muted" />
                    )}
                    <span className="font-semibold truncate">{c.title}</span>
                  </div>
                  <div className="text-sm text-muted mt-0.5">
                    {c.published ? "Published" : "Draft"} · {formatPrice(c.price_cents, c.currency)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  {c.published && (
                    <Link href={`/courses/${c.slug}`} className="btn-ghost" title="View">
                      <ExternalLink size={16} />
                    </Link>
                  )}
                  <Link href={`/admin/courses/${c.id}`} className="btn-outline">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="card p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Plus size={18} /> New course
          </h2>
          <form action={createCourse} className="space-y-3">
            <div>
              <label className="label">Title</label>
              <input name="title" className="input" required placeholder="Oracle Fusion AI Agent Studio" />
            </div>
            <div>
              <label className="label">Subtitle</label>
              <input name="subtitle" className="input" placeholder="25 Modules · 15 Projects" />
            </div>
            <div>
              <label className="label">Instructor</label>
              <input name="instructor" className="input" placeholder="Umasankar Ratnala" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Price</label>
                <input name="price" type="number" step="0.01" min="0" className="input" defaultValue="0" />
              </div>
              <div>
                <label className="label">Currency</label>
                <input name="currency" className="input" defaultValue="usd" />
              </div>
            </div>
            <div>
              <label className="label">Level</label>
              <select name="level" className="input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <button className="btn-primary w-full">Create course</button>
          </form>
        </div>
      </div>
    </div>
  );
}
