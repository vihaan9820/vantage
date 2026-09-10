# Project TODO

## UI/UX Pro Max Guided Website Refinement

- [x] Generate a SkillSwap-specific design-system recommendation and inspect targeted React, accessibility, responsive, and interaction guidance from the imported UI/UX Pro Max skill.
- [x] Audit shared navigation, page shell, cards, forms, buttons, dialogs, mobile navigation, and key workspaces for high-impact issues without altering the product’s local workflows or approved theme design.
- [x] Apply focused, shared UI/UX improvements for visible focus, touch targets, form feedback, loading/action states, layout consistency, and reduced-motion support.
- [x] Validate improved light and dark experiences across primary routes and mobile/desktop breakpoints; run type, regression, and production-build checks.
- [x] Save one private checkpoint without publishing.

## Creative Design Template Package Import

- [x] Inspect the requested `claude-code-templates` package metadata and determine the artifact produced by `creative-design/ui-ux-pro-max`.
- [x] Review the package contents and any generated files for compatibility with the private React/Vite project before running an import.
- [x] Import only compatible UI/UX design resources, avoiding unreviewed executables, application behavior changes, and publishing.
- [x] Validate the private project after the import and save one private checkpoint.

## Localhost 5173 Development Preview

- [x] Inspect the current local development and HMR configuration before changing the preview port.
- [x] Configure the private development server to run on localhost port 5173 without publishing or changing application behavior.
- [x] Verify the local preview at `http://localhost:5173`, then save one private checkpoint without publishing.

## Full Interactive-Control Audit

- [x] Complete the remaining explicit control checks for public/account edge actions, onboarding, unvisited settings sections, and mobile-specific links; then finalize the saved audit report with only confirmed failures.

## Complete Functionality Repair

- [x] Extract every repair requirement from `pasted_content_6.txt` and map it to the audited control families without removing existing working flows.
- [x] Validate the private-feedback editor and Profile reviews destination without fabricating feedback content; feedback remains a user-authored private submission, with an explicit empty state until an account holder saves it.
- [x] Exercise the repaired Skills, Professionals, and People search tabs individually and record their visible results or empty state.
- [x] Open the repaired Community composer/moderation-ready workflow and Message report form; user-created posts and reports remain required before any persistent moderation record is created.
- [x] From the repaired Sessions workspace, open a session chat and confirm the correct selected-professional destination.
- [x] Add regression tests for the repaired control families and prevent regressions in existing marketplace, account, wallet, and chat behavior.
- [x] Validate repaired desktop and mobile flows, then save one private checkpoint without publishing.

## Light-Mode Visibility and Skill Points Simplification

- [x] Extract all requirements from `pasted_content_7.txt` and `pasted_content_8.txt`, preserving the explicit dark-mode lock and private prototype constraints.
- [x] Audit every light-only text, input, dropdown, modal, menu, navigation, card, chat, notification, and settings surface against the requested semantic contrast hierarchy.
- [x] Implement a dedicated light-mode-only text and interaction token layer using the requested hierarchy, without altering any dark-mode selector, visual, or behavior.
- [x] Simplify Skill Points terminology and visible explanations across the landing page, navigation, wallet, purchase, transfer, professional pricing, booking confirmation, and low-balance recovery flows.
- [x] Redesign the local Buy Points and payment confirmation journey with clear ₹ paid, Skill Points received, package value, masked payment methods, and post-purchase next steps.
- [x] Add tests and validate light-mode readability plus Skill Points journeys at desktop and mobile sizes; save one private checkpoint without publishing.

## Editorial Typography and Warm Light Palette Refinement

- [x] Inspect the supplied reference specification and current font/color architecture; record an implementation map that preserves all approved dark-mode colors and behavior.
- [x] Establish one global typography system: an editorial display serif for the wordmark and major headings, plus a readable modern sans-serif for UI and body content in both themes.
- [x] Apply the warm cream, charcoal, coral, sage, peach, soft-yellow, and warm-border palette exclusively within light-mode selectors, including existing light-only 3D/effect colors.
- [x] Preserve every existing layout, interaction, persistence workflow, animation movement, and dark-mode color, shadow, gradient, and 3D treatment.
- [x] Add regression coverage and validate typography plus light/dark appearance across public, account, workspace, menu, notification, modal, and responsive surfaces; save one private checkpoint without publishing.

## Context-Aware Chat Enhancement

