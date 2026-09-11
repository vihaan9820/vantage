import { ArrowLeft, ArrowRight, Check, CircleHelp, Mail, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { PageSEO } from "@/components/PageSEO";

type Article = { id: string; topic: string; title: string; body: string; example: string };
const articles: Article[] = [
  { id: "points-basics", topic: "Skill Points", title: "What are Skill Points?", body: "Skill Points (Swap Credits) are the currency used to book reciprocal learning sessions, reward peers, unlock specialized skill packs, and transfer knowledge credits.", example: "A 1-hour session automatically escrows the agreed points until both parties confirm completion in their sessions hub." },
  { id: "points-earn", topic: "Skill Points", title: "How do I earn points?", body: "The platform records starter rewards, referral rewards, purchase receipts, transfers, and session holds in one transaction history.", example: "Invite peers through your referral link to earn bonus credits directly in your Wallet." },
  { id: "points-buy", topic: "Payments", title: "How do I buy points?", body: "Open your Wallet, choose your desired points tier, and complete payment via Direct UPI QR code or bank transfer with verified UTR settlement.", example: "Scan the on-screen UPI QR code in your payment app (Google Pay, PhonePe, Paytm) and submit your 12-digit UTR reference." },
  { id: "points-transfer", topic: "Skill Points", title: "How do I transfer points?", body: "Use Transfer Points in your Wallet. Enter the recipient's name or handle and a valid amount within your available balance to instantly transfer credits.", example: "Transfer 10 credits to a peer mentor after a collaborative build session." },
  { id: "booking", topic: "Booking", title: "What happens when I book a session?", body: "Booking reserves your requested time slot, holds the session credits in TimeBank escrow, and creates a private 1-on-1 collaborative workspace with messaging and video room links.", example: "Book a listed session from any mentor profile after checking their live calendar." },
  { id: "messaging", topic: "Messaging", title: "How do conversations work?", body: "Direct messaging allows you to propose skill trades, ask preliminary questions, share files, and coordinate scheduling with mentors and peers in real time.", example: "Message a mentor to discuss specific learning objectives before locking in a session." },
  { id: "safety", topic: "Safety", title: "How can I manage safety in conversations?", body: "Comprehensive safety tools allow you to mute notifications, report spam or policy violations, block disruptive users, and export conversation records.", example: "Use the three-dot conversation options to report any unverified claims or inappropriate conduct." },
  { id: "account", topic: "Account", title: "How do accounts and multi-device access work?", body: "Your profile, scheduled sessions, reputation score, and wallet ledger are linked to your secure account, accessible via email or OAuth with Google and GitHub.", example: "Sign in securely across desktop and mobile devices with synchronized sessions." },
];

export default function HelpRepair() {
  const [query, setQuery] = useState("");
  const [articleId, setArticleId] = useState<string | null>(null);
  const [helpful, setHelpful] = useState<"yes" | "no" | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const article = articles.find((item) => item.id === articleId) ?? null;
  const results = useMemo(
    () =>
      articles.filter((item) =>
        `${item.topic} ${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase().trim())
      ),
    [query]
  );
  const topics = Array.from(new Set(articles.map((item) => item.topic)));

  return (
    <div className="help-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <PageSEO
        title={article ? `${article.title} — Help Center` : "Help Center & FAQ"}
        description={
          article
            ? article.body
            : "Find guidance on SkillSwap barter matching, TimeBank credit transfers, video room consultations, and account safety."
        }
        canonicalPath="/help"
      />
      {/* Hero */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-between items-start gap-6">
        <div>
          <p className="page-kicker">HELP & SUPPORT CENTER</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            {article ? article.title : "How can we help you?"}
          </h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl">
            {article
              ? `Topic: ${article.topic}`
              : "Search articles, discover how the Gems transfer system functions, or submit a local support request."}
          </p>
        </div>

        {article ? (
          <button
            className="secondary-action text-xs"
            onClick={() => {
              setArticleId(null);
              setHelpful(null);
            }}
          >
            <ArrowLeft size={14} /> Back to All Articles
          </button>
        ) : (
          <div className="w-full max-w-xl flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-white/10">
            <Search size={18} className="text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help articles"
              className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
            />
          </div>
        )}
      </section>

      {article ? (
        <section className="glass-panel rounded-3xl p-8 md:p-12 flex flex-col gap-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider">{article.topic}</span>
            <h2 className="text-2xl font-bold text-white mt-1">{article.title}</h2>
          </div>

          <p className="text-base text-gray-300 leading-relaxed">{article.body}</p>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
            <CircleHelp size={20} className="text-white shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs text-white block mb-0.5">Example Walkthrough</strong>
              <p className="text-xs text-gray-400 m-0">{article.example}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Was this article helpful?</span>
              <button
                className={`secondary-action text-xs px-3 py-1.5 ${helpful === "yes" ? "bg-white text-black font-bold" : ""}`}
                style={helpful === "yes" ? { backgroundColor: "#FFFFFF", color: "#000000", WebkitTextFillColor: "#000000", border: "1px solid #FFFFFF" } : undefined}
                onClick={() => setHelpful("yes")}
              >
                <ThumbsUp size={13} style={helpful === "yes" ? { color: "#000000" } : undefined} />
                <span style={helpful === "yes" ? { color: "#000000", WebkitTextFillColor: "#000000", fontWeight: 900 } : undefined}>Yes</span>
              </button>
              <button
                className={`secondary-action text-xs px-3 py-1.5 ${helpful === "no" ? "bg-red-400/20 text-red-400" : ""}`}
                onClick={() => setHelpful("no")}
              >
                <ThumbsDown size={13} /> No
              </button>
            </div>

            <button className="secondary-action text-xs" onClick={() => setSupportOpen(true)}>
              <Mail size={13} /> Contact Support
            </button>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white transition-colors"
                onClick={() => setQuery(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item) => (
              <button
                key={item.id}
                className="glass-panel p-6 rounded-2xl flex flex-col justify-between text-left group hover:border-white/40 transition-all"
                onClick={() => {
                  setArticleId(item.id);
                  setHelpful(null);
                }}
              >
                <div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">
                    {item.topic}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.body}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-white font-semibold mt-4">
                  <span>Read Article</span>
                  <ArrowRight size={13} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Support Modal */}
      {supportOpen && (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close support request" onClick={() => setSupportOpen(false)}>
            ×
          </button>
          <p className="page-kicker">SUPPORT DESK</p>
          <h3 className="text-xl font-bold text-white">Contact Local Support</h3>
          {submitted ? (
            <div className="text-center py-6 flex flex-col items-center gap-2">
              <Check size={28} className="text-white" />
              <h4 className="text-base font-bold text-white">Support Request Logged</h4>
              <p className="text-xs text-gray-400">
                Your request has been recorded locally. We will review it shortly.
              </p>
              <button
                className="primary-action text-xs mt-3 bg-white text-black font-bold hover:bg-zinc-200"
                style={{ backgroundColor: "#FFFFFF", color: "#000000", WebkitTextFillColor: "#000000", border: "1px solid #FFFFFF" }}
                onClick={() => {
                  setSubmitted(false);
                  setSupportOpen(false);
                }}
              >
                <span style={{ color: "#000000", WebkitTextFillColor: "#000000", fontWeight: 900 }}>Close</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <textarea
                placeholder="Describe your issue or question in detail..."
                value={supportMessage}
                onChange={(event) => setSupportMessage(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none min-h-[120px]"
              />
              <button
                className="primary-action text-xs justify-center bg-white text-black font-bold hover:bg-zinc-200"
                style={{ backgroundColor: "#FFFFFF", color: "#000000", WebkitTextFillColor: "#000000", border: "1px solid #FFFFFF" }}
                disabled={!supportMessage.trim()}
                onClick={() => setSubmitted(true)}
              >
                <span style={{ color: "#000000", WebkitTextFillColor: "#000000", fontWeight: 900 }}>Submit Support Request</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
