-- Adds instructor profile fields (safe to run on an already-migrated database)
-- and fills them in for the Oracle Fusion course.

alter table public.courses
  add column if not exists instructor_title text,
  add column if not exists instructor_bio   text,
  add column if not exists instructor_url    text;

update public.courses set
  instructor_name  = 'Umasankar Ratnala',
  instructor_title = 'Oracle Integration Architect · AI Agent Specialist · Oracle Fusion Cloud',
  instructor_url   = 'https://www.linkedin.com/in/umasankar-ratnala-222a63197/',
  instructor_bio   = 'Umasankar Ratnala is an Oracle Integration Architect and AI Agent Specialist with deep, hands-on experience across Oracle Fusion Cloud (HCM & ERP), Oracle Integration Cloud (OIC), and enterprise AI. He designs and ships production-grade AI Agents and integrations, and teaches practitioners how to build the same — from fundamentals through to real enterprise projects.'
where slug = 'oracle-fusion-ai-agent-studio';
