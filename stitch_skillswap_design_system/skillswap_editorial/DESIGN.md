---
name: SkillSwap Editorial
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c7c5d5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#918f9e'
  outline-variant: '#464553'
  surface-tint: '#c1c1ff'
  primary: '#c1c1ff'
  on-primary: '#1e1990'
  primary-container: '#8b8dff'
  on-primary-container: '#1e1b90'
  inverse-primary: '#4f51bf'
  secondary: '#b8c4ff'
  on-secondary: '#1a2b6a'
  secondary-container: '#334282'
  on-secondary-container: '#a2b1f9'
  tertiary: '#c5c7c8'
  on-tertiary: '#2e3132'
  tertiary-container: '#97999a'
  on-tertiary-container: '#2f3132'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1dfff'
  primary-fixed-dim: '#c1c1ff'
  on-primary-fixed: '#08006b'
  on-primary-fixed-variant: '#3737a6'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001354'
  on-secondary-fixed-variant: '#334282'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style
The design system is built upon a **Contemporary Dark** aesthetic, blending high-end editorial layouts with a sophisticated social platform feel. It targets a discerning audience of lifelong learners and mentors who value quality, human connection, and professional growth.

The visual direction avoids the high-energy "neon" tropes of tech dark modes in favor of a **Restrained Glassmorphism** approach. This style utilizes soft translucency, high-quality typography, and generous negative space to create an "art-directed" experience. The interface feels premium and tactile, evoking the sensation of flipping through a modern design magazine rather than navigating a traditional database-driven platform.

## Colors
The palette is centered on a foundation of **Deep Charcoal** (#0A0A0B) to provide a rich, sophisticated backdrop that allows content to breathe. 

- **Primary & Secondary:** Muted violets and soft indigos provide a calm, scholarly accent without being overly vibrant.
- **Warm White:** Used for primary text to reduce eye strain compared to pure white, maintaining a "paper-like" quality in a digital space.
- **Dusty Blue:** Utilized for secondary UI elements and metadata to keep the interface grounded.
- **Glass Surfaces:** Translucent layers should use a 60-80% opacity of the surface charcoal with a 12px to 20px backdrop blur.

## Typography
This design system employs a modern, high-contrast pairing to establish clear hierarchy. **Plus Jakarta Sans** provides a friendly yet geometric authority for headings, while **Inter** ensures maximum legibility for long-form skill descriptions and peer communication.

- **Editorial Headlines:** Use `display-lg` for hero sections with tight letter-spacing to mimic premium print layouts.
- **Body Text:** Use `body-lg` for primary content areas to maintain the premium feel. 
- **Accessibility:** Ensure a minimum contrast ratio of 4.5:1 for all body text against the dark backgrounds.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy with fixed maximum containers for readability. 

- **Grid:** A 12-column system is used for desktop, collapsing to 4 columns on mobile. 
- **Rhythm:** An 8px linear scale drives the vertical rhythm, but "Section Gaps" are intentionally large (80px+) to emphasize the editorial, premium nature of the content.
- **Negative Space:** Elements are given significant breathing room; avoid crowding editorial cards. Use the `section-gap` variable to separate distinct functional areas.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Restrained Glassmorphism** rather than traditional heavy shadows.

1.  **Level 0 (Base):** Deep Charcoal (#0A0A0B).
2.  **Level 1 (Cards/Surfaces):** Surface Charcoal (#1A1A1C) with a 1px subtle border (#FFFFFF10).
3.  **Level 2 (Overlays/Modals):** Glassmorphic panels with `backdrop-filter: blur(16px)` and a 1px "light-leak" top border to simulate physical thickness.

**Ambient Shadows:** Use extremely diffused shadows with 0% offset and high spread (e.g., `0 20px 40px rgba(0,0,0,0.4)`) to create a soft "lift" without creating harsh edges.

## Shapes
The shape language is consistently **Rounded**, striking a balance between approachable humanism and professional precision. 

- **Standard Elements:** Buttons and input fields use a `0.5rem` (8px) radius.
- **Large Components:** Editorial cards and modals use `rounded-lg` (16px) or `rounded-xl` (24px) to feel soft and modern.
- **Interactive States:** Use subtle scale transforms (e.g., `scale(1.02)`) on hover for cards to emphasize the tactile nature of the UI.

## Components
- **Editorial Cards:** These are the centerpiece. Use large imagery, `headline-md` for titles, and generous padding (32px). Backgrounds should be `surface_charcoal` with the subtle 1px border.
- **Buttons:** 
    - *Primary:* Solid `primary_color` with `tertiary_color` text.
    - *Secondary:* Glassmorphic background with a white border and 12px blur.
- **Inputs:** Darker than the surface level, using a 1px border that glows slightly with the `primary_color` on focus.
- **Chips/Labels:** Use the `label-sm` style with a low-opacity version of the primary or secondary color as a background.
- **Progress Indicators:** Use soft, thin lines with a subtle gradient (Indigo to Violet) to indicate skill mastery levels.
- **Avatars:** Always high-resolution, using a subtle outer glow to separate them from the dark background.