- [x] Extract the complete intent, follow-up, booking, session, and no-fabrication requirements from `pasted_content_10.txt`.
- [x] Audit the selected-professional state, professional metadata, session availability, point balance, persisted conversations, and current reply matcher.
- [x] Define safe, professional-specific reply contracts for greetings, skills, experience, qualifications, beginner support, pricing, availability, session duration, portfolio, booking, rescheduling, and unknown information.
- [x] Implement typo-tolerant, context-aware intent recognition with short-follow-up and pronoun handling; persist only account-scoped local conversation state.
- [x] Connect supported booking and session actions to transparent local confirmations, low-balance recovery, and clearly stated prototype limitations without inventing reviews, qualifications, availability, or outcomes.
- [x] Add regression coverage for distinct intents, professional-specific replies, follow-ups, booking guidance, and no-fabrication fallbacks; validate the chat journeys in desktop and mobile views.
- [x] Save one private checkpoint without publishing.

- [x] Inspect the restored skills section and identify the minimal hover interaction points.
- [x] Add lightweight hover, focus, and selection feedback to skills-category controls.
- [x] Verify the skills interaction at desktop and mobile sizes.

## Preview WebSocket Reliability

- [x] Inspect the Vite server configuration and diagnose the failed HMR WebSocket connection from the user-provided console trace.
- [x] Configure Vite HMR for the managed preview proxy and restart the server.
- [x] Verify the preview loads with no Vite WebSocket console error.

## Starter Points, Professionals, and Chat Expansion

- [x] Extract the remaining continuation requirements and define data models for starter rewards, professionals, and conversations.
- [x] Re-establish persistent demo application state and routes without replacing the current landing experience.
- [x] Add a one-time 20-point starter reward, premium wallet-transfer animation, reward transaction, and welcome choice flow.
- [x] Add professional discovery, functional filters and sorting, profile cards, and detailed profile views.
- [x] Add a contextual learner–professional chat system accessible from expert cards and profiles.
- [x] Validate starter rewards, discovery, filters, profile actions, chat, and responsive controls.

## Final Interaction Coverage

- [x] Verify the professional skill, availability, verified-only, and sort controls in the live browser.
- [x] Implement a substantive qualification-details view that clearly explains the credential state and evidence context.
- [x] Re-verify profile save, qualification details, direct booking, and availability-slot booking after the final data cleanup.
- [x] Re-run desktop and mobile responsive checks after the final professional and chat refinements.

## Messages Route Regression

- [x] Reproduce and identify the maximum update-depth loop triggered by `/messages?pro=rahul`.
- [x] Stabilize the selected-professional synchronization so the route does not repeatedly update context state.
- [x] Add regression coverage and validate `/messages?pro=rahul` in the live browser without console errors.

## Final UI/UX, Account, and Product Enhancement

- [x] Extract and categorize all requirements from the final continuation attachment without removing existing features.
- [x] Audit the current route structure, shared state, reusable components, and existing authentication integration.
- [x] Add premium login, signup, account-type, and onboarding experiences with appropriate supported authentication behavior.
- [x] Expand navigation, menus, profile controls, dashboard, global search, settings, and account routes.
- [x] Scope SkillSwap wallet, starter reward, sessions, and saved state to the signed-in prototype account so each new account gets its own one-time 20-point starter reward.
- [x] Replace the remaining blocking insufficient-balance alert in professional discovery with non-blocking feedback consistent with the profile flow.
- [x] Complete all five onboarding steps for a fresh account and verify the post-onboarding starter-reward handoff.
- [x] Correct any remaining starter-reward copy that still refers to 10 points so every account entry surface consistently states 20 points.
- [x] Create a brand-new prototype account after the onboarding and copy fixes and re-run the complete flow: signup, all five onboarding steps, reward claim, wallet history, logout/login restore, successful booking, and insufficient-balance feedback.
- [x] Add real automated component-rendering coverage for the expanded product surface beyond account and economy helpers.
- [x] Exercise core expanded-page interactions in automated tests, including product search and saved-content tab selection.
- [x] Validate the remaining expanded routes in the live browser at desktop and mobile sizes: learn, teach, sessions, saved, matches, community, profile, help, about, search, and a skill detail.
- [x] Complete the final expanded-routes validation only after automated component-rendering coverage passes alongside browser evidence.

## Interim Validation

- [x] Confirm sign-up now renders as a standalone account experience without the authenticated app shell or floating discovery control.
- [x] Confirm required sign-up fields create local prototype account state and route into the five-step onboarding flow.
- [x] Confirm persisted local account state drives the dashboard greeting, account menu, and independently styled light-theme preference.
- [x] Review dashboard, discovery, settings, chat, professionals, and account layouts at desktop and mobile breakpoints; mobile retains purpose-built navigation and stacked content hierarchy.
- [x] Confirm a fresh account receives exactly one 20-point reward, records it in its own wallet, and restores that wallet after logout and local-prototype login.
- [x] Post-fix Sara account pass completed signup, all onboarding steps, 20-point claim, wallet-history check, logout/login restoration, and one successful six-point booking; low-balance toast remains the final assertion.
- [x] Sara’s post-fix wallet records the +20 starter reward and two held sessions (-6 and -8), leaving a six-point balance for the final seven-point low-balance feedback assertion.
- [x] Sara’s seven-point Rahul booking at a six-point balance remained on the directory and surfaced the expected non-blocking top-up toast.

