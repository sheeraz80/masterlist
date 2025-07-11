-- Add technologyStack and prerequisites fields to Project model
ALTER TABLE "Project" ADD COLUMN "technologyStack" TEXT;
ALTER TABLE "Project" ADD COLUMN "prerequisites" TEXT;