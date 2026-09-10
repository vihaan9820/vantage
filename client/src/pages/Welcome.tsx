import { ArrowRight, Check, Gem, Sparkles, UsersRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useSkillSwap } from "@/contexts/SkillSwapContext";
import { GlassFlow } from "@/components/GlassFlow";
import { PageSEO } from "@/components/PageSEO";

export default function Welcome() {
  const [, navigate] = useLocation();
  const { state, claimStarterReward, professionals } = useSkillSwap();
  const [claiming, setClaiming] = useState(false);
  const featured = professionals.slice(0, 3);
  const award = () => {
    if (claiming || state.starterRewardClaimed) return;
    setClaiming(true);
    window.setTimeout(() => { claimStarterReward(); setClaiming(false); }, 1200);
  };

  return <GlassFlow opacity={0.4} blur={80} speed="slow">
    <PageSEO
      title="Welcome to SkillSwap — Claim Your Starter Points"
      description="Activate your 20 free TimeBank Skill Points to experience peer-to-peer knowledge barter with verified mentors and creators."
      canonicalPath="/welcome"
    />
    <div className={claiming ? "welcome-page reward-in-flight" : "welcome-page"}>
    <section className="welcome-orbit">
      <div className="starter-grid" />
      <div className="starter-orb"><Gem size={40} /><span>20</span></div>
      <div className="starter-particle particle-one" /><div className="starter-particle particle-two" /><div className="starter-particle particle-three" />
    </section>
    <div className="starter-transfer" aria-hidden="true"><Gem size={22} /><i /><i /><i /></div>
    <section className="welcome-copy">
      {!state.starterRewardClaimed ? <>
        <p className="page-kicker"><Sparkles size={14} /> Welcome to SkillSwap</p>
        <h1>Your first skill is <em>already within reach.</em></h1>
        <p>Activate your one-time starter reward to experience the marketplace before you ever need to buy points.</p>
        <div className={claiming ? "starter-award receiving" : "starter-award"}>
          <span>Starter Reward</span><strong>+20 <small>Skill Points</small></strong>
          <p>{claiming ? "Moving points into your wallet…" : "Use them to start learning from another member."}</p>
        </div>
        <button className="primary-action large" onClick={award} disabled={claiming}>{claiming ? "Adding 20 points…" : "Activate 20 free points"} <ArrowRight size={17} /></button>
        <p className="subtle-note" aria-live="polite">{claiming ? "Starter points are being transferred." : "Awarded once per saved demo account. Starter points do not expire."}</p>
      </> : <>
        <p className="page-kicker"><Check size={14} /> Starter Reward complete</p>
        <h1>You can start learning <em>right now.</em></h1>
        <p>Your free points are waiting in your wallet. Meet a professional, ask a question, then book when the fit feels right.</p>
        <div className="starter-award claimed"><span>Available balance</span><strong>{state.wallet} <small>Skill Points</small></strong><p>Starter Reward · +20 points</p></div>
        <div className="welcome-actions"><button className="primary-action large" onClick={() => navigate("/professionals")}>Explore professionals <UsersRound size={17} /></button><Link href="/messages" className="secondary-action">Meet teachers</Link></div>
      </>}
    </section>
    {state.starterRewardClaimed ? <section className="welcome-recommendations">
      <div><p className="page-kicker">Recommended for you</p><h2>Your 20-point starter reward opens a useful first conversation.</h2></div>
      <div className="mini-pro-grid">{featured.map((professional) => <Link href={`/professionals/${professional.id}`} key={professional.id} className="mini-pro"><span className="mini-avatar" style={{ background: professional.accent }}>{professional.avatar}</span><div><strong>{professional.name}</strong><small>{professional.primarySkill} · from {professional.price} pts</small></div><ArrowRight size={15} /></Link>)}</div>
    </section> : null}
  </div></GlassFlow>;
}
