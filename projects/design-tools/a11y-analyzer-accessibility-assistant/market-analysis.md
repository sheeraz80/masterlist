# A11y Analyzer (Accessibility Assistant) - Market Analysis

## Market Overview

### Problem Size
Beyond color contrast, other accessibility considerations in design (like sufficient tap target sizes, proper heading structures, use of semantic annotations) are often overlooked in the design phase. Designers may not realize their design could be hard for screen readers or motor-impaired users until development. There’s no built-in Figma tool to assess these aspects.

### Target Market
UX/UI designers concerned with accessibility, product designers in regulated industries that mandate accessible design, and design leads who want to ensure their team’s output meets standards (WCAG) before handing to dev. Many organizations now prioritize inclusive design, so this fits that trend.

## Competition Analysis

### Competition Level
**Rating:** Low – In design tools, few a11y plugins exist. Stark (a plugin) does color contrast and color blindness simulation (they have a subscription model and have some traction, Night Eye etc for dark mode). Stark is known in this space (color contrast, suggestions). Our plugin could be broader in scope but will inevitably overlap with contrast (which Stark does well). Competing with Stark could be tough if they expand, but we differentiate by covering other aspects. Essentially moderate competition from Stark for color checks; otherwise mostly novel.

### Competitive Landscape
Low – In design tools, few a11y plugins exist. Stark (a plugin) does color contrast and color blindness simulation (they have a subscription model and have some traction, Night Eye etc for dark mode). Stark is known in this space (color contrast, suggestions). Our plugin could be broader in scope but will inevitably overlap with contrast (which Stark does well). Competing with Stark could be tough if they expand, but we differentiate by covering other aspects. Essentially moderate competition from Stark for color checks; otherwise mostly novel.

## Revenue Analysis

### Revenue Model
Freemium with a likely focus on teams (maybe even enterprise pricing if we got traction). Basic checks (like tap size and contrast – though contrast we did separate plugin, but maybe basic included here too) can be free. Pro version ($10/month or $99/year per seat) includes advanced simulations (color blindness filters, screen reader outline generation, PDF of report, etc.). Possibly offer team licenses at a discount for companies.

### Revenue Potential
Conservative: $300/month; Realistic: $1,500/month; Optimistic: $5,000+/month. Accessibility is increasingly a requirement, and a tool that saves time in auditing designs could justify company spend. The optimistic scenario could happen if several mid-size companies adopt it for all designers (like 50 designers paying $99 each annually adds up). It’s somewhat niche but with strong impetus (legal compliance in some cases).

### Revenue Breakdown
- **Conservative:** 300/month
- **Realistic:** 1,500/month
- **Optimistic:** 5,000+/month

### Monetization Strategy
Emphasize risk and responsibility: “Avoid accessibility bugs early – catch them in design.” Many companies face lawsuits or user complaints if a11y is poor; framing this tool as reducing those risks and dev rework can justify the cost. We can reference the growing focus on inclusive design (market trend). Possibly collaborate with accessibility advocates or orgs to endorse it. The free part draws in individuals (esp. contrast sim which even Stark offers free basics) and the Pro is targeted at serious teams. If Stark is known, we might present as a more comprehensive alternative or complementary (they also have a paid version for ~$60/year for a suite). We need to ensure enough unique value beyond what Stark does (they do contrast, colorblind sim, and focus order but to what extent?). Perhaps pricing similarly or slightly lower for competition.

## Risk Assessment

### Overall Risk
Competition: Stark is an established player (it’s even integrated in other tools). If our plugin encroaches their territory, they might respond or we may struggle to convince users to switch. We mitigate by adding unique checks (target size, screen reader view) that they may not cover yet. Complexity of subject: Accessibility is nuanced; if our tool gives false confidence or misses issues, that could be problematic. We should clearly scope what we check and possibly provide educational content with the plugin (why an issue matters). Platform: Using Figma API for these analyses is fine, just heavy usage maybe. No server needed unless we offload heavy image processing for simulation – but likely can do approximations client-side. User adoption: Some designers might feel this is extra work or not their job; but the trend is shifting that it is part of design. We need to make it easy and maybe even frame as a creative aid (“see how everyone experiences your design”).

### Key Risks
- Platform dependency risk
- Competition risk
- Technical implementation risk
- Market adoption risk
- Revenue sustainability risk

### Mitigation Strategies
- Diversify across multiple platforms
- Focus on unique value proposition
- Maintain technical excellence
- Build strong user community
- Develop sustainable revenue streams

## Market Opportunity

### Total Addressable Market (TAM)
- Platform user base size
- Market segment size
- Growth potential

### Serviceable Addressable Market (SAM)
- Targetable user subset
- Geographic limitations
- Platform-specific constraints

### Serviceable Obtainable Market (SOM)
- Realistic market capture
- Competitive positioning
- Resource limitations

## Success Indicators
Adoption by accessibility-conscious teams (maybe if known inclusive design advocates recommend it). A drop in common a11y issues in designs for users (hard to measure, but maybe via user testimonials). Conversion rates might actually be high among those who download it, because those who seek it probably need the full features. If we see teams buying multiple pro seats, that’s a strong sign. Also integration: maybe event organizers or blogs listing it as a top plugin for inclusive design – that indicates impact.
