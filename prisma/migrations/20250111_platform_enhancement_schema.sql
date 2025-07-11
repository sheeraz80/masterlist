-- CoreVecta LLC - Masterlist Platform Enhancement Schema
-- This migration adds comprehensive project quality, feature modules, and certification systems

-- 1. Enhance projects table with quality metrics and complexity levels
ALTER TABLE projects ADD COLUMN IF NOT EXISTS complexity VARCHAR(20) DEFAULT 'basic' CHECK (complexity IN ('basic', 'intermediate', 'advanced', 'enterprise'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS feature_modules JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS testing_coverage INTEGER DEFAULT 0 CHECK (testing_coverage >= 0 AND testing_coverage <= 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 0 CHECK (security_score >= 0 AND security_score <= 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS documentation_level VARCHAR(20) DEFAULT 'basic' CHECK (documentation_level IN ('basic', 'comprehensive', 'professional', 'enterprise'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deployment_ready BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS monitoring_enabled BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS internationalization_ready BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS accessibility_score INTEGER DEFAULT 0 CHECK (accessibility_score >= 0 AND accessibility_score <= 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS business_metrics JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS corevecta_certified BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS certification_level VARCHAR(20) CHECK (certification_level IN ('none', 'bronze', 'silver', 'gold', 'platinum'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS quality_audit_date TIMESTAMP;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_development_hours INTEGER;

-- 2. Feature modules table for modular project enhancements
CREATE TABLE IF NOT EXISTS feature_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL CHECK (category IN ('quality', 'security', 'scalability', 'business', 'operations', 'ux', 'deployment', 'documentation')),
  platform VARCHAR(100),
  complexity_required VARCHAR(20) NOT NULL CHECK (complexity_required IN ('basic', 'intermediate', 'advanced', 'enterprise')),
  template_files JSONB NOT NULL DEFAULT '{}',
  dependencies JSONB DEFAULT '[]',
  estimated_hours INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  corevecta_approved BOOLEAN DEFAULT false,
  author VARCHAR(255) DEFAULT 'CoreVecta LLC',
  version VARCHAR(20) DEFAULT '1.0.0',
  pricing_model VARCHAR(50) CHECK (pricing_model IN ('free', 'premium', 'enterprise', 'custom')),
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Project features junction table
CREATE TABLE IF NOT EXISTS project_features (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES feature_modules(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  installed_version VARCHAR(20),
  added_at TIMESTAMP DEFAULT NOW(),
  added_by VARCHAR(255) DEFAULT 'system',
  PRIMARY KEY (project_id, feature_id)
);

-- 4. Quality metrics tracking
CREATE TABLE IF NOT EXISTS quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('code_quality', 'security', 'testing', 'documentation', 'accessibility', 'performance', 'best_practices')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  details JSONB DEFAULT '{}',
  recommendations TEXT[],
  measured_at TIMESTAMP DEFAULT NOW(),
  measured_by VARCHAR(255) DEFAULT 'CoreVecta QA System',
  UNIQUE(project_id, metric_type, measured_at)
);

-- 5. Deployment configurations
CREATE TABLE IF NOT EXISTS deployment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  platform VARCHAR(100) NOT NULL,
  config_type VARCHAR(50) NOT NULL CHECK (config_type IN ('ci_cd', 'build', 'release', 'monitoring', 'backup')),
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. CoreVecta certifications
CREATE TABLE IF NOT EXISTS corevecta_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  certification_level VARCHAR(20) NOT NULL CHECK (certification_level IN ('bronze', 'silver', 'gold', 'platinum')),
  issued_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  verification_code VARCHAR(100) UNIQUE NOT NULL,
  requirements_met JSONB NOT NULL DEFAULT '{}',
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  issued_by VARCHAR(255) DEFAULT 'CoreVecta Certification Authority',
  is_active BOOLEAN DEFAULT true,
  revoked_at TIMESTAMP,
  revocation_reason TEXT
);

-- 7. Template marketplace
CREATE TABLE IF NOT EXISTS template_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  complexity VARCHAR(20) NOT NULL CHECK (complexity IN ('basic', 'intermediate', 'advanced', 'enterprise')),
  template_data JSONB NOT NULL DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  author VARCHAR(255) NOT NULL,
  corevecta_verified BOOLEAN DEFAULT false,
  pricing_model VARCHAR(50) CHECK (pricing_model IN ('free', 'one_time', 'subscription', 'usage_based')),
  price DECIMAL(10,2) DEFAULT 0.00,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. User template purchases
CREATE TABLE IF NOT EXISTS template_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES template_marketplace(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP DEFAULT NOW(),
  price_paid DECIMAL(10,2) NOT NULL,
  license_key VARCHAR(255) UNIQUE NOT NULL,
  license_type VARCHAR(50) CHECK (license_type IN ('personal', 'team', 'enterprise')),
  is_active BOOLEAN DEFAULT true
);

-- 9. Quality audit logs
CREATE TABLE IF NOT EXISTS quality_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN ('automated', 'manual', 'ai_review', 'peer_review')),
  auditor VARCHAR(255) DEFAULT 'CoreVecta QA Bot',
  findings JSONB DEFAULT '{}',
  severity_counts JSONB DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0}',
  recommendations TEXT[],
  audit_date TIMESTAMP DEFAULT NOW(),
  audit_duration_seconds INTEGER,
  passed BOOLEAN DEFAULT false
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_complexity ON projects(complexity);
CREATE INDEX IF NOT EXISTS idx_projects_certification_level ON projects(certification_level);
CREATE INDEX IF NOT EXISTS idx_feature_modules_category ON feature_modules(category);
CREATE INDEX IF NOT EXISTS idx_feature_modules_platform ON feature_modules(platform);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_project_type ON quality_metrics(project_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_certifications_active ON corevecta_certifications(is_active, certification_level);
CREATE INDEX IF NOT EXISTS idx_template_marketplace_platform_category ON template_marketplace(platform, category);

-- 11. Add comments for documentation
COMMENT ON TABLE projects IS 'CoreVecta Masterlist projects with enhanced quality metrics and certification tracking';
COMMENT ON TABLE feature_modules IS 'Modular features that can be added to projects to enhance functionality';
COMMENT ON TABLE quality_metrics IS 'Tracks quality scores across different aspects of each project';
COMMENT ON TABLE corevecta_certifications IS 'Official CoreVecta quality certifications for projects';
COMMENT ON TABLE template_marketplace IS 'Premium and community templates for accelerated development';

-- 12. Insert default CoreVecta feature modules
INSERT INTO feature_modules (name, description, category, platform, complexity_required, estimated_hours, corevecta_approved, pricing_model) VALUES
('CoreVecta Testing Suite', 'Comprehensive testing framework with Jest, E2E tests, and coverage reporting', 'quality', 'all', 'intermediate', 8, true, 'free'),
('CoreVecta Security Pack', 'Advanced security features including encryption, auth, and vulnerability scanning', 'security', 'all', 'intermediate', 12, true, 'free'),
('CoreVecta Multi-Platform', 'Cross-browser and cross-platform compatibility layer', 'scalability', 'browser-extension', 'advanced', 16, true, 'premium'),
('CoreVecta Monetization Pro', 'Complete payment processing and license management system', 'business', 'all', 'advanced', 20, true, 'premium'),
('CoreVecta Analytics Dashboard', 'Real-time analytics and monitoring with custom dashboards', 'operations', 'all', 'intermediate', 10, true, 'premium'),
('CoreVecta i18n System', 'Full internationalization support with 10+ languages', 'ux', 'all', 'intermediate', 8, true, 'free'),
('CoreVecta CI/CD Pipeline', 'Automated build, test, and deployment pipeline', 'deployment', 'all', 'advanced', 6, true, 'free'),
('CoreVecta Docs Generator', 'Automated documentation generation with API docs and user guides', 'documentation', 'all', 'basic', 4, true, 'free');