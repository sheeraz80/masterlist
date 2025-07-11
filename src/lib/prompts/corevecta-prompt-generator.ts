/**
 * CoreVecta LLC - Master Prompt Generation System
 * Generates comprehensive prompts for all project types with quality standards
 */

import { Project } from '@prisma/client';

export interface EnhancedProject extends Project {
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  feature_modules: FeatureModule[];
  quality_requirements: QualityRequirements;
  certification_target?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface FeatureModule {
  id: string;
  name: string;
  description: string;
  category: string;
  estimated_hours: number;
}

export interface QualityRequirements {
  test_coverage: number;
  documentation: string;
  security_score: number;
  accessibility: string;
}

export class CoreVectaPromptGenerator {
  /**
   * Generate master-level prompts for any project type
   */
  static generateMasterPrompt(project: EnhancedProject): string {
    const header = this.generateHeader(project);
    const requirements = this.generateRequirements(project);
    const architecture = this.generateArchitecture(project);
    const features = this.generateFeatures(project);
    const quality = this.generateQualityStandards(project);
    const security = this.generateSecurityRequirements(project);
    const testing = this.generateTestingRequirements(project);
    const documentation = this.generateDocumentationRequirements(project);
    const deployment = this.generateDeploymentRequirements(project);
    const business = this.generateBusinessRequirements(project);
    const deliverables = this.generateDeliverables(project);
    const footer = this.generateFooter(project);

    return `${header}
${requirements}
${architecture}
${features}
${quality}
${security}
${testing}
${documentation}
${deployment}
${business}
${deliverables}
${footer}`;
  }

  private static generateHeader(project: EnhancedProject): string {
    return `# CoreVecta Masterlist Project Generation
## ${project.title}

**Project ID**: ${project.id}
**Category**: ${project.category}
**Complexity**: ${project.complexity}
**Certification Target**: ${project.certification_target || 'Gold'}
**Development Time**: ${project.developmentTime}

---

You are creating a production-ready ${project.category} project that meets CoreVecta's ${project.complexity}-level quality standards. This project must be immediately deployable and monetization-ready.`;
  }

  private static generateRequirements(project: EnhancedProject): string {
    return `
## 🎯 Project Requirements

### Problem Statement
${project.problem}

### Solution Architecture
${project.solution}

### Target Users
${project.targetUsers}

### Key Success Criteria
- Solve the core problem effectively
- Provide exceptional user experience
- Meet all quality benchmarks
- Be immediately monetizable
- Scale to ${this.getScaleTarget(project.complexity)} users`;
  }

  private static generateArchitecture(project: EnhancedProject): string {
    const architecturePatterns = this.getArchitecturePatterns(project);
    
    return `
## 🏗️ Architecture Requirements

### Design Patterns
${architecturePatterns.map(p => `- ${p}`).join('\n')}

### Performance Targets
- Initial load time: < ${this.getLoadTimeTarget(project.complexity)}ms
- Memory usage: < ${this.getMemoryTarget(project.complexity)}MB
- CPU usage: < ${this.getCPUTarget(project.complexity)}%
- Handles ${this.getConcurrencyTarget(project.complexity)} concurrent operations

### Scalability Requirements
- Modular architecture for feature additions
- Lazy loading for optimal performance
- Efficient state management
- Resource cleanup and garbage collection
- Database/storage optimization`;
  }

  private static generateFeatures(project: EnhancedProject): string {
    const coreFeatures = project.keyFeatures.split(',').map(f => f.trim());
    const moduleFeatures = project.feature_modules.map(m => m.name);
    
    return `
## ✨ Feature Implementation

### Core Features (Required)
${coreFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

### Enhanced Features (From Modules)
${moduleFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

### User Experience Features
- Intuitive onboarding flow
- Contextual help system
- Keyboard shortcuts
- Accessibility compliance (WCAG ${project.quality_requirements.accessibility})
- Multi-language support (if applicable)
- Dark/light theme support`;
  }

