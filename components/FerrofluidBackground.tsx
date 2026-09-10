import React from "react";
import Ferrofluid, { type FerrofluidProps } from "@/components/ui/Ferrofluid";
import { useAccount } from "@/contexts/AccountContext";

export interface FerrofluidBackgroundProps extends Partial<FerrofluidProps> {
  className?: string;
}

export const FerrofluidBackground: React.FC<FerrofluidBackgroundProps> = ({
  className = "",
  colors = ["#FFFFFF", "#E4E4E7", "#A1A1AA", "#52525B"],
  speed = 0.35,
  scale = 1.25,
  turbulence = 0.85,
  fluidity = 0.12,
  rimWidth = 0.2,
  sharpness = 2.4,
  shimmer = 1.2,
  glow = 1.8,
  flowDirection = "down",
  opacity = 0.32,
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
      }}
      aria-hidden="true"
    >
      <Ferrofluid
        colors={colors}
        speed={speed}
        scale={scale}
        turbulence={turbulence}
        fluidity={fluidity}
        rimWidth={rimWidth}
        sharpness={sharpness}
        shimmer={shimmer}
        glow={glow}
        flowDirection={flowDirection}
        opacity={opacity}
        mouseInteraction={mouseInteraction}
        mouseStrength={mouseStrength}
        mouseRadius={mouseRadius}
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
