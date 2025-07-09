# MockupMaker (Device Mockup Generator)

## Overview
**Problem Statement:** Presenting designs in realistic device frames (like an iPhone mockup, or a browser window around a web design) is a common task for portfolios, client presentations, or marketing assets. Designers currently either manually place screenshots into mockup files or use external tools to generate these device previews. It’s extra work switching contexts.

**Solution:** A Figma plugin that instantly wraps a selected frame with a high-fidelity device mockup. For example, take a mobile app screen and render it inside an iPhone image with a shadow, or put a website design inside a browser window graphic with a URL bar. It can output these as new frames or export images ready to share. Essentially, automating the process of creating showcase mockups from designs.

**Target Users:** UI/UX designers preparing client presentations or dribbble/portfolio shots, marketing designers wanting product images, and freelancers who need to quickly deliver device previews.

## Quality Score
**Overall Score:** 6.5/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 8/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
One-time purchase per user (~$20) with possibly expansions (maybe charge extra packs of device templates). The value is clear per use and doesn’t necessarily need ongoing subscription unless we keep adding content (which we could as updates).

## Revenue Potential
Conservative: $300/month; Realistic: $1,000/month; Optimistic: $4,000/month. Many designers do mockups frequently. If we tap into even the Dribbble crowd who love fancy presentations, that’s a decent market. There are free resources, but paying for convenience inside Figma is appealing. Optimistic if it becomes a standard tool for agencies delivering polished outputs.

## Development Time
~5 days. We need a library of device frame images or SVGs (phones of various models, desktops, maybe perspective 3D styles). Could either bundle a set (ensure license to use these visuals) or generate simple ones (browser chrome drawn in vector, etc.). The plugin then takes the selected frame, scales it appropriately, and masks it into the device image. Possibly add background, reflection, drop shadow options. Technically layering an image over a frame or vice versa in Figma is straightforward (we can create a new frame with the composition). The user may need the final as an exported PNG, so provide export. Possibly allow custom device images uploaded by user. Complexity is moderate asset management.

## Technical Complexity
3/10 – The main challenge is maintaining quality and correct scaling. E.g., an iPhone X screen is a certain pixel size; we need to scale the design into the device overlay correctly. If resolution differences, ensure output isn’t blurry (maybe export at 2x). Figma can handle overlay images well. Possibly minor math to place for angled templates (Angle plugin uses perspective transforms which Figma can’t natively do except via distort which is tricky; maybe we stick to flat front-facing for simplicity, or provide multiple pre-angled images and just place flat design and skew it visually – not perfect without actual transform). Might just avoid heavy 3D transforms, focus on flat and pseudo-3D side-by-side or rotated views.

## Competition Level
Medium – There are some Figma community files and plugins for mockups (e.g., “Angle” plugin that places screens in 3D device shapes, which had free and paid aspects). Angle is popular for angled 3D device renders. Our approach can include flat and angled, but if Angle is established, we might differentiate with ease or more templates. Also people use external sites (smartmockups, etc.). But keeping in Figma is a plus. Competition means we should either be cheaper or have unique devices (maybe more updated models or customization).

## Key Features
- Device library: Variety of device frames (latest iPhones in different colors, Android phone, tablet, laptop, generic browser window). Also fun ones like watch or TV if needed. User selects which mockup style from a gallery in the plugin.
- Auto-fit and styling: The plugin places the selected design into the mockup at correct aspect ratio, adding common embellishments (glare effect, drop shadow around device, background color or gradient if none). Possibly allow minor adjustments (scale up/down if needed, choose background).
- Multiple device layouts: Ability to create a composition (like multiple devices in one frame) e.g. generate a phone and a laptop side by side with the design in each, for showcasing responsive design. Template for that would be pre-made. The plugin just injects the user’s mobile screen and desktop screen into the composite mockup layout.
- Export ready: After generation, allow one-click export of the mockup as PNG at high resolution (e.g. 3x for print or retina). Also keep the Figma frame so user can tweak or add text labels if needed.
- Custom imports (Pro): Perhaps let Pro users import their own device frame images (like a branded device frame or an older model not in library) and the plugin will fit designs into them similarly. This adds flexibility beyond our provided set.

## Success Indicators
Number of mockups generated (if users keep using it for every project, that’s great). The presence of our mockups in the wild (maybe we see a particular style of device frame being used widely, indicating our plugin’s output). Customer reviews like “This saved me from buying a Photoshop action or doing it manually.” Also, if after each Apple event we see an uptick because new device frames are in demand and we supply them quickly, that’s a niche success (timely updates driving sales).

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
