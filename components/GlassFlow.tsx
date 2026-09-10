import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface GlassFlowProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  colors?: string[];
  blur?: number;
  opacity?: number;
  speed?: "slow" | "medium" | "fast";
  interactive?: boolean;
  grain?: boolean;
}

export function GlassFlow({
  children,
  className = "",
  style,
  colors = ["#00f0ff", "#7000ff", "#c8ff40", "#0051ff"],
  blur = 60,
  opacity = 0.65,
  speed = "medium",
  interactive = true,
  grain = true,
}: GlassFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!interactive) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  const durationMap = {
    slow: "24s",
    medium: "14s",
    fast: "8s",
  };

  const animDuration = durationMap[speed] || "14s";

  return (
    <div
      ref={containerRef}
      className={`glass-flow-container ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      {/* Background Flowing Blobs */}
      <div
        className="glass-flow-blobs"
        style={{
          position: "absolute",
          inset: "-20%",
          width: "140%",
          height: "140%",
          opacity,
          pointerEvents: "none",
          filter: `blur(${blur}px)`,
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
        }}
      >
        {/* Blob 1 - Cyan primary flow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "15%",
            width: "55vw",
            height: "55vw",
            maxWidth: "600px",
            maxHeight: "600px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[0] || "#00f0ff"} 0%, rgba(0,240,255,0) 70%)`,
            animation: `glassFlowDrift1 ${animDuration} ease-in-out infinite alternate`,
          }}
        />

        {/* Blob 2 - Purple deep ambient flow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "10%",
            width: "60vw",
            height: "60vw",
            maxWidth: "650px",
            maxHeight: "650px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[1] || "#7000ff"} 0%, rgba(112,0,255,0) 70%)`,
            animation: `glassFlowDrift2 ${animDuration} ease-in-out infinite alternate-reverse`,
          }}
        />

        {/* Blob 3 - Lime accent kinetic flow */}
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            left: "30%",
            width: "45vw",
            height: "45vw",
            maxWidth: "500px",
            maxHeight: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors[2] || "#c8ff40"} 0%, rgba(200,255,64,0) 70%)`,
            animation: `glassFlowDrift3 ${animDuration} ease-in-out infinite alternate`,
          }}
        />

        {/* Interactive Mouse Follower Blob */}
        {interactive && (
          <div
            style={{
              position: "absolute",
              top: `${mousePos.y}%`,
              left: `${mousePos.x}%`,
              transform: "translate(-50%, -50%)",
              width: "35vw",
              height: "35vw",
              maxWidth: "400px",
              maxHeight: "400px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors[3] || "#0051ff"} 0%, rgba(0,81,255,0) 65%)`,
              transition: "top 0.4s cubic-bezier(0.1, 0.9, 0.2, 1), left 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)",
            }}
          />
        )}
      </div>

      {/* Glass Frosting Refraction & Border Shimmer */}
      <div
        className="glass-flow-frosted-overlay"
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: `blur(${Math.max(16, blur / 2.5)}px)`,
          WebkitBackdropFilter: `blur(${Math.max(16, blur / 2.5)}px)`,
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.15) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          pointerEvents: "none",
        }}
      />

      {/* Optional Noise / Specular Grain Texture */}
      {grain && (
        <div
          className="glass-flow-grain"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
            opacity: 0.35,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 1, height: "100%", width: "100%" }}>
        {children}
      </div>

      {/* Keyframe Styles */}
      <style>{`
        @keyframes glassFlowDrift1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.1); }
          100% { transform: translate(-40px, 80px) scale(0.95); }
        }
        @keyframes glassFlowDrift2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-70px, -50px) scale(1.15); }
          100% { transform: translate(50px, -30px) scale(0.9); }
        }
        @keyframes glassFlowDrift3 {
          0% { transform: translate(0px, 0px) scale(0.95); }
          50% { transform: translate(40px, -60px) scale(1.08); }
          100% { transform: translate(-50px, 30px) scale(1.02); }
        }
      `}</style>
    </div>
  );
}

export default GlassFlow;
