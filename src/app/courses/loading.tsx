import { CourseGridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-4 w-80 mb-8" />
      <CourseGridSkeleton />
    </div>
  );
}
