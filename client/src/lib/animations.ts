import { animate, stagger } from "animejs";

/**
 * Animate staggered entrance for a group of elements
 */
export function animateStaggerEntrance(
  targets: any,
  delay = 50,
  translateY = 20
) {
  if (typeof window === "undefined" || !targets) return;
  try {
    return animate(targets, {
      opacity: [0, 1],
      translateY: [translateY, 0],
      scale: [0.96, 1],
      delay: stagger(delay),
      duration: 650,
      ease: "outCubic",
    });
  } catch (err) {
    console.warn("Anime.js entrance failed:", err);
  }
}

/**
 * Animate a continuous smooth floating 3D hover/pulse for hero badge or gem
 */
export function animateFloating(target: any) {
  if (!target || typeof window === "undefined") return null;
  try {
    return animate(target, {
      translateY: [-6, 6],
      duration: 2600,
      alternate: true,
      loop: true,
      ease: "inOutSine",
    });
  } catch (err) {
    // fallback
  }
}

/**
 * Count up animation for number metrics
 */
export function animateNumber(
  target: HTMLElement | null,
  startValue: number,
  endValue: number,
  duration = 800
) {
  if (!target || typeof window === "undefined") return;
  const counter = { val: startValue };
  try {
    return animate(counter, {
      val: endValue,
      duration,
      ease: "outExpo",
      onRender: () => {
        if (target) {
          target.textContent = Math.round(counter.val).toLocaleString();
        }
      },
    });
  } catch (err) {
    if (target) target.textContent = endValue.toLocaleString();
  }
}

/**
 * Smooth pop/pulse micro-interaction on button click
 */
export function animateButtonTap(target: any) {
  if (!target || typeof window === "undefined") return;
  try {
    return animate(target, {
      scale: [1, 0.94, 1],
      duration: 220,
      ease: "inOutQuad",
    });
  } catch (err) {
    // fallback
  }
}

/**
 * Subtle pulse glow sweep
 */
export function animateGlowPulse(target: any) {
  if (!target || typeof window === "undefined") return null;
  try {
    return animate(target, {
      opacity: [0.6, 1],
      duration: 1800,
      alternate: true,
      loop: true,
      ease: "inOutQuad",
    });
  } catch (err) {
    // fallback
  }
}
