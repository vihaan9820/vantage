# SkillSwap Route and State Map

| URL / query | Current destination | Required repaired state |
|---|---|---|
| `/dashboard` | Dashboard | Standard dashboard; supports `panel=referrals` for the referral workspace. |
| `/discover` | Skill catalog | Search, category, and skill-path entry. |
| `/search?q=` | Global search | Each tab filters the matching result set: skills, people/professionals, community, and sessions. |
| `/skills/:slug` | Skill detail | Uses shared saved-skill state; toggling persists. |
| `/saved?tab=skills` | Saved workspace | Saved skill cards with view/remove actions. |
| `/saved?tab=professionals` | Saved workspace | Shared saved-professional cards. |
| `/profile?edit=1` | Profile | Profile editing form. |
| `/profile?tab=overview|skills|qualifications|portfolio|accomplishments|reviews|sessions|learning|teaching` | Profile | Requested content section, backed by account-scoped local state. |
| `/professionals/:id?tab=qualifications|portfolio|availability` | Professional profile | Existing selected professional and requested profile tab. |
| `/messages?pro=:id` | Conversation | Selected professional conversation and its persistent safety/call state. |
| `/wallet` | Wallet | Shared balance, transfers, purchase flow, and transaction history. |
| `/community` | Community | Persistent local posts, comments, shares, and reports. |
| `/help` | Help Center | Searchable topics and article view. |
| `/settings` | Settings | Persistent preferences, payment methods, and security subflows. |

All generated navigation must resolve through this map to a route, state, and matching visible content.
