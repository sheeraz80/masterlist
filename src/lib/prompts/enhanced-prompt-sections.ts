/**
 * Enhanced Prompt Sections for Gold Standard Compliance
 * Additional sections to meet Chrome Extension Master Checklist standards
 */

export class EnhancedPromptSections {
  /**
   * Cross-Browser Compatibility Requirements
   */
  static getCrossBrowserSection(): string {
    return `
## 🌐 Cross-Browser Compatibility

### Browser Support Requirements
- Chrome/Chromium (primary target)
- Firefox (WebExtension API)
- Edge (Chromium-based)
- Safari (if applicable)
- Opera (Chromium-based)

### Implementation Requirements
1. **WebExtension Polyfill**
   - Use browser-polyfill for API compatibility
   - Handle browser-specific APIs gracefully
   - Test on all target browsers

2. **API Differences**
   - Use feature detection before API calls
   - Provide fallbacks for unsupported APIs
   - Document browser-specific limitations

3. **Manifest Variations**
   - Handle Manifest V2/V3 differences
   - Browser-specific manifest keys
   - Permission compatibility

4. **Testing Matrix**
   - Automated cross-browser testing
   - Version compatibility checks
   - Performance benchmarks per browser`;
  }

  /**
   * Advanced Testing Infrastructure
   */
  static getAdvancedTestingSection(): string {
    return `
## 🧪 Advanced Testing Requirements

### Testing Infrastructure
1. **Unit Testing (Jest)**
   - Minimum 80% code coverage
   - Mock all external dependencies
   - Test error scenarios
   - Performance benchmarks
   
   Example configuration:
   \`\`\`javascript
   // jest.config.js with Chrome API mocks
   setupFilesAfterEnv: ['<rootDir>/tests/setup/chrome-mocks.js']
   \`\`\`

2. **Integration Testing**
   - API integration tests
   - Storage operations
   - Message passing between components
   - Permission handling

3. **E2E Testing (Puppeteer/Playwright)**
   - User flow testing
   - Cross-browser automation
   - Visual regression tests
   - Performance profiling
   
4. **Chrome Extension Specific**
   - Popup interaction tests
   - Content script injection
   - Background service worker lifecycle
   - Extension API mocking

### Test Data Management
- Fixtures for consistent testing
- Test data generators
- Environment-specific configs
- Cleanup procedures`;
  }

  /**
   * Analytics and Monitoring Integration
   */
  static getAnalyticsMonitoringSection(): string {
    return `
## 📊 Analytics & Monitoring Implementation

### Privacy-Compliant Analytics
1. **Google Analytics 4**
   - Event tracking setup
   - User consent management
   - Custom dimensions
   - Conversion tracking
   - Debug mode for development

2. **Custom Analytics Solution**
   - Self-hosted option (Plausible/Matomo)
   - Privacy-first implementation
   - GDPR/CCPA compliance
   - Data retention policies

### Error Monitoring
1. **Sentry Integration**
   - Error capturing and grouping
   - Performance monitoring
   - Release tracking
   - User context (anonymized)
   - Source map support

2. **Custom Error Handling**
   - Global error handlers
   - Async error catching
   - Error recovery strategies
   - User-friendly error messages

### Performance Monitoring
- Core Web Vitals tracking
- Memory usage monitoring
- API response times
- User interaction metrics
- Custom performance marks`;
  }

  /**
   * Internationalization Requirements
   */
  static getI18nSection(): string {
    return `
## 🌍 Internationalization (i18n)

### Chrome i18n API Implementation
1. **Message Management**
   - _locales directory structure
   - messages.json for each locale
   - Fallback chain configuration
   - Placeholder support

2. **Implementation Pattern**
   \`\`\`javascript
   // Use Chrome i18n API
   chrome.i18n.getMessage('messageName', ['placeholder'])
   
   // React/UI framework integration
   const t = useI18n();
   \`\`\`

3. **Supported Languages**
   - English (en) - Required
   - Spanish (es)
   - French (fr)
   - German (de)
   - Japanese (ja)
   - Chinese Simplified (zh_CN)
   - [Add based on target markets]

4. **Localization Requirements**
   - RTL support (Arabic, Hebrew)
   - Date/time formatting
   - Number/currency formatting
   - Pluralization rules
   - Context for translators

5. **Testing**
   - Pseudo-localization for UI testing
   - Translation completeness checks
   - RTL layout testing
   - Character encoding validation`;
  }

