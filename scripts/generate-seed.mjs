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
  modules: [
    ["Introduction to Artificial Intelligence", [
      "What is Artificial Intelligence?", "Machine Learning vs Deep Learning",
      "Generative AI", "Large Language Models (LLMs)", "Prompt Engineering Basics",
      "AI Agents", "Agentic AI", "Enterprise AI & Oracle AI Strategy",
    ]],
    ["Introduction to Oracle Fusion AI Agent Studio", [
      "What is Oracle Fusion AI Agent Studio?", "AI Agent Studio Architecture",
      "Licensing", "Features & Use Cases", "Supported Oracle Fusion Pillars",
      "AI Studio Navigation", "Environment Setup",
      "DEMO: Enable AI Agent Studio & navigate Agents, Tools, Topics, Monitoring",
    ]],
    ["AI Agent Studio Components", [
      "Agent Team", "Agents", "Topics", "Tools", "Instructions",
      "Testing", "Deployments", "Monitoring",
      "LAB: Build your first AI Agent from scratch",
    ]],
    ["Understanding AI Agents", [
      "User Proxy Agent", "Supervisor Agent", "Specialist Agent", "Utility Agent",
      "Persona-based Agent", "Task-oriented Agent", "Tool User Agent",
      "LAB: Create each of the seven agent types",
    ]],
    ["Agentic Design Patterns", [
      "Single Agent", "Multi-Agent", "Hierarchical Agents", "Workflow Agents",
      "Supervisor Pattern", "Human in the Loop", "Agent-to-Agent (A2A)",
    ]],
    ["Prompt Engineering", [
      "Prompt Fundamentals", "Persona, Role, Goal", "Instructions & Constraints",
      "Guardrails", "Hallucination Prevention", "Summarisation & System Prompts",
      "Prompt Chaining", "Dynamic Prompts", "LAB: Debug & improve prompts",
    ]],
    ["AI Agent Tools — Overview", [
      "Tools overview", "Calculator Tool", "Email Tool", "Deep Link Tool",
      "User Session Tool", "Connector Tool", "Document Tool", "User Query Tool",
    ]],
    ["Business Object Tool", [
      "Create Business Object Tool", "Input & Output Variables", "CRUD Operations",
      "Query / Update / Delete Records", "Business Object Security",
      "PROJECT: Employee Management Agent",
    ]],
    ["External REST Tool", [
      "REST Basics", "Authentication", "GET / POST / PUT / DELETE",
      "Headers & Query Parameters", "Dynamic Variables", "OAuth 2.0 & API Keys",
      "PROJECT: Upload to UCM, call fscmRestApi, Azure DevOps, GitHub, OpenAI, Weather",
    ]],
    ["Runtime File Processor Tool", [
      "Read CSV", "Read XML", "Read Excel (.xlsx)", "Read PDF", "Read JSON", "Read ZIP",
      "PROJECT: Employee XML Upload, HDL Upload, Supplier Upload",
    ]],
    ["MCP Tool", [
      "What is MCP?", "MCP Architecture", "MCP Server & Client",
      "GitHub MCP", "Oracle MCP", "Visual Studio MCP", "Claude / ChatGPT MCP",
      "PROJECT: GitHub, Oracle OIC and VS Code integrations",
    ]],
    ["Workflow Agents", [
      "Workflow Overview", "Workflow Designer", "Start / Tool / Agent Nodes",
      "Human Approval & Code Nodes", "Decision & End Nodes",
      "PROJECT: Invoice Approval Workflow",
    ]],
    ["Hierarchical Agents", [
      "Supervisor Agent", "Child Agents", "Delegation", "Tool Sharing",
      "Context Passing", "Multi-Agent Collaboration",
      "PROJECT: HR AI Assistant (Leave, Payroll, Recruitment)",
    ]],
    ["AI Agent Integrations", [
      "Oracle Fusion Cloud & OIC", "REST & SOAP APIs", "UCM & HDL",
      "ATP (Autonomous DB) & OCI Services", "GitHub & Azure DevOps",
      "SharePoint, Teams & Slack", "OpenAI / Claude & MCP Servers",
    ]],
    ["Oracle UCM Integration", [
      "PROJECT: Upload File to UCM", "PROJECT: Download File from UCM",
      "PROJECT: Search Documents", "PROJECT: Delete & Version Documents",
      "PROJECT: AI Upload Agent — automated document lifecycle",
    ]],
    ["Oracle HCM Projects", [
      "PROJECT: Employee Search Agent", "PROJECT: HDL Upload Agent",
      "PROJECT: Department Creation Agent", "PROJECT: Payroll Query Agent",
      "PROJECT: Leave Management Agent", "PROJECT: Recruitment Agent",
    ]],
    ["Oracle ERP Projects", [
      "PROJECT: Journal Import Agent (GL FBDI)", "PROJECT: Supplier Creation Agent",
      "PROJECT: Customer Creation Agent", "PROJECT: Invoice Processing Agent",
      "PROJECT: Expense Upload Agent",
    ]],
    ["Oracle Integration Cloud + AI Agents", [
      "Invoke OIC from AI Agent", "OIC REST & SOAP Integration",
      "ATP Database Connection", "SFTP File Transfer",
      "Error Handling", "Logging & Monitoring",
      "PROJECT: End-to-End OIC + AI Integration",
    ]],
    ["Monitoring, Evaluation and Traceability (METRO)", [
      "Monitoring dashboard", "Evaluation framework & Sets", "Trace Logs",
      "Token Usage analysis", "Cost Analysis", "Performance Tuning",
    ]],
    ["Security", [
      "Roles & Privileges", "OAuth 2.0 Configuration", "JWT Token Management",
      "API Security", "Data Privacy Controls", "AI Guardrails",
      "Prompt Injection Prevention",
    ]],
    ["Deployment", [
      "Publish Agent", "Versioning", "Migration between environments",
      "Export & Import", "Production Deployment checklist",
    ]],
    ["Troubleshooting", [
      "Prompt Issues", "Tool Failures", "REST Errors", "Token Expiry handling",
      "Debugging techniques", "Common Errors & fixes", "Authentication failures",
    ]],
    ["Performance Optimization", [
      "Prompt Optimization", "Token Optimization", "Cost Optimization",
      "Parallel Execution", "Workflow Optimization",
    ]],
    ["Real-Time Enterprise Projects", [
      "UCM Upload Agent", "HDL Upload Agent", "Employee Search Agent",
      "Leave Management Agent", "Journal Import Agent", "Supplier Creation Agent",
      "GitHub AI Agent", "Azure DevOps AI Agent", "Email Automation Agent",
      "Invoice Processing Agent", "Resume Screening Agent", "Oracle Fusion Support Agent",
      "AI Knowledge Assistant (RAG)", "RAG Document Assistant", "Multi-Agent HR Assistant",
    ]],
    ["Best Practices", [
      "Prompt Design best practices", "Tool Design principles", "Security standards",
      "Performance guidelines", "Error Handling patterns", "Reusable Agent design",
      "Governance framework", "Enterprise Architecture",
    ]],
    ["Bonus Modules", [
      "MCP Deep Dive", "Agent-to-Agent (A2A)", "Invoke Async APIs",
      "Human Approval Patterns", "OCI Generative AI", "BYO LLM",
      "OpenAI Integration", "Vector Database", "RAG Implementation",
      "Document Embedding", "AI Agent Migration", "AI Agent Templates",
      "Oracle AI Roadmap 2026",
    ]],
  ],
  quizzes: [
    {
      title: "Foundations Check (Modules 1–5)",
      description: "Test your understanding of AI fundamentals and agent design.",
      questions: [
        { prompt: "Which agent orchestrates multiple sub-agents and decides routing?", type: "single",
          options: ["Utility Agent", "Supervisor Agent", "Persona-based Agent", "Tool User Agent"], correct: [1], points: 1 },
        { prompt: "Which patterns involve more than one agent? (select all)", type: "multiple",
          options: ["Single Agent", "Hierarchical Agents", "Agent-to-Agent (A2A)", "Multi-Agent"], correct: [1, 2, 3], points: 2 },
        { prompt: "When is a Human-in-the-Loop pattern used?", type: "single",
          options: ["For simple one-tool tasks", "When approval is required before an action", "To translate text", "To reduce token cost"], correct: [1], points: 1 },
      ],
    },
    {
      title: "Tools & Integrations (Modules 7–14)",
      description: "Check your knowledge of AI Agent tools and enterprise integrations.",
      questions: [
        { prompt: "Which tool performs CRUD on Oracle Fusion Business Objects?", type: "single",
          options: ["External REST Tool", "Business Object Tool", "MCP Tool", "Calculator Tool"], correct: [1], points: 1 },
        { prompt: "Which file formats can the Runtime File Processor read? (select all)", type: "multiple",
          options: ["CSV", "PDF", "ZIP", "Excel"], correct: [0, 1, 2, 3], points: 2 },
        { prompt: "MCP lets Oracle AI Studio connect to which of these?", type: "multiple",
          options: ["GitHub", "VS Code", "Claude / ChatGPT", "None of these"], correct: [0, 1, 2], points: 2 },
      ],
    },
  ],
  assignments: [
    { title: "Build an Employee Management Agent",
      instructions: "Using the Business Object Tool, build an agent that can search employees by name/department/role, update employee records via chat, and query leave balances. Secure BO access with role-based permissions. Submit a short write-up and a link to a recording or screenshots." },
    { title: "Invoice Approval Workflow",
      instructions: "Design a Workflow Agent that receives invoice data, validates it against a PO (2-way/3-way match), routes to an approver via a Human Approval node, then posts a journal and emails confirmation on approval (or notifies the submitter on rejection). Submit your workflow export and notes." },
    { title: "Multi-Agent HR Assistant (Capstone)",
      instructions: "Build a Supervisor agent that routes to Leave, Payroll and Recruitment specialist agents, each with dedicated BO/REST tools and shared context for multi-turn conversations. Submit a link to your working demo." },
  ],
};

