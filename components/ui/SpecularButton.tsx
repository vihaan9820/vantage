import React, { useRef, useEffect, type ReactNode } from "react";
import "./SpecularButton.css";

export interface SpecularButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
}

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  children,
  className = "",
  size = "lg",
  radius = 18,
  tint = "#ffffff",
  tintOpacity = 0,
  blur = 0,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#525252",
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  style,
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentAngleRef = useRef<number>(0);

  // Apply static CSS variables
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    el.style.setProperty("--specular-radius", `${radius}px`);
    el.style.setProperty("--specular-thickness", `${thickness}px`);
    el.style.setProperty("--specular-base-color", baseColor);
    el.style.setProperty("--specular-text-color", textColor);
    el.style.setProperty("--specular-line-color", lineColor);
    el.style.setProperty("--specular-tint", tint);
    el.style.setProperty("--specular-tint-opacity", `${tintOpacity}`);
    el.style.setProperty("--specular-blur", `${blur}px`);
    el.style.setProperty("--specular-intensity", `${intensity}`);
    el.style.setProperty("--specular-shine-size", `${shineSize}deg`);
    el.style.setProperty("--specular-shine-fade", `${shineFade}deg`);
  }, [
    radius,
    thickness,
    baseColor,
    textColor,
    lineColor,
    tint,
    tintOpacity,
    blur,
    intensity,
    shineSize,
    shineFade,
  ]);

  // Handle pointer tracking & auto-animation
  useEffect(() => {
    const el = buttonRef.current;
    if (!el || disabled) return;

    // Auto-animate loop
    if (autoAnimate) {
      el.style.setProperty("--specular-proximity", "1");
      let lastTime = performance.now();

      const animateLoop = (time: number) => {
        const delta = time - lastTime;
        lastTime = time;
        currentAngleRef.current =
          (currentAngleRef.current + speed * (delta / 16.67) * 2) % 360;
        el.style.setProperty(
          "--specular-angle",
          `${currentAngleRef.current.toFixed(2)}deg`
        );
        animFrameRef.current = requestAnimationFrame(animateLoop);
      };

      animFrameRef.current = requestAnimationFrame(animateLoop);
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }

    // Follow mouse mode
    if (followMouse) {
      const handlePointerMove = (e: PointerEvent) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist <= proximity) {
          const angleRad = Math.atan2(dy, dx);
          let angleDeg = (angleRad * 180) / Math.PI + 90;
          if (angleDeg < 0) angleDeg += 360;

          const prox = Math.max(0, 1 - dist / proximity);
          const relX = Math.min(
            Math.max(((e.clientX - rect.left) / rect.width) * 100, 0),
            100
          );
          const relY = Math.min(
            Math.max(((e.clientY - rect.top) / rect.height) * 100, 0),
            100
          );

          el.style.setProperty("--specular-angle", `${angleDeg.toFixed(1)}deg`);
          el.style.setProperty("--specular-proximity", prox.toFixed(3));
          el.style.setProperty("--specular-x", `${relX.toFixed(1)}%`);
          el.style.setProperty("--specular-y", `${relY.toFixed(1)}%`);
        } else {
          el.style.setProperty("--specular-proximity", "0");
        }
      };

      const handlePointerLeave = () => {
        if (!el) return;
        el.style.setProperty("--specular-proximity", "0");
      };

      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      document.addEventListener("mouseleave", handlePointerLeave);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("mouseleave", handlePointerLeave);
      };
    }
  }, [autoAnimate, followMouse, speed, proximity, disabled]);

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`specular-button specular-button--${size} ${className}`}
      style={style}
      {...rest}
    >
      <div className="specular-button-border" aria-hidden="true" />
      <div className="specular-button-surface" aria-hidden="true" />
      <span className="specular-button-content">{children}</span>
    </button>
  );
};

export default SpecularButton;
