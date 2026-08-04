---
name: Afnan Editorial System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The design system is rooted in the philosophy of "The Modern Atelier." It targets a discerning audience that values slow-craft, intentionality, and the tactile nature of handmade goods. The emotional response should be one of quiet confidence, timelessness, and museum-grade quality.

The aesthetic follows a **Premium Editorial Minimalism** direction. It leverages high-contrast monochrome values to allow product photography—the "soul" of the brand—to provide the only color. By utilizing generous whitespace and a rhythmic vertical flow, the UI mimics the experience of flipping through a high-end art publication. Every interaction must feel deliberate, avoiding the frenetic energy of typical e-commerce in favor of a curated, boutique-like experience.

## Colors

The palette is strictly monochromatic to maintain a sophisticated, non-distracting environment. 

- **Primary (#000000):** Used for core branding, primary calls to action, and high-level headings. It represents the "ink" on the page.
- **Accent (#333333):** Reserved for secondary UI elements, such as utility icons or supporting labels, providing a softer alternative to pure black.
- **Surface (#F9F9F9):** Applied to secondary layout sections or card backgrounds to create subtle distinction without breaking the minimal flow.
- **Borders (#E5E5E5):** Used for hair-line dividers and structural boundaries, ensuring the layout feels organized but airy.

Color should never be used for functional states (like error or success) in a loud way; instead, use iconography and weight shifts to maintain the editorial integrity.

## Typography

Typography is the primary vehicle for the brand’s "Editorial" voice. This design system pairs the classical elegance of **EB Garamond** (as a high-quality alternative to Cormorant) with the technical precision of **Manrope**.

- **Serif (Headings):** Use EB Garamond for all storytelling elements, product names, and section titles. Italics should be used sparingly for emphasis or captions to enhance the "literary" feel.
- **Sans-Serif (UI/Body):** Use Manrope for functional text, product descriptions, and navigation. It provides a clean, modern counterpoint to the serif's traditional roots.
- **Labels:** The `label-caps` style is critical for small identifiers, prices, and navigation links. The 10% letter spacing ensures legibility even at small sizes while looking intentionally designed.

## Layout & Spacing

The layout philosophy is based on a **Fixed Grid with Fluid Margins**. Content is housed within a 1440px container, but significant "negative space" is built into the internal margins of components.

- **The Breath:** Sections are separated by a massive `section-gap` (120px) to prevent the user from feeling rushed.
- **The Column System:** Use a 12-column grid for desktop. For product listings, use asymmetrical layouts (e.g., a 2-column image next to a 1-column text block) to create a more organic, less "templated" look.
- **Mobile:** Transition to a 4-column grid with increased vertical padding. Product images should typically span the full width to emphasize craftsmanship details.

## Elevation & Depth

This design system eschews traditional shadows in favor of **Tonal Layers and Thin Outlines**. 

- **Flat Hierarchy:** Depth is communicated through the use of the Surface color (#F9F9F9) against the pure White background.
- **Hairline Dividers:** Use 1px borders in #E5E5E5 to separate sections or group related items. These lines should feel like "score marks" on fine paper.
- **Zero Shadow Policy:** No drop shadows are permitted. If an element needs to be "raised" (like a modal), use a solid 1px black border or a slight dimming of the background layer to create focus.

## Shapes

To maintain a sophisticated and architectural feel, the design system utilizes **Sharp (0px) roundedness**. 

All buttons, input fields, images, and cards must have crisp, 90-degree corners. This evokes the edges of a printed book or a framed photograph. Sharp corners project a sense of premium precision and avoid the "app-like" softness found in consumer tech products.

## Components

### Buttons
- **Primary:** Solid black background, white Manrope caps text. No radius.
- **Secondary:** Transparent background, 1px black border.
- **Text Link:** Manrope caps with a 1px underline that sits 4px below the text baseline.

### Input Fields
- Underline style only. A 1px border (#E5E5E5) on the bottom, which turns black (#000000) on focus. Labels should use the `label-caps` style above the field.

### Product Cards
- No borders or shadows. The image is the hero. The product name (EB Garamond) and price (Manrope) sit below the image with generous top padding.

### Chips & Tags
- Rectangular with 1px #E5E5E5 borders. Small `label-caps` text. Used for "In Stock" or material types (e.g., "CERAMIC").

### Lists & Navigation
- Navigation items should have generous horizontal spacing. Hover states are indicated by a simple opacity shift (from 100% to 60%) or a subtle italicization of the serif text.

### The "Artisanal" Detail
- Every product detail page should include a "Maker's Note" component—a boxed area with the Surface background (#F9F9F9) and a distinctive 1px divider, used to tell the story of the item's creation.