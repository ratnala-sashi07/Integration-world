// Hand-written types mirroring the SQL schema. If you prefer generated types,
// run `supabase gen types typescript` and swap these out.

export type Role = "student" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

export interface CourseHighlight {
  label: string;
  value: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail_url: string | null;
  price_cents: number;
  currency: string;
  level: string | null;
  instructor_name: string | null;
  instructor_title: string | null;
  instructor_bio: string | null;
  instructor_url: string | null;
  duration_hours: string | null;
  highlights: CourseHighlight[];
  outcomes: string[];
  published: boolean;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  mux_playback_id: string | null;
  mux_asset_id: string | null;
  duration_seconds: number;
  position: number;
  is_preview: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_position_seconds: number;
  updated_at: string;
}

export type QuestionType = "single" | "multiple";

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  prompt: string;
  type: QuestionType;
  options: string[];
  correct: number[]; // never sent to students
  points: number;
  position: number;
}

/** Question shape safe to send to the client (answer key stripped). */
export type PublicQuizQuestion = Omit<QuizQuestion, "correct">;

export interface Quiz {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, number[]>;
  score: number;
  max_score: number;
  submitted_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  instructions: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  content: string | null;
  file_url: string | null;
  status: "submitted" | "graded";
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

// Convenience composites
export type ModuleWithLessons = Module & { lessons: Lesson[] };
export type CourseWithContent = Course & { modules: ModuleWithLessons[] };
