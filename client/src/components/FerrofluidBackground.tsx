import React from "react";
import Ferrofluid, { type FerrofluidProps } from "@/components/ui/Ferrofluid";
import { useAccount } from "@/contexts/AccountContext";
import { useTheme } from "@/contexts/ThemeContext";

export interface FerrofluidBackgroundProps extends Partial<FerrofluidProps> {
  className?: string;
  theme?: "light" | "dark";
}

export const FerrofluidBackground: React.FC<FerrofluidBackgroundProps> = ({
  className = "",
  colors,
  mode,
  theme: propTheme,
  speed = 0.35,
  scale = 1.25,
  turbulence = 0.85,
  fluidity = 0.12,
  rimWidth = 0.2,
  sharpness = 2.4,
  shimmer = 1.2,
  glow = 1.8,
  flowDirection = "down",
  opacity,
  mouseInteraction = true,
  mouseStrength = 1.2,
  mouseRadius = 0.35,
  mouseDampening = 0.12,
  pointerTarget = "window",
  dpr = 1.5,
  paused,
  ...restProps
}) => {
  let settings;
  try {
    const accountContext = useAccount();
    settings = accountContext?.settings;
  } catch {
    settings = undefined;
  }

  let currentTheme: "light" | "dark" = "dark";
  try {
    const themeContext = useTheme();
    currentTheme = themeContext?.theme ?? "dark";
  } catch {
    currentTheme = "dark";
  }

  const effectiveMode = propTheme ?? mode ?? currentTheme;
  const isLight = effectiveMode === "light";

  // Obsidian Dark Mode: True #000000 canvas with radiant, multi-tone Navy Blue ferrofluid ribbons
  const navyBluePalette = [
    "#020B1A", // Deepest midnight navy base
    "#071B3E", // Abyss navy ribbon
    "#0D2A5E", // Midnight navy body
    "#133E7C", // Rich royal navy
    "#1C56A3", // Sapphire navy glow
    "#2A72D0", // Luminous oceanic blue highlight
    "#4A93E8", // Electric navy shimmer crest
    "#80BAF8", // Radiant cyan-navy specular peak
  ];

  const resolvedColors = colors ?? navyBluePalette;
  const resolvedSpeed = speed ?? 0.32;
  const resolvedScale = scale;
  const resolvedTurbulence = turbulence ?? 0.85;
  const resolvedFluidity = fluidity ?? 0.12;
  const resolvedRimWidth = rimWidth ?? 0.20;
  const resolvedSharpness = sharpness ?? 2.4;
  const resolvedShimmer = shimmer ?? 1.2;
  const resolvedGlow = glow ?? 1.8;
  const resolvedFlowDirection = flowDirection;
  const resolvedOpacity = opacity ?? 0.40;
  const resolvedMouseInteraction = mouseInteraction;
  const resolvedMouseStrength = mouseStrength;
  const resolvedMouseRadius = mouseRadius;

  // Respect user preference for reduced motion or disabled 3D effects
  const isEffectsDisabled = settings?.effects3d === false || settings?.animation === "minimal";
  const shouldPause = paused ?? isEffectsDisabled;

  if (isEffectsDisabled) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        maxWidth: "100vw",
        zIndex: 0,
        pointerEvents: "none",
        background: "#000000",
      }}
      aria-hidden="true"
    >
      <Ferrofluid
        key="dark-navy"
        colors={resolvedColors}
        mode="dark"
        speed={resolvedSpeed}
        scale={resolvedScale}
        turbulence={resolvedTurbulence}
        fluidity={resolvedFluidity}
        rimWidth={resolvedRimWidth}
        sharpness={resolvedSharpness}
        shimmer={resolvedShimmer}
        glow={resolvedGlow}
        flowDirection={resolvedFlowDirection}
        opacity={resolvedOpacity}
        mouseInteraction={resolvedMouseInteraction}
        mouseStrength={resolvedMouseStrength}
        mouseRadius={resolvedMouseRadius}
        mouseDampening={mouseDampening}
        pointerTarget={pointerTarget}
        dpr={dpr}
        paused={shouldPause}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
        {...restProps}
      />
    </div>
  );
};

export default FerrofluidBackground;
