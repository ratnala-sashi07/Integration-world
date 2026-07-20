"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mux } from "@/lib/mux";
import { isMuxConfigured, isMuxSigningConfigured } from "@/lib/env";

async function assertAdmin() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") throw new Error("Not authorized");
  return profile;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// ---------- Courses ----------
export async function createCourse(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title required");

  const base = slugify(title) || "course";
  let slug = base;
  // ensure unique-ish slug
  const { data: existing } = await admin.from("courses").select("slug").ilike("slug", `${base}%`);
  if (existing?.some((c) => c.slug === slug)) slug = `${base}-${(existing.length + 1)}`;

  const { data, error } = await admin
    .from("courses")
    .insert({
      title,
      slug,
      subtitle: String(formData.get("subtitle") || "") || null,
      price_cents: Math.round(Number(formData.get("price") || 0) * 100),
      currency: String(formData.get("currency") || "usd"),
      instructor_name: String(formData.get("instructor") || "") || null,
      level: String(formData.get("level") || "beginner"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  redirect(`/admin/courses/${data.id}`);
}

export async function updateCourse(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("id"));

  const outcomesRaw = String(formData.get("outcomes") || "");
  const outcomes = outcomesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await admin
    .from("courses")
    .update({
      title: String(formData.get("title") || "").trim(),
      subtitle: String(formData.get("subtitle") || "") || null,
      description: String(formData.get("description") || "") || null,
      thumbnail_url: String(formData.get("thumbnail_url") || "") || null,
      instructor_name: String(formData.get("instructor") || "") || null,
      instructor_title: String(formData.get("instructor_title") || "") || null,
      instructor_bio: String(formData.get("instructor_bio") || "") || null,
      instructor_url: String(formData.get("instructor_url") || "") || null,
      duration_hours: String(formData.get("duration_hours") || "") || null,
      level: String(formData.get("level") || "beginner"),
      price_cents: Math.round(Number(formData.get("price") || 0) * 100),
      currency: String(formData.get("currency") || "usd"),
      outcomes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${id}`);
}

export async function togglePublish(courseId: string, published: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("courses").update({ published }).eq("id", courseId);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin");
  revalidatePath("/courses");
}

export async function deleteCourse(courseId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("courses").delete().eq("id", courseId);
  revalidatePath("/admin");
  redirect("/admin");
}

// ---------- Modules ----------
export async function addModule(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const { count } = await admin
    .from("modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);
  await admin.from("modules").insert({ course_id: courseId, title, position: count ?? 0 });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteModule(moduleId: string, courseId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("modules").delete().eq("id", moduleId);
  revalidatePath(`/admin/courses/${courseId}`);
}

// ---------- Lessons ----------
export async function addLesson(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const moduleId = String(formData.get("moduleId"));
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") || "").trim();
  if (!title) return;

  const { count } = await admin
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  await admin.from("lessons").insert({
    module_id: moduleId,
    title,
    description: String(formData.get("description") || "") || null,
    mux_playback_id: String(formData.get("playback_id") || "") || null,
    duration_seconds: Number(formData.get("duration") || 0),
    is_preview: formData.get("is_preview") === "on",
    position: count ?? 0,
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteLesson(lessonId: string, courseId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("lessons").delete().eq("id", lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
}

/**
 * Turn common share links into a URL that returns the raw video bytes, which is
 * what Mux needs to ingest. Google Drive "/view" links serve an HTML page, so we
 * rewrite them to the direct-download endpoint. Dropbox is handled too.
 */
function toDirectVideoUrl(input: string): string {
  const url = input.trim();

  // Google Drive: /file/d/<ID>/..., open?id=<ID>, uc?id=<ID>, or ...?id=<ID>
  const driveId =
    url.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1] ??
    url.match(/[?&]id=([^&]+)/)?.[1];
  if (url.includes("drive.google.com") && driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }

  // Dropbox: force direct download
  if (url.includes("dropbox.com")) {
    return url.replace("?dl=0", "?dl=1").replace("www.dropbox.com", "dl.dropboxusercontent.com");
  }

  return url;
}

/**
 * Create a Mux asset from a source URL (e.g. a shared Google Drive link) and
 * attach the resulting playback id to a lesson. Mux then downloads and
 * transcodes the file asynchronously (usually under a couple of minutes).
 */
export async function ingestLessonVideo(formData: FormData) {
  await assertAdmin();
  if (!isMuxConfigured) throw new Error("Mux is not configured.");
  const lessonId = String(formData.get("lessonId"));
  const courseId = String(formData.get("courseId"));
  const raw = String(formData.get("url") || "").trim();
  if (!raw) throw new Error("Provide a source video URL.");
  const url = toDirectVideoUrl(raw);

  const asset = await mux.video.assets.create({
    inputs: [{ url }],
    playback_policy: [isMuxSigningConfigured ? "signed" : "public"],
    encoding_tier: "smart",
  });
  const playbackId = asset.playback_ids?.[0]?.id ?? null;

  const admin = createAdminClient();
  await admin
    .from("lessons")
    .update({ mux_asset_id: asset.id, mux_playback_id: playbackId })
    .eq("id", lessonId);

  revalidatePath(`/admin/courses/${courseId}`);
}

// ---------- Quizzes ----------
export async function createQuiz(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const { count } = await admin
    .from("quizzes")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);
  await admin.from("quizzes").insert({
    course_id: courseId,
    title,
    description: String(formData.get("description") || "") || null,
    position: count ?? 0,
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function addQuestion(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const quizId = String(formData.get("quizId"));
  const courseId = String(formData.get("courseId"));
  const prompt = String(formData.get("prompt") || "").trim();
  const options = [0, 1, 2, 3]
    .map((i) => String(formData.get(`option_${i}`) || "").trim())
    .filter(Boolean);
  const type = String(formData.get("type") || "single") as "single" | "multiple";
  const correctRaw = formData.getAll("correct").map((v) => Number(v));
  if (!prompt || options.length < 2 || correctRaw.length === 0) return;

  const { count } = await admin
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quizId);

  await admin.from("quiz_questions").insert({
    quiz_id: quizId,
    prompt,
    type,
    options,
    correct: type === "single" ? [correctRaw[0]] : correctRaw,
    points: Number(formData.get("points") || 1),
    position: count ?? 0,
  });
  revalidatePath(`/admin/courses/${courseId}/quiz/${quizId}`);
}

export async function deleteQuestion(questionId: string, courseId: string, quizId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("quiz_questions").delete().eq("id", questionId);
  revalidatePath(`/admin/courses/${courseId}/quiz/${quizId}`);
}

// ---------- Assignments ----------
export async function createAssignment(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const { count } = await admin
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);
  await admin.from("assignments").insert({
    course_id: courseId,
    title,
    instructions: String(formData.get("instructions") || "") || null,
    position: count ?? 0,
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function gradeSubmission(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("submissionId"));
  await admin
    .from("assignment_submissions")
    .update({
      grade: Number(formData.get("grade") || 0),
      feedback: String(formData.get("feedback") || "") || null,
      status: "graded",
      graded_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/admin/submissions");
}