  private static generateQualityStandards(project: EnhancedProject): string {
    return `
## 📊 Quality Standards

### Code Quality Requirements
- **Clean Code**: Follow SOLID principles and design patterns
- **Type Safety**: Full TypeScript with strict mode (if applicable)
- **Linting**: Zero ESLint errors or warnings
- **Code Coverage**: Minimum ${project.quality_requirements.test_coverage}% test coverage
- **Complexity**: Maximum cyclomatic complexity of ${this.getComplexityLimit(project.complexity)}
- **Documentation**: JSDoc for all public APIs
- **Performance**: All operations < ${this.getOperationLimit(project.complexity)}ms

### CoreVecta Code Standards
- Use meaningful variable and function names
- Maximum function length: 50 lines
- Maximum file length: 300 lines
- Consistent code formatting (Prettier)
- No console.logs in production code
- Proper error handling throughout`;
  }

  private static generateSecurityRequirements(project: EnhancedProject): string {
    const securityFeatures = this.getSecurityFeatures(project);
    
    return `
## 🔒 Security Requirements

### Mandatory Security Features
${securityFeatures.map(f => `- ${f}`).join('\n')}

### Security Score Target: ${project.quality_requirements.security_score}/100

### Implementation Requirements
- Input validation on all user inputs
- Output encoding to prevent XSS
- Secure storage for sensitive data
- API rate limiting and throttling
- Secure communication (HTTPS/WSS)
- Regular dependency updates
- No hardcoded secrets or keys
- Proper authentication and authorization
- OWASP Top 10 compliance`;
  }

  private static generateTestingRequirements(project: EnhancedProject): string {
    return `
## 🧪 Testing Requirements

### Test Coverage: Minimum ${project.quality_requirements.test_coverage}%

### Required Test Types
1. **Unit Tests**
   - All business logic functions
   - Utility functions
   - Data transformations
   - Error handling paths

2. **Integration Tests**
   - API integrations
   - Database operations
   - Third-party service interactions
   - Component interactions

3. **End-to-End Tests**
   - Critical user flows
   - Payment processes (if applicable)
   - Authentication flows
   - Data persistence

4. **Performance Tests**
   - Load testing for concurrent users
   - Memory leak detection
   - Response time benchmarks

### Testing Tools
- Jest for unit/integration tests
- Puppeteer/Playwright for E2E tests
- Mock all external dependencies
- Test data generators
- Coverage reporting`;
  }

  private static generateDocumentationRequirements(project: EnhancedProject): string {
    const docLevel = project.quality_requirements.documentation;
    
    return `
## 📚 Documentation Requirements

### Documentation Level: ${docLevel}

### Required Documentation
1. **README.md**
   - Project overview and features
   - Quick start guide
   - Installation instructions
   - Configuration options
   - Troubleshooting section
   - CoreVecta branding

2. **API Documentation**
   - All public APIs documented
   - Request/response examples
   - Error codes and handling
   - Rate limits and quotas

3. **User Guide**
   - Feature walkthroughs
   - Screenshots/videos
   - FAQs
   - Best practices

4. **Developer Documentation**
   - Architecture overview
   - Contributing guidelines
   - Code style guide
   - Testing instructions
   - Deployment guide

5. **CLAUDE.md**
   - AI assistant context
   - Project structure
   - Key decisions
   - Common tasks`;
  }

  private static generateDeploymentRequirements(project: EnhancedProject): string {
    return `
## 🚀 Deployment Requirements

### Build Configuration
- Production-optimized builds
- Source maps for debugging
- Asset optimization (minification, compression)
- Environment-specific configurations
- Version management

### CI/CD Pipeline
- Automated testing on all commits
- Build validation
- Security scanning
- Automated deployment to staging
- Release tagging and notes

### Monitoring & Logging
- Error tracking integration
- Performance monitoring
- User analytics (privacy-compliant)
- Custom event tracking
- Alert configuration

### Platform-Specific Requirements
${this.getPlatformRequirements(project.category)}`;
  }

