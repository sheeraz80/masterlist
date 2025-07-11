-- CoreVecta LLC - Masterlist Platform Enhancement Schema (Fixed for Prisma naming)
-- This migration adds comprehensive project quality, feature modules, and certification systems

-- 1. Enhance Project table with quality metrics and complexity levels
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS complexity VARCHAR(20) DEFAULT 'basic';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS feature_modules JSONB DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS testing_coverage INTEGER DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS documentation_level VARCHAR(20) DEFAULT 'basic';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS deployment_ready BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS monitoring_enabled BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS internationalization_ready BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS accessibility_score INTEGER DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS business_metrics JSONB DEFAULT '{}';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS corevecta_certified BOOLEAN DEFAULT false;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS certification_level VARCHAR(20);
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS quality_audit_date TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS estimated_development_hours INTEGER;

-- 2. Feature modules table for modular project enhancements
CREATE TABLE IF NOT EXISTS "FeatureModule" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  platform VARCHAR(100),
  complexity_required VARCHAR(20) NOT NULL,
  template_files JSONB NOT NULL DEFAULT '{}',
  dependencies JSONB DEFAULT '[]',
  estimated_hours INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  corevecta_approved BOOLEAN DEFAULT false,
  author VARCHAR(255) DEFAULT 'CoreVecta LLC',
  version VARCHAR(20) DEFAULT '1.0.0',
  pricing_model VARCHAR(50),
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 3. Project features junction table
CREATE TABLE IF NOT EXISTS "ProjectFeature" (
  project_id TEXT REFERENCES "Project"(id) ON DELETE CASCADE,
  feature_id TEXT REFERENCES "FeatureModule"(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  installed_version VARCHAR(20),
  added_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255) DEFAULT 'system',
  PRIMARY KEY (project_id, feature_id)
);

-- 4. Quality metrics tracking
CREATE TABLE IF NOT EXISTS "QualityMetric" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES "Project"(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  details JSONB DEFAULT '{}',
  recommendations TEXT[],
  measured_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  measured_by VARCHAR(255) DEFAULT 'CoreVecta QA System'
);

-- 5. Deployment configurations
CREATE TABLE IF NOT EXISTS "DeploymentConfig" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES "Project"(id) ON DELETE CASCADE,
  platform VARCHAR(100) NOT NULL,
  config_type VARCHAR(50) NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 6. CoreVecta certifications
CREATE TABLE IF NOT EXISTS "CoreVectaCertification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES "Project"(id) ON DELETE CASCADE,
  certification_level VARCHAR(20) NOT NULL,
  issued_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP(3) NOT NULL,
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  requirements_met JSONB NOT NULL DEFAULT '{}',
  overall_score INTEGER NOT NULL,
  issued_by VARCHAR(255) DEFAULT 'CoreVecta Certification Authority',
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP(3),
  revocation_reason TEXT
);

-- 7. Template marketplace
CREATE TABLE IF NOT EXISTS "TemplateMarketplace" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  complexity VARCHAR(20) NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  author VARCHAR(255) NOT NULL,
  corevecta_verified BOOLEAN DEFAULT false,
  pricing_model VARCHAR(50),
  price DECIMAL(10,2) DEFAULT 0.00,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 8. User template purchases
CREATE TABLE IF NOT EXISTS "TemplatePurchase" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  template_id TEXT REFERENCES "TemplateMarketplace"(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  price_paid DECIMAL(10,2) NOT NULL,
  license_key VARCHAR(255) UNIQUE NOT NULL,
  license_type VARCHAR(50),
  is_active BOOLEAN DEFAULT true
);

-- 9. Quality audit logs
CREATE TABLE IF NOT EXISTS "QualityAuditLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES "Project"(id) ON DELETE CASCADE,
  audit_type VARCHAR(50) NOT NULL,
  auditor VARCHAR(255) DEFAULT 'CoreVecta QA Bot',
  findings JSONB DEFAULT '{}',
  severity_counts JSONB DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0}',
  recommendations TEXT[],
  audit_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  audit_duration_seconds INTEGER,
  passed BOOLEAN DEFAULT false
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_complexity ON "Project"(complexity);
CREATE INDEX IF NOT EXISTS idx_projects_certification_level ON "Project"(certification_level);
CREATE INDEX IF NOT EXISTS idx_feature_modules_category ON "FeatureModule"(category);
CREATE INDEX IF NOT EXISTS idx_feature_modules_platform ON "FeatureModule"(platform);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_project_type ON "QualityMetric"(project_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_certifications_active ON "CoreVectaCertification"(is_active, certification_level);
CREATE INDEX IF NOT EXISTS idx_template_marketplace_platform_category ON "TemplateMarketplace"(platform, category);

-- 11. Insert default CoreVecta feature modules
INSERT INTO "FeatureModule" (id, name, description, category, platform, complexity_required, estimated_hours, corevecta_approved, pricing_model) VALUES
(gen_random_uuid()::text, 'CoreVecta Testing Suite', 'Comprehensive testing framework with Jest, E2E tests, and coverage reporting', 'quality', 'all', 'intermediate', 8, true, 'free'),
(gen_random_uuid()::text, 'CoreVecta Security Pack', 'Advanced security features including encryption, auth, and vulnerability scanning', 'security', 'all', 'intermediate', 12, true, 'free'),
(gen_random_uuid()::text, 'CoreVecta Multi-Platform', 'Cross-browser and cross-platform compatibility layer', 'scalability', 'browser-extension', 'advanced', 16, true, 'premium'),
(gen_random_uuid()::text, 'CoreVecta Monetization Pro', 'Complete payment processing and license management system', 'business', 'all', 'advanced', 20, true, 'premium'),
(gen_random_uuid()::text, 'CoreVecta Analytics Dashboard', 'Real-time analytics and monitoring with custom dashboards', 'operations', 'all', 'intermediate', 10, true, 'premium'),
(gen_random_uuid()::text, 'CoreVecta i18n System', 'Full internationalization support with 10+ languages', 'ux', 'all', 'intermediate', 8, true, 'free'),
(gen_random_uuid()::text, 'CoreVecta CI/CD Pipeline', 'Automated build, test, and deployment pipeline', 'deployment', 'all', 'advanced', 6, true, 'free'),
(gen_random_uuid()::text, 'CoreVecta Docs Generator', 'Automated documentation generation with API docs and user guides', 'documentation', 'all', 'basic', 4, true, 'free');