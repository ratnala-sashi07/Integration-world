import Link from "next/link";
import { BookOpen, BarChart3 } from "lucide-react";
import type { Course } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function CourseCard({
  course,
  href,
  cta,
}: {
  course: Course;
  href?: string;
  cta?: string;
}) {
  return (
    <Link
      href={href ?? `/courses/${course.slug}`}
      className="card overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-video bg-brand-100 overflow-hidden">
        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt=""
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-brand-400">
            <BookOpen size={40} />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted mb-2">
          <BarChart3 size={14} />
          <span className="capitalize">{course.level ?? "all levels"}</span>
        </div>
        <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="text-sm text-muted mt-1 line-clamp-2">{course.subtitle}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-brand-600">
            {formatPrice(course.price_cents, course.currency)}
          </span>
          <span className="text-sm font-medium text-muted group-hover:text-brand-600">
            {cta ?? "View course →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