  private static generateBusinessRequirements(project: EnhancedProject): string {
    return `
## 💰 Business & Monetization

### Revenue Model: ${project.revenueModel}
### Revenue Potential: ${project.revenuePotential}

### Monetization Implementation
${this.getMonetizationRequirements(project)}

### Growth Features
- User referral system
- Analytics dashboard
- A/B testing capability
- Email capture (GDPR compliant)
- Social sharing features
- SEO optimization (if applicable)

### Legal Compliance
- Terms of Service
- Privacy Policy
- Cookie Policy (if applicable)
- GDPR compliance
- CCPA compliance
- License agreement`;
  }

  private static generateDeliverables(project: EnhancedProject): string {
    const deliverables = this.getDeliverables(project);
    
    return `
## 📦 Deliverables

### Core Deliverables
${deliverables.core.map((d, i) => `${i + 1}. ${d}`).join('\n')}

### Quality Deliverables
${deliverables.quality.map((d, i) => `${i + 1}. ${d}`).join('\n')}

### Business Deliverables
${deliverables.business.map((d, i) => `${i + 1}. ${d}`).join('\n')}

### CoreVecta Certification Requirements
- All tests passing (${project.quality_requirements.test_coverage}%+ coverage)
- Security scan passed (${project.quality_requirements.security_score}+ score)
- Performance benchmarks met
- Documentation complete
- Accessibility compliant (WCAG ${project.quality_requirements.accessibility})
- Production deployment ready`;
  }

  private static generateFooter(project: EnhancedProject): string {
    return `
---

## 🏆 CoreVecta Quality Certification

This project is targeting **${project.certification_target || 'Gold'}** certification level.

### Certification Requirements:
- ✅ All deliverables complete
- ✅ Quality metrics achieved
- ✅ Security standards met
- ✅ Performance targets reached
- ✅ Documentation comprehensive
- ✅ Business model implemented

### Development Guidelines:
1. Follow CoreVecta coding standards
2. Implement all required features
3. Ensure production readiness
4. Focus on user experience
5. Build for scalability
6. Prioritize security

**Remember**: This is a CoreVecta Masterlist project. Quality is non-negotiable. Build something that users will love and pay for.

---
*Generated by CoreVecta Masterlist Platform - Building the future of software development*`;
  }

  // Helper methods
  private static getScaleTarget(complexity: string): string {
    const targets = {
      basic: '1,000',
      intermediate: '10,000',
      advanced: '100,000',
      enterprise: '1,000,000+'
    };
    return targets[complexity] || '10,000';
  }

  private static getLoadTimeTarget(complexity: string): number {
    const targets = {
      basic: 3000,
      intermediate: 2000,
      advanced: 1500,
      enterprise: 1000
    };
    return targets[complexity] || 2000;
  }

  private static getMemoryTarget(complexity: string): number {
    const targets = {
      basic: 100,
      intermediate: 75,
      advanced: 50,
      enterprise: 30
    };
    return targets[complexity] || 75;
  }

  private static getCPUTarget(complexity: string): number {
    const targets = {
      basic: 30,
      intermediate: 20,
      advanced: 15,
      enterprise: 10
    };
    return targets[complexity] || 20;
  }

  private static getConcurrencyTarget(complexity: string): string {
    const targets = {
      basic: '10',
      intermediate: '100',
      advanced: '1,000',
      enterprise: '10,000+'
    };
    return targets[complexity] || '100';
  }

  private static getComplexityLimit(complexity: string): number {
    const limits = {
      basic: 15,
      intermediate: 10,
      advanced: 8,
      enterprise: 5
    };
    return limits[complexity] || 10;
  }

  private static getOperationLimit(complexity: string): number {
    const limits = {
      basic: 1000,
      intermediate: 500,
      advanced: 200,
      enterprise: 100
    };
    return limits[complexity] || 500;
  }

