// Generates supabase/seed.sql for the Oracle Fusion AI Agent Studio course
// (content transcribed from the course PDF). Run: `node scripts/generate-seed.mjs`
// Add more course objects to COURSES to seed your other 3–4 courses.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = `${__dirname}/../supabase/seed.sql`;

// Mux's public demo asset — makes the preview lesson playable before you upload real videos.
const DEMO = "qxb01i6T202018GFS02vp9RIe01icTcDCjVzQpfab00CUxg";

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const jsonb = (obj) => `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;

const oracleCourse = {
  slug: "oracle-fusion-ai-agent-studio",
  title: "Oracle Fusion AI Agent Studio — Complete Course 2026",
  subtitle: "25 Modules · 15 Real Enterprise Projects · 50–70 Hours",
  instructor: "Umasankar Ratnala",
  instructorTitle: "Oracle Integration Architect · AI Agent Specialist · Oracle Fusion Cloud",
  instructorUrl: "https://www.linkedin.com/in/umasankar-ratnala-222a63197/",
  instructorBio:
    "Umasankar Ratnala is an Oracle Integration Architect and AI Agent Specialist with deep, hands-on experience across Oracle Fusion Cloud (HCM & ERP), Oracle Integration Cloud (OIC), and enterprise AI. He designs and ships production-grade AI Agents and integrations, and teaches practitioners how to build the same — from fundamentals through to real enterprise projects.",
  duration: "50–70 hours",
  level: "advanced",
  price_cents: 19900,
  compareCents: 29900,
  currency: "usd",
  thumbnail:
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
  description:
    "A comprehensive 50–70 hour professional training program for Oracle consultants, integration architects, and AI specialists. Go from AI fundamentals to advanced enterprise-grade AI Agent implementations inside Oracle Fusion Cloud. Build real-world AI Agents that integrate with Oracle Fusion HCM, ERP, OIC, UCM, and external systems including GitHub, Azure DevOps, SharePoint, Microsoft Teams, and Slack — using the full suite of Oracle AI Studio tools: Business Object Tool, External REST Tool, MCP Tool, Workflow Designer, and Hierarchical Agent patterns.",
  highlights: [
    { label: "Modules", value: "25" },
    { label: "Projects", value: "15" },
    { label: "Hours", value: "50–70" },
    { label: "Bonus", value: "13+" },
  ],
  outcomes: [
    "Design and build AI Agents in Oracle Fusion AI Agent Studio from scratch",
    "Configure prompts, personas, topics, and tools for enterprise use cases",
    "Integrate agents with Oracle Fusion (HCM, ERP), OIC, UCM, HDL, REST/SOAP, GitHub, Azure DevOps",
    "Develop Workflow and Hierarchical Agent solutions with the Workflow Designer",
    "Implement enterprise security (OAuth 2.0, JWT, Guardrails), monitoring (METRO), and deployment",
    "Build and deploy 15 real-world AI automation projects for HCM and ERP",
    "Apply MCP to connect Oracle AI Agents to external LLMs and dev tools",
    "Implement RAG with vector databases for AI Knowledge Assistants",
  ],
  // Starter content only — a single Introduction module with 2 free previews.
  // Add the remaining modules, quizzes and assignments from the admin panel.
  modules: [
    ["Introduction", [
      "Welcome & Course Overview",
      "What is Oracle Fusion AI Agent Studio?",
    ]],
  ],
  quizzes: [],
  assignments: [],
};

const COURSES = [oracleCourse];

function courseBlock(c) {
  const lines = [];
  lines.push("do $$");
  lines.push("declare v_course uuid; v_module uuid; v_quiz uuid;");
  lines.push("begin");
  // Make the seed re-runnable: remove any prior copy of this course (cascades).
  lines.push(`  delete from public.courses where slug = ${q(c.slug)};`);
  lines.push(`  insert into public.courses (slug, title, subtitle, description, thumbnail_url, price_cents, compare_at_price_cents, currency, level, instructor_name, instructor_title, instructor_bio, instructor_url, duration_hours, highlights, outcomes, published)`);
  lines.push(`  values (${q(c.slug)}, ${q(c.title)}, ${q(c.subtitle)}, ${q(c.description)}, ${q(c.thumbnail)}, ${c.price_cents}, ${c.compareCents ?? 0}, ${q(c.currency)}, ${q(c.level)}, ${q(c.instructor)}, ${q(c.instructorTitle)}, ${q(c.instructorBio)}, ${q(c.instructorUrl)}, ${q(c.duration)}, ${jsonb(c.highlights)}, ${jsonb(c.outcomes)}, true)`);
  lines.push("  returning id into v_course;");

  c.modules.forEach(([title, lessons], mi) => {
    lines.push(`  insert into public.modules (course_id, title, position) values (v_course, ${q(title)}, ${mi}) returning id into v_module;`);
    const values = lessons
      .map((l, li) => {
        // Lessons in the first module (Introduction) are free previews and use
        // the Mux demo video so they play before real videos are uploaded.
        const isIntro = mi === 0;
        const playback = isIntro ? q(DEMO) : "null";
        const preview = isIntro ? "true" : "false";
        return `    (v_module, ${q(l)}, ${playback}, ${li}, ${preview})`;
      })
      .join(",\n");
    lines.push(`  insert into public.lessons (module_id, title, mux_playback_id, position, is_preview) values\n${values};`);
  });

  (c.quizzes ?? []).forEach((quiz, qi) => {
    lines.push(`  insert into public.quizzes (course_id, title, description, position) values (v_course, ${q(quiz.title)}, ${q(quiz.description)}, ${qi}) returning id into v_quiz;`);
    const qvals = quiz.questions
      .map((qq, qqi) =>
        `    (v_quiz, ${q(qq.prompt)}, ${q(qq.type)}, ${jsonb(qq.options)}, ${jsonb(qq.correct)}, ${qq.points}, ${qqi})`
      )
      .join(",\n");
    lines.push(`  insert into public.quiz_questions (quiz_id, prompt, type, options, correct, points, position) values\n${qvals};`);
  });

  (c.assignments ?? []).forEach((a, ai) => {
    lines.push(`  insert into public.assignments (course_id, title, instructions, position) values (v_course, ${q(a.title)}, ${q(a.instructions)}, ${ai});`);
  });

  lines.push("end $$;");
  return lines.join("\n");
}

const header = `-- AUTO-GENERATED by scripts/generate-seed.mjs — do not edit by hand.
-- Run after 0001_init.sql. Re-run the generator to regenerate.
-- The first lesson is a free preview using Mux's public demo video so it plays
-- before you upload your own videos.

`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, header + COURSES.map(courseBlock).join("\n\n") + "\n");
console.log(`Wrote ${OUT} (${COURSES.length} course(s)).`);
