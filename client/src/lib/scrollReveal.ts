/**
 * SkillSwap — Unified Scroll & Staggered Reveal Engine
 *
 * Applies the Studio tab's signature Anime.js entrance animation across all pages:
 * - Upper half (initial viewport): Staggered entrance animation immediately on page load / route transition.
 * - Lower half (below the fold): Starts entrance animation dynamically as the user scrolls into view.
 * - Ambient Floating (e.g. Gems balance badge): Continuous 3D hover/pulse animation.
 */
import { animateStaggerEntrance, animateFloating } from "./animations";

export interface ScrollRevealOptions {
  /** Root container to scan for animatable items (defaults to document.body or main) */
  root?: HTMLElement | null;
  /** Stagger delay in milliseconds (default: 35ms) */
  staggerDelay?: number;
  /** Initial Y translation distance in pixels (default: 20px) */
  translateY?: number;
  /** Viewport threshold fraction for lower-half detection (default: 0.82) */
  foldThreshold?: number;
}

/**
 * Identify top-level animatable cards and sections within a container,
 * avoiding duplicate transformations on nested child cards.
 */
export function getScrollRevealTargets(root: HTMLElement): HTMLElement[] {
  const candidateSelector = [
    ".scroll-rise",
    "[data-scroll-rise]",
    ".anime-hub-card",
    ".anime-dash-card",
    ".anime-discover-card",
    ".anime-message-card",
    ".anime-card",
    "[data-scroll-reveal]",
    ".glass-panel",
    ".gradient-border-card",
    ".content-panel",
    ".card-3d",
    ".stat-card",
    ".session-card",
    ".match-card",
    ".setting-card",
    "main > div > section",
    "main > div > .grid > div",
    "main > div > .grid > section",
    "main > div > .grid > article",
  ].join(", ");

  let all = Array.from(root.querySelectorAll<HTMLElement>(candidateSelector));

  // If no specific panel classes matched, fallback to semantic sections & articles
  if (all.length === 0) {
    all = Array.from(root.querySelectorAll<HTMLElement>("section, article")).filter(
      (el) => el.offsetHeight > 40
    );
  }

  const results: HTMLElement[] = [];

  for (const el of all) {
    // Skip elements that are completely invisible/collapsed or internal dropdowns/tooltips
    if (el.closest("[role='menu']") || el.closest("[role='tooltip']") || el.closest(".sonner-toast")) {
      continue;
    }

    // Skip nested candidates if their direct candidate ancestor is already being animated,
    // which prevents double-transform jitter.
    let parent = el.parentElement;
    let hasCandidateAncestor = false;
    while (parent && parent !== root) {
      if (all.includes(parent)) {
        hasCandidateAncestor = true;
        break;
      }
      parent = parent.parentElement;
    }

    if (!hasCandidateAncestor) {
      results.push(el);
    }
  }

  return results;
}

/**
 * Initialize viewport-aware staggered animations for a page:
 * - Upper-half elements animate immediately on load.
 * - Lower-half elements animate with a smooth rising entrance as the user scrolls down.
 */
export function initPageScrollReveal(options: ScrollRevealOptions = {}): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const root = options.root || document.querySelector("main") || document.body;
  if (!root) return () => {};

  // Check for reduced motion preference or test environment
  const isReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTestEnv =
    typeof process !== "undefined" &&
    (process.env.NODE_ENV === "test" || process.env.VITEST === "true");

  // Animate any designated floating badges (like Studio Gems card)
  const floatTargets = Array.from(
    root.querySelectorAll<HTMLElement>("[data-animate-float], .anime-float, .gem-orb-float")
  );
  if (!isReducedMotion && !isTestEnv) {
    floatTargets.forEach((target) => animateFloating(target));
  }

  const targets = getScrollRevealTargets(root);
  if (targets.length === 0) return () => {};

  // If reduced motion is requested or in test runner, ensure all elements are immediately visible
  if (isReducedMotion || isTestEnv || typeof IntersectionObserver === "undefined") {
    targets.forEach((el) => {
      el.classList.add("is-risen");
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return () => {};
  }

  const viewportHeight = window.innerHeight || 800;
  const foldThreshold = viewportHeight * (options.foldThreshold ?? 0.82);

  const upperTargets: HTMLElement[] = [];
  const lowerTargets: HTMLElement[] = [];

  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    // Elements whose top is within the upper visible portion animate right away
    if (rect.top < foldThreshold) {
      upperTargets.push(el);
    } else {
      lowerTargets.push(el);
    }
  });

  // 1. Upper half: Animate immediately on mount
  if (upperTargets.length > 0) {
    upperTargets.forEach((el, idx) => {
      if (el.classList.contains("scroll-rise") || el.hasAttribute("data-scroll-rise")) {
        setTimeout(() => {
          el.classList.add("is-risen");
        }, Math.min(idx * 40, 240));
      }
    });

    const nonScrollRiseUpper = upperTargets.filter(
      (el) => !el.classList.contains("scroll-rise") && !el.hasAttribute("data-scroll-rise")
    );
    if (nonScrollRiseUpper.length > 0) {
      animateStaggerEntrance(nonScrollRiseUpper, options.staggerDelay ?? 35, options.translateY ?? 18);
    }
  }

  // 2. Lower half: Set ready state and trigger smooth rise as user scrolls into view
  if (lowerTargets.length > 0) {
    lowerTargets.forEach((el) => {
      if (!el.classList.contains("scroll-rise") && !el.hasAttribute("data-scroll-rise")) {
        el.style.opacity = "0";
        el.style.transform = "translateY(28px) scale(0.98)";
        el.style.willChange = "opacity, transform";
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const newlyVisible: HTMLElement[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            newlyVisible.push(target);
            observer.unobserve(target);
          }
        });

        if (newlyVisible.length > 0) {
          // Sort items by vertical position to ensure natural top-down staggered sequence
          newlyVisible.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
          newlyVisible.forEach((el, idx) => {
            setTimeout(() => {
              el.classList.add("is-risen");
              if (!el.classList.contains("scroll-rise") && !el.hasAttribute("data-scroll-rise")) {
                animateStaggerEntrance([el], 0, 24);
              }
            }, idx * 50);
          });
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px", // Starts animation 40px before entering viewport
        threshold: 0.05,
      }
    );

    lowerTargets.forEach((el) => observer.observe(el));

    // Safety timeout: after 3.8s ensure all items are made visible
    const fallbackTimer = setTimeout(() => {
      lowerTargets.forEach((el) => {
        el.classList.add("is-risen");
        if (el.style.opacity === "0") {
          animateStaggerEntrance([el], 0, 16);
          observer.unobserve(el);
        }
      });
    }, 3800);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }

  return () => {};
}