  private static getArchitecturePatterns(project: EnhancedProject): string[] {
    const basePatterns = [
      'Separation of Concerns',
      'Dependency Injection',
      'Observer Pattern for events',
      'Factory Pattern for object creation'
    ];

    if (project.complexity === 'intermediate' || project.complexity === 'advanced' || project.complexity === 'enterprise') {
      basePatterns.push(
        'Repository Pattern for data access',
        'Strategy Pattern for algorithms',
        'Facade Pattern for complex subsystems'
      );
    }

    if (project.complexity === 'advanced' || project.complexity === 'enterprise') {
      basePatterns.push(
        'CQRS for complex operations',
        'Event Sourcing for audit trails',
        'Microservices architecture (if applicable)'
      );
    }

    return basePatterns;
  }

  private static getSecurityFeatures(project: EnhancedProject): string[] {
    const features = [
      'Content Security Policy (CSP)',
      'Input sanitization',
      'HTTPS enforcement',
      'Secure session management'
    ];

    if (project.complexity !== 'basic') {
      features.push(
        'OAuth 2.0 authentication',
        'API key management',
        'Rate limiting',
        'CORS configuration'
      );
    }

    if (project.complexity === 'advanced' || project.complexity === 'enterprise') {
      features.push(
        'End-to-end encryption',
        'Multi-factor authentication',
        'Audit logging',
        'Compliance reporting'
      );
    }

    return features;
  }

  private static getPlatformRequirements(category: string): string {
    const requirements = {
      'Chrome Extension': `- Manifest V3 compliance
- Chrome Web Store listing ready
- Cross-browser compatibility prep
- Extension size < 10MB`,
      'iOS Apps': `- App Store guidelines compliance
- iOS 14+ support
- SwiftUI implementation
- App size optimization`,
      'Android Apps': `- Google Play Store ready
- Material Design compliance
- Android 6+ support
- APK size optimization`,
      'Web Apps': `- SEO optimized
- PWA capabilities
- CDN deployment ready
- Mobile responsive`,
      'Smart Contracts': `- Gas optimization
- Audit-ready code
- Mainnet deployment guide
- Security best practices`
    };

    return requirements[category] || '- Platform-specific optimizations\n- Store/marketplace compliance\n- Distribution ready';
  }

  private static getMonetizationRequirements(project: EnhancedProject): string {
    const models = {
      'Subscription': `- Payment processor integration (Stripe/Paddle)
- Subscription tiers implementation
- Free trial system
- Upgrade/downgrade flows
- Payment failure handling
- Invoice generation`,
      'One-time Purchase': `- License key generation
- Payment verification
- Refund handling
- Multi-device licensing
- Offline validation`,
      'Freemium': `- Feature gating system
- Usage tracking
- Upgrade prompts
- Free tier limitations
- Premium feature highlights`,
      'Usage-based': `- Usage metering
- Billing calculations
- Overage handling
- Usage analytics
- Cost optimization tips`
    };

    const baseModel = Object.keys(models).find(key => 
      project.revenueModel.toLowerCase().includes(key.toLowerCase())
    );

    return models[baseModel] || models['Freemium'];
  }

