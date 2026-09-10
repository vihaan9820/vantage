# SkillSwap Design Directions

## Approach 1

**Theme Name:** Knowledge Tectonics  
**Very Brief Intro:** A dark, editorial product environment where learning pathways move through a sculptural system of floating cards, polished planes, and luminous point tokens. It feels human and credible while making the exchange economy immediately visual.  
**Probability:** 0.07

## Approach 2

**Theme Name:** Campus Field Notes  
**Very Brief Intro:** A warm, paper-forward community marketplace influenced by annotated notebooks, colour-coded learning trails, and tactile photography. It would emphasise local, approachable mentorship over high-tech spectacle.  
**Probability:** 0.04

## Approach 3

**Theme Name:** Prism Commons  
**Very Brief Intro:** A bright, playful digital commons built from translucent prisms and modular skill tiles, with generous use of colour to distinguish disciplines. It would signal accessibility and momentum without becoming juvenile.  
**Probability:** 0.09

---

# Chosen Direction: Knowledge Tectonics

## Design Movement

**Neo-editorial product design with tactile 3D object study.** SkillSwap is framed as a living knowledge economy: crisp typography and intentional negative space are set against sculptural, three-dimensional skill objects and architectural card stacks.

## Core Principles

1. **Make the knowledge loop visible.** Every important moment should reinforce the teach → earn → learn cycle through motion, directional connectors, and point-token states.
2. **Use 3D as explanation, not decoration.** Tilted cards, orbiting tokens, stacked surfaces, and depth cues clarify value transfer, discovery, and trust.
3. **Remain reassuringly human.** Interfaces are conversational, legible, and never over-styled; warmth appears through restrained coral highlights, portraits, and clear learning goals.
4. **Prioritise controlled contrast.** The deep blue-black ground and warm paper surfaces create a premium stage for clear pricing, safety information, and high-intent actions.

## Color Philosophy

The signature **Signal Coral** (`#ff725e`) represents an invitation to exchange knowledge, not urgency or gamification. It is paired with **Midnight Ink** (`#0a101c`) for focus and depth, warm **Studio Paper** (`#f4f0e9`) for readable content zones, and **Point Blue** (`#7ec7ff`) for the internal points system. Light is used as a material: blue glows belong to point flows; coral belongs to human action.

## Layout Paradigm

The homepage is a **guided orbit** rather than a centered SaaS stack. The hero places a left-aligned narrative beside a right-hand 3D exchange system. Each subsequent section alternates between an off-axis editorial rail and an overlapping, spatially layered collection of information surfaces. The desktop grid is intentionally broken by a vertical route-marker and cards that overlap their parent section boundaries.

## Signature Elements

1. **The Skill Orbit:** A multi-layer 3D exchange device that routes coral teaching cards, blue point tokens, and paper learning cards around a central Spark.
2. **Route Markers:** Fine vertical rules paired with numbered, small-cap labels to lead a user through the exchange system.
3. **Tactile Planes:** Cards with sliced corners, offset shadows, and perspective transforms that read like objects on a studio table.

## Interaction Philosophy

Interactions should reward exploration with a physical response: cards rise on hover, filters feel like labelled shelf tabs, and skill chips settle into place. The website exposes real actions clearly—discover, offer a skill, propose a swap—without burying the core purpose under dashboard complexity.

## Animation

The Skill Orbit uses slow, continuous ambient motion with staggered 3D drift. Hover interactions use `transform` and `opacity` only, running between 160–260ms with a sharp ease-out. The cycle line should animate as a travelling blue pulse on first view only. Buttons receive a small press scale. All decorative motion is removed or frozen when reduced motion is enabled.

## Typography System

**Space Grotesk** carries display headlines and navigation: taut, engineered, confident. **DM Sans** carries body copy and UI metadata: open, friendly, highly legible. Headlines use tight tracking and oversized line breaks; labels use uppercase tracking; descriptions remain compact and direct.

## Brand Essence

**SkillSwap is the peer-powered learning economy for people who want their knowledge to take them somewhere new.**  
Personality adjectives: **inventive, generous, assured.**

## Brand Voice

Headlines are direct and kinetic; CTAs are specific and reciprocal; microcopy explains what happens next in plain language.

> “Turn what you know into what you want to learn.”

> “Offer a skill. Keep the points moving.”

## Wordmark & Logo

The mark is an offset pair of interlocking diamond paths: one coral and one blue, crossing to create a small paper-coloured aperture. It conveys reciprocal exchange and leaves a highly recognisable form even at favicon scale. The companion wordmark is a custom-feeling, wide Space Grotesk treatment with a compact diamond between “Skill” and “Swap.”

## Signature Brand Color

**Signal Coral — `#ff725e`**

## Style Decisions

- **Route markers are structural.** Every major section uses a numbered rail, connector, or pathway cue that makes the teach → earn → learn journey visible from top to bottom.
- **Signal Coral is intentional.** It is reserved for offering, committing, inviting, and unlocking; Point Blue is reserved for value flow and Skill Points.
- **Utility language remains reciprocal.** Calls to action should invite users to offer knowledge, move points, or unlock learning rather than using generic marketplace phrasing.

---

# Motion-First Rebuild: Aurora Kinetics

## Revised Visual Direction

The revised direction trades the original tactile studio-paper palette for an **obsidian, electric-cyan, ultraviolet, and acid-lime** environment. Text glows in proportion to importance: the strongest headlines emit soft cyan-white light, learning actions spark lime, and points travel as cyan trails. 3D is no longer a contained illustration treatment; it becomes the page’s environment through glass surfaces, chrome edges, orbit rails, atmospheric particles, and perspective shifts.

## Interaction Rule

Every clickable element emits a short local energy ring from the click point. Selected states lock into a more dimensional, illuminated form; hover states tilt toward the cursor zone and reveal a moving edge light. Ambient motion stays continuous but is layered at different speeds so the landing page feels active without becoming a single, noisy animation.
