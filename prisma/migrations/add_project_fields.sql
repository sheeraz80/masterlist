-- Add priority and progress fields to Project table
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'medium';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "progress" INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE "Project" ADD CONSTRAINT "project_progress_check" CHECK ("progress" >= 0 AND "progress" <= 100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Project_priority_idx" ON "Project"("priority");
CREATE INDEX IF NOT EXISTS "Project_progress_idx" ON "Project"("progress");