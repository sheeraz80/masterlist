-- Database Performance Optimization Migration
-- This migration adds indexes and optimizations for better query performance

-- 1. Add composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_category_status" ON "Project"("category", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_category_quality" ON "Project"("category", "qualityScore");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_owner_status" ON "Project"("ownerId", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_created_category" ON "Project"("createdAt", "category");

-- 2. Add indexes for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_created_desc" ON "Project"("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_updated_desc" ON "Project"("updatedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_quality_desc" ON "Project"("qualityScore" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_technical_complexity" ON "Project"("technicalComplexity");

-- 3. Add partial indexes for active projects (most common queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_active_category" ON "Project"("category") WHERE "status" = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_active_quality" ON "Project"("qualityScore") WHERE "status" = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_active_owner" ON "Project"("ownerId") WHERE "status" = 'active';

-- 4. Add indexes for activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_activity_user_created" ON "Activity"("userId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_activity_project_created" ON "Activity"("projectId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_activity_type_created" ON "Activity"("type", "createdAt" DESC);

-- 5. Add indexes for repository queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_category_status" ON "Repository"("category", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_health_status" ON "Repository"("healthScore", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_updated_desc" ON "Repository"("updatedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_sync_status" ON "Repository"("lastSync", "status");

-- 6. Add indexes for deployment queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_project_status" ON "Deployment"("projectId", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_platform_status" ON "Deployment"("platform", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_health_active" ON "Deployment"("health", "isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_last_deployed" ON "Deployment"("lastDeployedAt" DESC);

-- 7. Add indexes for search and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_tags_gin" ON "Project" USING gin(to_tsvector('english', "tags"));
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_title_gin" ON "Project" USING gin(to_tsvector('english', "title"));
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_problem_gin" ON "Project" USING gin(to_tsvector('english', "problem"));

-- 8. Add indexes for user activity
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_created_desc" ON "User"("createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_updated_desc" ON "User"("updatedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_role_active" ON "User"("role") WHERE "role" != 'user';

-- 9. Add indexes for notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notification_user_unread" ON "Notification"("userId", "read", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_notification_type_created" ON "Notification"("type", "createdAt" DESC);

-- 10. Add indexes for system metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_system_metric_service_timestamp" ON "SystemMetric"("service", "timestamp" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_system_metric_metric_timestamp" ON "SystemMetric"("metric", "timestamp" DESC);

-- 11. Add indexes for AI insights
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_ai_insight_type_generated" ON "AIInsight"("type", "generatedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_ai_insight_category_confidence" ON "AIInsight"("category", "confidence" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_ai_insight_expires_at" ON "AIInsight"("expiresAt") WHERE "expiresAt" IS NOT NULL;

-- 12. Add indexes for code analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_code_analysis_repo_analyzed" ON "CodeAnalysis"("repositoryId", "analyzedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_code_analysis_quality_analyzed" ON "CodeAnalysis"("codeQuality", "analyzedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_code_analysis_type_analyzed" ON "CodeAnalysis"("analysisType", "analyzedAt" DESC);

-- 13. Add indexes for deployment logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_log_deployment_timestamp" ON "DeploymentLog"("deploymentId", "timestamp" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_log_level_timestamp" ON "DeploymentLog"("level", "timestamp" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_log_type_timestamp" ON "DeploymentLog"("type", "timestamp" DESC);

-- 14. Add indexes for incidents
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_incident_deployment_detected" ON "Incident"("deploymentId", "detectedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_incident_severity_status" ON "Incident"("severity", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_incident_status_detected" ON "Incident"("status", "detectedAt" DESC);

-- 15. Add indexes for session management
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_session_user_expires" ON "Session"("userId", "expiresAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_session_expires_at" ON "Session"("expiresAt") WHERE "expiresAt" > NOW();

-- 16. Add indexes for comments
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_comment_project_created" ON "Comment"("projectId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_comment_user_created" ON "Comment"("userId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_comment_rating_created" ON "Comment"("rating", "createdAt" DESC) WHERE "rating" IS NOT NULL;

-- 17. Add indexes for team operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_team_member_user_joined" ON "TeamMember"("userId", "joinedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_team_project_team_assigned" ON "TeamProject"("teamId", "assignedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_team_project_project_status" ON "TeamProject"("projectId", "status");

-- 18. Add indexes for exports
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_export_user_created" ON "Export"("userId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_export_type_created" ON "Export"("type", "createdAt" DESC);

-- 19. Add indexes for search history
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_search_history_user_created" ON "SearchHistory"("userId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_search_history_query_created" ON "SearchHistory"("query", "createdAt" DESC);

-- 20. Add indexes for build logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_build_log_deployment_started" ON "BuildLog"("deploymentId", "startedAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_build_log_status_started" ON "BuildLog"("status", "startedAt" DESC);

-- 21. Add indexes for repository tags
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_tag_repo_type" ON "RepositoryTag"("repositoryId", "type");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_tag_name_value" ON "RepositoryTag"("name", "value");

-- 22. Add indexes for batch jobs
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_batch_job_type_status" ON "BatchJob"("type", "status");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_batch_job_created_desc" ON "BatchJob"("createdAt" DESC);

-- 23. Add indexes for repository creation logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repo_creation_log_job_created" ON "RepositoryCreationLog"("batchJobId", "createdAt" DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repo_creation_log_project_status" ON "RepositoryCreationLog"("projectId", "status");

-- 24. Add constraint indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_project_id_title" ON "Project"("id", "title");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_user_id_name" ON "User"("id", "name");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_id_status" ON "Repository"("id", "status");

-- 25. Add indexes for JSON columns (PostgreSQL specific)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_dependencies_gin" ON "Repository" USING gin("dependencies");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_code_metrics_gin" ON "Repository" USING gin("codeMetrics");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_code_analysis_vulnerabilities_gin" ON "CodeAnalysis" USING gin("vulnerabilities");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_code_analysis_dependencies_gin" ON "CodeAnalysis" USING gin("dependencies");

-- 26. Add indexes for webhook operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_github_webhook_repo_active" ON "GitHubWebhook"("repositoryId", "isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_github_webhook_active_delivery" ON "GitHubWebhook"("isActive", "lastDelivery" DESC);

-- 27. Add indexes for template usage
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_template_category_active" ON "RepositoryTemplate"("category", "isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_repository_template_usage_desc" ON "RepositoryTemplate"("usageCount" DESC);

-- 28. Add indexes for deployment templates
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_template_platform_public" ON "DeploymentTemplate"("platform", "isPublic");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_template_usage_desc" ON "DeploymentTemplate"("usageCount" DESC);

-- 29. Add indexes for platform credentials
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_platform_credential_platform_active" ON "PlatformCredential"("platform", "isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_platform_credential_user_platform" ON "PlatformCredential"("userId", "platform");

-- 30. Add indexes for deployment environment variables
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_env_deployment_key" ON "DeploymentEnv"("deploymentId", "key");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_deployment_env_secret_key" ON "DeploymentEnv"("isSecret", "key");

-- Performance optimization settings
-- Enable auto-vacuum for better performance
ALTER TABLE "Project" SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE "Activity" SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE "Repository" SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE "Deployment" SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE "DeploymentLog" SET (autovacuum_vacuum_scale_factor = 0.1);

-- Set fillfactor for tables that are updated frequently
ALTER TABLE "Project" SET (fillfactor = 90);
ALTER TABLE "Repository" SET (fillfactor = 90);
ALTER TABLE "Deployment" SET (fillfactor = 90);
ALTER TABLE "Activity" SET (fillfactor = 95);
ALTER TABLE "DeploymentLog" SET (fillfactor = 95);

-- Add comments for documentation
COMMENT ON INDEX "idx_project_category_status" IS 'Composite index for filtering projects by category and status';
COMMENT ON INDEX "idx_project_active_category" IS 'Partial index for active projects by category';
COMMENT ON INDEX "idx_project_tags_gin" IS 'Full-text search index for project tags';
COMMENT ON INDEX "idx_system_metric_service_timestamp" IS 'Index for time-series queries on system metrics';
COMMENT ON INDEX "idx_deployment_log_deployment_timestamp" IS 'Index for deployment log queries ordered by timestamp';

-- Create a view for frequently accessed project data
CREATE OR REPLACE VIEW "ProjectSummary" AS
SELECT 
    p.id,
    p.title,
    p.category,
    p.status,
    p.qualityScore,
    p.technicalComplexity,
    p.createdAt,
    p.updatedAt,
    p.ownerId,
    u.name as ownerName,
    r.status as repositoryStatus,
    r.healthScore as repositoryHealth,
    COUNT(c.id) as commentCount,
    COUNT(DISTINCT a.id) as activityCount
FROM "Project" p
LEFT JOIN "User" u ON p.ownerId = u.id
LEFT JOIN "Repository" r ON p.id = r.projectId
LEFT JOIN "Comment" c ON p.id = c.projectId
LEFT JOIN "Activity" a ON p.id = a.projectId
GROUP BY p.id, u.name, r.status, r.healthScore;

-- Create a materialized view for analytics dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS "AnalyticsSummary" AS
SELECT 
    DATE_TRUNC('day', p.createdAt) as date,
    p.category,
    COUNT(*) as project_count,
    AVG(p.qualityScore) as avg_quality_score,
    AVG(p.technicalComplexity) as avg_technical_complexity,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_projects,
    COUNT(CASE WHEN p.qualityScore >= 8 THEN 1 END) as high_quality_projects,
    COUNT(CASE WHEN p.qualityScore < 4 THEN 1 END) as low_quality_projects
FROM "Project" p
WHERE p.createdAt >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', p.createdAt), p.category
ORDER BY date DESC, category;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS "idx_analytics_summary_date_category" ON "AnalyticsSummary"("date", "category");

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW "AnalyticsSummary";
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to refresh the materialized view (if pg_cron is available)
-- SELECT cron.schedule('refresh-analytics', '0 */4 * * *', 'SELECT refresh_analytics_summary();');

-- Add database statistics for query planner
ANALYZE "Project";
ANALYZE "Repository";
ANALYZE "Activity";
ANALYZE "Deployment";
ANALYZE "User";
ANALYZE "Comment";
ANALYZE "SystemMetric";
ANALYZE "AIInsight";
ANALYZE "CodeAnalysis";
ANALYZE "DeploymentLog";
ANALYZE "Incident";
ANALYZE "Session";
ANALYZE "Notification";
ANALYZE "TeamMember";
ANALYZE "TeamProject";
ANALYZE "Export";
ANALYZE "SearchHistory";
ANALYZE "BuildLog";
ANALYZE "RepositoryTag";
ANALYZE "BatchJob";
ANALYZE "RepositoryCreationLog";
ANALYZE "GitHubWebhook";
ANALYZE "RepositoryTemplate";
ANALYZE "DeploymentTemplate";
ANALYZE "PlatformCredential";
ANALYZE "DeploymentEnv";