# Extracted Functional Repair Requirements

Source: `/home/ubuntu/upload/pasted_content_6.txt`.

## Governing constraints

- Repair the existing private SkillSwap prototype; preserve working features and visible controls.
- Replace placeholder notices with coherent, locally simulated workflows when real integrations are unavailable.
- Use one account-scoped, persistent local source of truth across routes and refreshes.
- Do not fabricate customer reviews, ratings, testimonials, session outcomes, or credentials. Use empty states and user-created local data where no legitimate data exists.
- Validate desktop, tablet, and mobile behavior; do not publish.

## Required repairs extracted through line 2000

1. Implement the `dashboard?panel=referrals` state with persistent referral code, copy/share flows, local reward/history and meaningful referral stats.
2. Make Profile read `tab` and support overview, skills, qualifications, portfolio, accomplishments, reviews, sessions, learning, and teaching. Implement locally persistent qualification, portfolio, and accomplishment workflows with empty states.
3. Implement reviews as an empty-state/user-generated local flow only; do not seed or display fabricated ratings, counts, or reviews.
4. Add one persistent `savedSkills` source of truth and wire Skill Detail, Saved, and Dashboard states to it.
5. Make all search tabs filter and render the correct result data, including locally persistent Community posts/comments and Sessions results; use useful empty states.
6. Replace Home Move Points with a validated, confirmed local skill-point transfer flow that updates wallet and transaction history.
7. Replace provider buttons with clear local authentication simulations and password recovery with a local reset flow. Never misrepresent an external provider or sent email.
8. Add simulated audio/video call interfaces; implement message overflow actions, mute/unmute, reporting, block/unblock, clear conversation, conversation search, and state persistence.
9. Implement local payment-method management and simulated point purchase confirmation that safely stores masked information and writes wallet transactions.
10. Replace security placeholders with local 2FA, login activity, active-session, sign-out-other-devices, recovery-email, and backup-code flows.
11. Make all settings controls persist actual local values; remove generic placeholder notices.
12. Implement local community comment/reply/share/report workflows. Do not create fabricated posts, comments, or other user-generated data during implementation or testing.
13. Implement searchable Help articles, article view, helpfulness and local support request workflows.
14. Audit URL/query handling; every generated tab/panel parameter must display its intended content. Document the map.
15. Add cross-page persistence tests for saved skills, wallet changes, chat/session/notification handoff, profile data, and community data, plus responsive validation.

## Final extracted requirements

16. Provide consistent reusable feedback, confirmation, error, and modal patterns; success feedback must follow genuine local state changes.
17. Remove required-feature placeholder notices identified by terms such as “prototype,” “future,” and “full platform” by replacing them with local workflows, not by deleting controls.
18. Build and retain an internal route/control checklist that covers buttons, links, cards, menus, tabs, forms, modal actions, and dropdown choices; trace each to an expected persistent outcome.
19. Re-run the original audit and the prescribed end-to-end journey after repairs, including onboarding, saved skills, professionals, profile tabs, contextual chat, booking, wallet, community, help, referrals, point transfer, refresh persistence, and readable theme switching.
20. Do not claim actual external authentication, payments, email, calls, or sharing. Their local simulated flows must be labelled accurately and remain private.
