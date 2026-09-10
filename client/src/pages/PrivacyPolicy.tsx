import { ArrowLeft, CheckCircle2, Lock, Shield, Sparkles, UserCheck } from "lucide-react";
import { Link } from "wouter";
import { PageSEO } from "@/components/PageSEO";
import { FerrofluidBackground } from "@/components/FerrofluidBackground";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white relative px-4 py-12 md:py-20 flex flex-col items-center">
      <PageSEO
        title="Privacy Policy — Vantage Data Protection Standards"
        description="Learn how Vantage protects your data, peer barter exchanges, TimeBank ledger transactions, and privacy with zero third-party selling."
        canonicalPath="/privacy"
      />
      <FerrofluidBackground opacity={0.18} />

      <div className="w-full max-w-3xl relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Vantage
        </Link>

        <div className="glass-panel p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border border-white/20 bg-black/85 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Shield size={20} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Official Privacy Policy</p>
              <h1 className="font-megiko font-morenn font-bold text-2xl md:text-3xl text-white tracking-tight">Data Protection & Privacy Standards</h1>
            </div>
          </div>
          <p className="text-sm text-zinc-300 mb-8 border-b border-white/10 pb-4">
            Last Updated: September 2026 · Effective across all Vantage workspaces and peer sessions.
          </p>

          <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
            {/* Core Commitments */}
            <section className="bg-white/5 border border-white/15 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-white" /> The Vantage Privacy Promise
              </h2>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Zero Third-Party Selling:</strong> We never sell, rent, monetize, or trade your personal data, chat transcripts, or contact details to third parties.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Peer-to-Peer Encryption:</strong> 1-on-1 audio and video barter sessions are established over encrypted WebRTC peer signaling.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white font-bold">•</span>
                  <span><strong>Transparent TimeBank Ledger:</strong> Your point credits, holdings, and release logs are private to your account and only shared with direct exchange partners.</span>
                </li>
              </ul>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. Information We Collect</h2>
              <p className="mb-2">To facilitate reciprocal knowledge barter and ensure fair TimeBank exchanges, we collect:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-300">
                <li><strong>Account Credentials:</strong> Name, verified email address, optional location, and stated languages.</li>
                <li><strong>Skill Profile Information:</strong> Skills you teach, skills you seek to learn, experience level, and portfolio showcase links.</li>
                <li><strong>Exchange Ledger Records:</strong> TimeBank point transfers, session reservations, held deposits, and completed swap acknowledgments.</li>
                <li><strong>Communication Logs:</strong> Chat messages exchanged with mentors/learners solely to coordinate session timing and topics.</li>
              </ul>
            </section>

            {/* 2. How Your Information Is Used */}
            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. How Your Information Is Used</h2>
              <p className="mb-2">Your information is used strictly to power platform functionality:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-300">
                <li>Matching you with compatible barter partners based on skills offered and requested.</li>
                <li>Securing TimeBank escrow credits until both parties complete their scheduled live room session.</li>
                <li>Preventing platform abuse, multi-account spamming, and maintaining identity trust signals.</li>
                <li>Delivering timely reminders for upcoming scheduled 1-on-1 live rooms.</li>
              </ul>
            </section>

            {/* 3. Security & Peer-to-Peer Signaling */}
            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. Security & Peer Communication</h2>
              <p>
                Vantage utilizes modern cryptographic standards to protect stored data and active sessions. Live video and audio rooms connect via peer-to-peer WebRTC protocols with DTLS/SRTP encryption. We do not secretly record, monitor, or archive live video session content without explicit on-screen consent from both participants.
              </p>
            </section>

            {/* 4. Your Rights & Data Portability */}
            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Your Data Rights & Deletion</h2>
              <p className="mb-2">You retain full authority over your data on Vantage:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-zinc-300">
                <li><strong>Right of Access & Export:</strong> You can review and export your full profile, skill listings, and wallet transaction history at any time.</li>
                <li><strong>Right to Erasure:</strong> You may request complete account and profile deletion through Settings. Upon confirmation, your profile and identity markers are permanently purged.</li>
                <li><strong>Data Portability:</strong> Export your verified karma scores and completed barter proofs for external portfolio verification.</li>
              </ul>
            </section>

            {/* 5. Contact & Inquiries */}
            <section className="border-t border-white/10 pt-6">
              <h2 className="text-lg font-bold text-white mb-2">5. Privacy Inquiries</h2>
              <p>
                For questions regarding this policy or to submit a data protection request, please contact our Data Protection Team at <span className="text-white font-mono">privacy@vantage.io</span>.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-400">© 2026 Vantage. Pure knowledge barter with zero cash fees.</p>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
            >
              Get Started (+20 Pts)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