## Theme, Readability, and Chat Intelligence Correction

- [x] Audit theme ownership, current light/dark contrast, chat intent behavior, contextual quick questions, and deep-route orientation controls.
- [x] Build a dedicated accessible light-mode system using neutral backgrounds, dark readable text, white separated surfaces, visible borders, and high-contrast purple actions.
- [x] Polish dark mode across cards, inputs, buttons, navigation, messages, and overlays without losing its premium cyan/violet character.
- [x] Confirm the final dark `/login` state with explicit `data-skillswap-theme="dark"` and template dark-class evidence, then verify readable account-access controls before restoring light.
- [x] Add professional-aware intent routing for beginner, price, availability, experience, qualifications, portfolio, teaching style, equipment, format, and fallback questions.
- [x] Add contextual quick questions, typing states, and action buttons for booking, availability, qualifications, and portfolio within chat.
- [x] Exercise the final Professionals directory’s visible Chat and Book buttons directly, recording their resulting selected-professional navigation or confirmation feedback.
- [x] Exercise one Wallet-route CTA directly and then record its result alongside the existing wallet breadcrumb and session-hold history evidence.
- [x] Add tests and validate light/dark themes, contextual chat outcomes, navigation, and responsive journeys before saving a private checkpoint.

## Correction Validation Notes

- [x] Fix and test the contextual chat matcher so plural beginner wording such as “Is this suitable for beginners?” receives the selected professional’s beginner-aware response rather than fallback clarification.
- [x] Confirm Maya’s equipment quick question moved through Delivered, “Maya is typing…”, and Read states before returning a photography-specific smartphone/camera response.
- [x] Confirm Maya’s price question returned the accurate 8-point Photography session cost and a visible “Book 60 min · 8 pts” action after the typing state.
- [x] Confirm the active Appearance toggle switches between a readable white-card light system and the premium dark chat system without losing messages, actions, or route context.
- [x] Confirm Rahul’s coding-experience quick question returns a distinct Python-first beginner pathway with no prior Python experience required.
- [x] Confirm Rahul’s credential reply exposes “View qualifications” and routes directly to `/professionals/rahul?tab=qualifications` with the Qualifications tab active.
- [x] Confirm the active light preference renders readable homepage hero/CTAs, sign-up forms, wallet transactions, notification drawer, discovery search/cards, and the streamlined More menu.
- [x] Confirm the final light-mode login provides high-contrast form fields, a prominent Log in action, accessible provider controls, account creation, and a clear return path.
- [x] Confirm final core-route hierarchy: Dashboard foregrounds Continue learning/Share a skill and focused quick actions; discovery provides filters and professional entry; profiles retain a Back breadcrumb; Messages opens the selected professional context; Wallet shows a held-session confirmation and transparent history; Settings exposes readable appearance controls.
- [x] Confirm the final Professionals actions: Aisha’s View profile opened the transparent detail page, Ask a question opened `/messages?pro=aisha`, and Book reserved a session with “Session reserved. Your points are held in the wallet.” feedback and a corresponding wallet entry.
- [x] Final route record — Dashboard: visible Continue learning/Share a skill and focused quick-action grid; Discover: Python search reduced the catalog to one clear result; Professionals: direct card View profile/Chat/Book reached detail, `/messages?pro=aisha`, and a held-session wallet record; Messages: selected Aisha context retained skill-specific quick questions; Wallet: Back breadcrumb, available balance, and held-session history remained transparent; Settings: Back breadcrumb and readable Dark/Light controls worked, with light restored afterward.
- [x] Final dark-login record — Email and password fields, eye control, Remember me, password reset, Log in, provider actions, create-account link, and Back to SkillSwap remained clearly legible against the dark account surface.
- [x] Final explicit-state record — the dark login inspection returned `data-skillswap-theme: "dark"` and a present template dark class; Settings then restored `data-skillswap-theme: "light"` before delivery.
- [x] Final interaction record — Dashboard’s Continue learning opened Discover; Discovery’s Python search narrowed the catalog; Professionals’ card actions opened Aisha’s profile, direct chat, and wallet-held booking; Messages’ beginner quick question completed Delivered → typing → Read with the repaired public-speaking reply; Wallet displayed its Back breadcrumb and session-hold transaction; Settings’ theme control switched dark and back to light.
- [x] Final wallet CTA record — the 10-point Demo top-up updated the private prototype balance from 4 to 14 points and added a completed +10 Purchased entry above the held-session history while retaining the Back breadcrumb.

## Source ZIP Export

- [ ] Create a complete private website source archive while excluding secrets, dependencies, build output, logs, caches, and local database artifacts.
- [ ] Inspect the archive contents and attach the ZIP to the user.