  private static getDeliverables(project: EnhancedProject): {
    core: string[];
    quality: string[];
    business: string[];
  } {
    return {
      core: [
        'Complete source code with CoreVecta standards',
        'All features implemented and tested',
        'Production-ready build configuration',
        'Environment setup instructions',
        'Database schema and migrations (if applicable)'
      ],
      quality: [
        `${project.quality_requirements.test_coverage}%+ test coverage with passing tests`,
        'Zero critical security vulnerabilities',
        'Performance benchmarks documentation',
        'Accessibility audit report',
        'Code quality metrics report'
      ],
      business: [
        'Monetization system fully integrated',
        'Analytics and tracking configured',
        'Marketing website/landing page',
        'User onboarding flow',
        'Support documentation'
      ]
    };
  }
}

// Specialized prompt generators for different platforms
export class ChromeExtensionPromptGenerator extends CoreVectaPromptGenerator {
  static generateSpecializedPrompt(project: EnhancedProject): string {
    const basePrompt = super.generateMasterPrompt(project);
    const chromeSpecific = `
## 🌐 Chrome Extension Specific Requirements

### Manifest V3 Compliance
- Service worker architecture
- Declarative net request rules
- Proper permission declarations
- Host permissions minimized

### Extension Features
- Popup interface with great UX
- Options page for configuration
- Context menu integration
- Badge updates
- Notification system
- Keyboard shortcuts

### Chrome APIs
- Efficient use of chrome.storage
- Message passing between components
- Tab and window management
- WebRequest handling (if needed)
- Identity API for OAuth

### Performance
- Popup opens in < 100ms
- Background script optimized
- Memory efficient content scripts
- Minimal permission requests`;

    return basePrompt.replace('## 🚀 Deployment Requirements', chromeSpecific + '\n\n## 🚀 Deployment Requirements');
  }
}

export class MobileAppPromptGenerator extends CoreVectaPromptGenerator {
  static generateSpecializedPrompt(project: EnhancedProject, platform: 'ios' | 'android'): string {
    const basePrompt = super.generateMasterPrompt(project);
    const mobileSpecific = platform === 'ios' ? `
## 📱 iOS App Specific Requirements

### Platform Requirements
- iOS 14+ support
- SwiftUI implementation
- Swift 5.5+ features
- iPad compatibility

### iOS Features
- Face ID/Touch ID integration
- Push notifications
- Core Data/CloudKit
- HealthKit/HomeKit (if applicable)
- App Clips support

### App Store Compliance
- App Store guidelines adherence
- Privacy nutrition labels
- App size < 150MB
- Screenshot requirements
- TestFlight ready` : `
## 🤖 Android App Specific Requirements

### Platform Requirements
- Android 6+ (API 23+) support
- Kotlin implementation
- Material Design 3
- Tablet compatibility

### Android Features
- Biometric authentication
- Push notifications (FCM)
- Room database
- Work Manager for background tasks
- App Widgets (if applicable)

### Play Store Compliance
- Play Store policies adherence
- Privacy policy requirements
- APK/AAB optimization
- Screenshot requirements
- Internal testing ready`;

    return basePrompt.replace('## 🚀 Deployment Requirements', mobileSpecific + '\n\n## 🚀 Deployment Requirements');
  }
}

export class BlockchainPromptGenerator extends CoreVectaPromptGenerator {
  static generateSpecializedPrompt(project: EnhancedProject, blockchain: string): string {
    const basePrompt = super.generateMasterPrompt(project);
    const blockchainSpecific = `
## ⛓️ Blockchain Specific Requirements

### Smart Contract Standards
- ${blockchain === 'ethereum' ? 'ERC standards compliance' : 'Platform standards compliance'}
- Gas optimization mandatory
- Upgradeable contracts (if applicable)
- Multi-sig support
- Time locks for security

### Security Requirements
- Reentrancy protection
- Integer overflow protection
- Access control implementation
- Flash loan attack prevention
- Front-running mitigation

### Testing Requirements
- Unit tests for all functions
- Integration tests on testnet
- Fuzzing tests
- Gas consumption tests
- Mainnet fork testing

### Deployment
- Deployment scripts
- Verification scripts
- Emergency pause mechanism
- Upgrade procedures
- Documentation for auditors`;

    return basePrompt.replace('## 🚀 Deployment Requirements', blockchainSpecific + '\n\n## 🚀 Deployment Requirements');
  }
}

// Export all generators
export const PromptGenerators = {
  Core: CoreVectaPromptGenerator,
  ChromeExtension: ChromeExtensionPromptGenerator,
  MobileApp: MobileAppPromptGenerator,
  Blockchain: BlockchainPromptGenerator
};