const COURSES = [oracleCourse];

function courseBlock(c) {
  const lines = [];
  lines.push("do $$");
  lines.push("declare v_course uuid; v_module uuid; v_quiz uuid;");
  lines.push("begin");
  // Make the seed re-runnable: remove any prior copy of this course (cascades).
  lines.push(`  delete from public.courses where slug = ${q(c.slug)};`);
  lines.push(`  insert into public.courses (slug, title, subtitle, description, thumbnail_url, price_cents, currency, level, instructor_name, instructor_title, instructor_bio, instructor_url, duration_hours, highlights, outcomes, published)`);
  lines.push(`  values (${q(c.slug)}, ${q(c.title)}, ${q(c.subtitle)}, ${q(c.description)}, ${q(c.thumbnail)}, ${c.price_cents}, ${q(c.currency)}, ${q(c.level)}, ${q(c.instructor)}, ${q(c.instructorTitle)}, ${q(c.instructorBio)}, ${q(c.instructorUrl)}, ${q(c.duration)}, ${jsonb(c.highlights)}, ${jsonb(c.outcomes)}, true)`);
  lines.push("  returning id into v_course;");

  c.modules.forEach(([title, lessons], mi) => {
    lines.push(`  insert into public.modules (course_id, title, position) values (v_course, ${q(title)}, ${mi}) returning id into v_module;`);
    const values = lessons
      .map((l, li) => {
        const isFirstEver = mi === 0 && li === 0;
        const playback = isFirstEver ? q(DEMO) : "null";
        const preview = isFirstEver ? "true" : "false";
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
