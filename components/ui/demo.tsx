"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import BorderGlow from "@/components/ui/BorderGlow";
import GradualBlur from "@/components/ui/GradualBlur";
import Ferrofluid from "@/components/ui/Ferrofluid";
import SpecularButton from "@/components/ui/SpecularButton";
import RadialLiquid from "@/components/ui/radial-liquid";
import { cn } from "@/lib/utils";
import { useState } from "react";

const RANGES = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
];

export function SegmentedControlDemo() {
  const [range, setRange] = useState("day");

  return (
    <div className="flex w-full justify-center">
      <SegmentedControl
        label="Report range"
        options={RANGES}
        value={range}
        onValueChange={setRange}
      />
    </div>
  );
}

export function BorderGlowDemo() {
  return (
    <div className="flex w-full justify-center p-8">
      <BorderGlow
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#120F17"
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1.0}
        coneSpread={25}
        animated={false}
        colors={["#c084fc", "#f472b6", "#38bdf8"]}
      >
        <div style={{ padding: "2em" }}>
          <h2 className="text-xl font-bold text-white mb-2">Your Content Here</h2>
          <p className="text-sm text-zinc-400">Hover near the edges to see the glow.</p>
        </div>
      </BorderGlow>
    </div>
  );
}

export function GradualBlurDemo() {
  return (
    <section className="relative h-[500px] overflow-hidden rounded-2xl border border-white/10 bg-[#120F17]">
      <div className="h-full overflow-y-auto px-8 py-24 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white">Gradual Blur Scroll Reveal</h2>
        <p className="text-sm text-zinc-400">
          Scroll down to see the content smoothly feather and blur beneath the bottom and top gradient masks.
        </p>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-zinc-300">
            Card item #{i + 1} — Knowledge Barter Session with verified peer
          </div>
        ))}
      </div>

      <GradualBlur
        target="parent"
        position="bottom"
        height="6rem"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential={true}
        opacity={1}
      />
      <GradualBlur
        target="parent"
        position="top"
        height="4rem"
        strength={1.5}
        divCount={4}
        curve="bezier"
        opacity={1}
      />
    </section>
  );
}

export function FerrofluidDemo() {
  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }} className="rounded-2xl overflow-hidden border border-white/10">
      <Ferrofluid
        colors={["#ffffff", "#ffffff", "#ffffff"]}
        speed={0.5}
        scale={1}
        turbulence={1}
        fluidity={0.1}
        rimWidth={0.2}
        sharpness={3}
        shimmer={1}
        glow={2}
        flowDirection="down"
        opacity={1}
        mouseInteraction={true}
        mouseStrength={1}
        mouseRadius={0.3}
      />
    </div>
  );
}

export function SpecularButtonDemo() {
  return (
    <div className="flex w-full justify-center p-8 bg-[#09090B] rounded-2xl border border-white/10">
      <SpecularButton
        size="lg"
        radius={18}
        tint="#ffffff"
        tintOpacity={0}
        blur={0}
        textColor="#f5f5f5"
        lineColor="#ffffff"
        baseColor="#525252"
        intensity={1}
        shineSize={10}
        shineFade={40}
        thickness={1}
        speed={0.35}
        followMouse
        proximity={250}
        autoAnimate={false}
        onClick={() => console.log("clicked")}
      >
        Get Started
      </SpecularButton>
    </div>
  );
}

export function RadialLiquidDemo() {
  const [distortionType, setDistortionType] = useState<"plasma" | "satin" | "lava">("plasma");
  const [speed, setSpeed] = useState(0.7);

  return (
    <div className="w-full flex flex-col gap-4 p-4 rounded-2xl border border-white/10 bg-black">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Radial Liquid Waves</h3>
          <p className="text-xs text-zinc-400">WebGL shader waves with dynamic plasma distortion & cursor reaction</p>
        </div>
        <div className="flex items-center gap-2">
          {(["plasma", "satin", "lava"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDistortionType(type)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer",
                distortionType === type
                  ? "bg-white text-black border-white"
                  : "bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
        <RadialLiquid
          className="absolute inset-0"
          distortionType={distortionType}
          speed={speed}
          color1="#ffffff"
          color2="#3f3f46"
          color3="#18181b"
          backgroundColor="#000000"
          waveSize={4.5}
          refractionStrength={20.0}
          enableCursorInteraction={true}
        />
        <div className="relative z-10 text-center p-6 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 max-w-sm pointer-events-auto">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">React Bits Pro</p>
          <h4 className="text-xl font-bold text-white mb-2">SkillSwap Liquid Core</h4>
          <p className="text-xs text-zinc-300 mb-4">
            Interactive shader distortion reacting to mouse movement and velocity.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setSpeed((s) => (s >= 1.5 ? 0.3 : +(s + 0.3).toFixed(1)))}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold text-xs border border-white shadow-sm hover:bg-zinc-100 cursor-pointer"
            >
              Speed: {speed}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SegmentedControlDemo;
