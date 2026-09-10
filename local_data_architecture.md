# SkillSwap Local Data Architecture

The existing account-scoped `SkillSwapContext` storage key remains the single feature-data source of truth. `AccountContext` continues to own the selected local account and presentation preferences. No external provider, payment, email, or communication service is invoked.

| State family | Persistent owner | Consumers |
|---|---|---|
| Wallet, purchases, transfers, bookings, transactions | `SkillSwapState` | Wallet, dashboard, sessions, messages, notifications |
| Saved skills and professionals | `SkillSwapState` | Skill detail, Saved, dashboard |
| Referral code, history, rewards | `SkillSwapState` | Dashboard referral panel |
| Profile qualifications, portfolio, accomplishments | `SkillSwapState` | Profile tabs, professional discovery/search where relevant |
| Community posts, comments, replies, reactions, shares, reports | `SkillSwapState` | Community and global search |
| Conversation mute/block/clear state, reports, read state | `SkillSwapState` | Messages, notification drawer, Settings security/safety views |
| Payment methods and simulated purchase receipts | `SkillSwapState` | Settings and Wallet |
| Security setup, activity, backup codes, recovery details | `SkillSwapState` | Settings security |
| Help requests and helpfulness feedback | `SkillSwapState` | Help Center |

Every context mutator produces a new immutable state, writes it to the existing account-scoped local storage key, and exposes results to all routes after navigation and refresh. Empty collections render explanatory next-step states rather than fabricated user-generated content.
