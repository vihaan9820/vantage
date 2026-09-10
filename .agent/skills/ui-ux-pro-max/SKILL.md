---
name: ui-ux-pro-max
description: >-
  UI/UX Pro Max design system, micro-interactions, bento-grid layouts,
  glassmorphism, color hierarchy, and high-converting product interaction standards.
---

# UI/UX Pro Max — Design System & Engineering Guidelines

## Core Principles

1. **Modern Vibrant Bento-Grid Architecture**
   - High information clarity with structured grid hierarchy.
   - Distinct content hierarchy: Primary heroes, secondary stat widgets, interactive toolbars, and rich collection grids.
   - Asymmetric visual interest with intentional aspect ratios.

2. **Color Palette & Contrast Tokens**
   - **Primary (Electric Indigo)**: `#6366F1` & `#4F46E5` — Trust, connection, and primary calls to action.
   - **Accent / Reciprocity (Emerald Green)**: `#10B981` — Confirmed exchanges, positive credit balance, online indicators, verified badges.
   - **Highlight (Warm Amber)**: `#F59E0B` — Karma scores, ratings, active timer warnings, achievements.
   - **Background**: `#0B0F17` (Dark Mode deep slate) / `#F8FAFC` (Light Mode crisp slate).
   - **Surfaces**: `#141824` / `#1F2639` with frosted glassmorphism (`backdrop-filter: blur(20px)`).

3. **Lighting & Specular Depth**
   - Specular top highlight on cards: `border-top: 1px solid rgba(255, 255, 255, 0.18);`
   - Ambient background glow mesh using subtle blurred radial gradients (`.glow-orb-indigo`, `.glow-orb-emerald`).
   - Gradient borders on active elements with glow hover effects (`filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.45));`).

4. **Micro-Interactions & Animation (Anime.js / CSS)**
   - Spring physics on button taps (`transform: scale(0.97)` on active).
   - Staggered entrance animations on page load (`animateStaggerEntrance`).
   - Subtle floating ambient motion for key highlight orbs.
   - Clear focus indicators with accessible `:focus-visible` rings.

5. **Accessibility & Usability Standards**
   - Minimum tap target of 44px for touch interactive elements.
   - Clean semantic HTML (`<h1>` primary page heading, `<nav>`, `<main>`, `<article>`).
   - Screen-reader friendly aria tags (`aria-current`, `aria-expanded`, `aria-label`).
   - High contrast readability in both dark and light modes.