  /**
   * Advanced CI/CD Pipeline
   */
  static getAdvancedCICDSection(): string {
    return `
## 🚀 Advanced CI/CD Pipeline

### GitHub Actions Workflow
1. **Build Pipeline**
   \`\`\`yaml
   - Lint and type checking
   - Unit test execution
   - E2E test suite
   - Security scanning
   - Bundle size analysis
   - Performance benchmarks
   \`\`\`

2. **Release Pipeline**
   - Semantic versioning
   - Changelog generation
   - Asset optimization
   - Source map generation
   - Store package creation
   - Automated submission

3. **Store Deployment**
   - Chrome Web Store API integration
   - Staged rollout configuration
   - A/B testing setup
   - Rollback procedures
   - Post-deployment validation

4. **Multi-Platform Release**
   - Chrome Web Store
   - Firefox Add-ons
   - Edge Add-ons
   - Self-hosted updates
   - Beta channel management`;
  }

  /**
   * Advanced Security Implementation
   */
  static getAdvancedSecuritySection(): string {
    return `
## 🔐 Advanced Security Implementation

### Security Infrastructure
1. **Authentication & Authorization**
   - OAuth 2.0/OIDC integration
   - JWT token management
   - Refresh token rotation
   - Session management
   - Multi-factor authentication

2. **Data Protection**
   - AES-256 encryption for sensitive data
   - Secure key storage (never in code)
   - Certificate pinning
   - Secure communication channels
   - Input sanitization library

3. **Extension Security**
   - Content Security Policy (strict)
   - Isolated worlds for content scripts
   - Secure message passing
   - Dynamic code evaluation prevention
   - External resource validation

4. **API Security**
   - Rate limiting implementation
   - API key rotation
   - Request signing
   - CORS configuration
   - Webhook validation

5. **Security Monitoring**
   - Dependency vulnerability scanning
   - Security headers validation
   - Penetration test readiness
   - Incident response plan
   - Security audit logging`;
  }

  /**
   * Monetization Infrastructure
   */
  static getMonetizationSection(): string {
    return `
## 💰 Monetization Infrastructure

### Payment Processing
1. **Integration Options**
   - Stripe for subscriptions
   - Paddle as Merchant of Record
   - FastSpring for global sales
   - Google Play Billing (if applicable)

2. **License Management**
   - License key generation
   - Device fingerprinting
   - Activation limits
   - Offline validation
   - License recovery

3. **Subscription Features**
   - Free tier with limitations
   - Multiple pricing tiers
   - Usage-based billing
   - Grandfathering support
   - Upgrade/downgrade flows

4. **Revenue Optimization**
   - A/B testing for pricing
   - Conversion tracking
   - Churn prevention
   - Upsell opportunities
   - Referral program

5. **Compliance**
   - Tax calculation
   - Invoice generation
   - Refund handling
   - Subscription management UI
   - Payment method updates`;
  }

  /**
   * Store Optimization
   */
  static getStoreOptimizationSection(): string {
    return `
## 🏪 Store Listing Optimization

### Chrome Web Store Requirements
1. **Assets**
   - Icon: 128x128px (PNG)
   - Screenshots: 1280x800 or 640x400
   - Promotional tiles: 440x280, 920x680, 1400x560
   - Promotional video: 30 seconds max

2. **Listing Optimization**
   - Keyword research and implementation
   - A/B testing descriptions
   - Compelling feature highlights
   - Social proof integration
   - Regular updates for freshness

3. **User Engagement**
   - Review response strategy
   - User feedback integration
   - Feature request tracking
   - Community building
   - Support channel setup`;
  }
}

/**
 * Enhanced Chrome Extension Prompt Generator
 * Includes all Master Checklist requirements
 */
export class EnhancedChromeExtensionPrompt {
  static generateCompletePrompt(project: any): string {
    const basePrompt = ChromeExtensionPromptGenerator.generateSpecializedPrompt(project);
    
    // Insert all enhanced sections after the base requirements
    const enhancedSections = [
      EnhancedPromptSections.getCrossBrowserSection(),
      EnhancedPromptSections.getAdvancedTestingSection(),
      EnhancedPromptSections.getAnalyticsMonitoringSection(),
      EnhancedPromptSections.getI18nSection(),
      EnhancedPromptSections.getAdvancedCICDSection(),
      EnhancedPromptSections.getAdvancedSecuritySection(),
      EnhancedPromptSections.getMonetizationSection(),
      EnhancedPromptSections.getStoreOptimizationSection()
    ].join('\n\n');
    
    // Insert enhanced sections before deployment requirements
    return basePrompt.replace(
      '## 🚀 Deployment Requirements',
      enhancedSections + '\n\n## 🚀 Deployment Requirements'
    );
  }
}