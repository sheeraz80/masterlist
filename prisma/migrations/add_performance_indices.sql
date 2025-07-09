-- Add performance indices for frequently queried fields

-- Projects table indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_category ON "Project"(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_quality_score ON "Project"("qualityScore");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_created_at ON "Project"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_updated_at ON "Project"("updatedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_owner_id ON "Project"("ownerId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status ON "Project"(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_priority ON "Project"(priority);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_progress ON "Project"(progress);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_technical_complexity ON "Project"("technicalComplexity");

-- Composite indices for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_category_quality ON "Project"(category, "qualityScore");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_owner_created ON "Project"("ownerId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status_priority ON "Project"(status, priority);

-- Users table indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON "User"(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON "User"(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON "User"("createdAt");

-- Sessions table indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id ON "Session"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_token ON "Session"(token);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires_at ON "Session"("expiresAt");

-- Comments table indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_project_id ON "Comment"("projectId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_user_id ON "Comment"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_created_at ON "Comment"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_project_created ON "Comment"("projectId", "createdAt");

-- Activities table indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_id ON "Activity"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_project_id ON "Activity"("projectId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_team_id ON "Activity"("teamId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_created_at ON "Activity"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_type ON "Activity"(type);

-- Composite indices for activity queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_team_created ON "Activity"("teamId", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_project_created ON "Activity"("projectId", "createdAt");

-- Team-related indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_team_id ON "TeamMember"("teamId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_user_id ON "TeamMember"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_role ON "TeamMember"(role);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_projects_team_id ON "TeamProject"("teamId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_projects_project_id ON "TeamProject"("projectId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_projects_status ON "TeamProject"(status);

-- Search history indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_history_user_id ON "SearchHistory"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_history_created_at ON "SearchHistory"("createdAt");

-- Export history indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_export_user_id ON "Export"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_export_created_at ON "Export"("createdAt");

-- AI Insights indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insights_project_id ON "AIInsight"("projectId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insights_created_at ON "AIInsight"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_insights_confidence ON "AIInsight"(confidence);

-- Notifications indices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON "Notification"("userId");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON "Notification"(read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON "Notification"("createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON "Notification"("userId", read);