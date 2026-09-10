/**
 * Vantage / SkillSwap — Spatial 3D Scroll Engine
 * 
 * Continuous, scroll-driven 3D composition with adaptive timeline metrics,
 * 3-state section choreography (entering, active, exiting), multi-plane holographic depth,
 * fluid momentum/velocity damping, and 100% deterministic reversibility.
 */

export interface SpatialScrollOptions {
  root?: HTMLElement | null;
  /** Section query selector (defaults to major sections & product panels) */
  sectionSelector?: string;
  /** Enable dynamic velocity pitch response (default: true) */
  enableVelocityResponse?: boolean;
}

export interface SpatialScrollController {
  update: () => void;
  destroy: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(min: number, max: number, value: number): number {
  const x = clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

export function initSpatial3DScroll(options: SpatialScrollOptions = {}): SpatialScrollController {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { update: () => {}, destroy: () => {} };
  }

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotionQuery.matches) {
    return { update: () => {}, destroy: () => {} };
  }

  const root = options.root || document.documentElement;
  const selector =
    options.sectionSelector ||
    "section, [data-spatial-section], main > section, .site-shell > main > section, .cycle-section, .discover-section, .matching-section, .points-section, .closing-section, .home-professionals";

  let rafId: number | null = null;
  let isRunning = true;
  let lastScrollY = window.scrollY;
  let lastTimestamp = performance.now();
  let currentVelocity = 0;
  let targetVelocity = 0;
  let isScrolling = false;
  let idleTimeout: ReturnType<typeof setTimeout> | null = null;

  // Track discovered sections and their sub-layers
  interface SectionTarget {
    element: HTMLElement;
    isFirst: boolean;
    bgLayers: HTMLElement[];
    midLayers: HTMLElement[];
    fgLayers: HTMLElement[];
  }

  let targets: SectionTarget[] = [];

  const scanTargets = () => {
    if (!isRunning) return;

    // Find all matching sections in the root container
    const rawElements = Array.from(
      (root === document.documentElement ? document : root).querySelectorAll<HTMLElement>(selector)
    );

    // Filter out nested sections so top-level sections control coordinate space
    const filtered = rawElements.filter((el) => {
      let parent = el.parentElement;
      while (parent && parent !== root && parent !== document.body) {
        if (rawElements.includes(parent)) return false;
        parent = parent.parentElement;
      }
      return true;
    });

    targets = filtered.map((section, index) => {
      section.classList.add("spatial-section-target");

      // Categorize internal layers for multi-plane depth
      const bg = Array.from(
        section.querySelectorAll<HTMLElement>(
          '.spatial-bg-layer, .stage-glow, .hero-spotlight, .stage-grid, .kinetic-particles, .closing-orbit, .orbit-ring, .starter-grid, [data-spatial="background"]'
        )
      );
      const mid = Array.from(
        section.querySelectorAll<HTMLElement>(
          '.spatial-mid-layer, .glass-panel, .border-glow-card, .cycle-detail, .discovery-panel, .category-column, .wallet-card, .plans-area, .home-professional-card, .mini-pro, .mentor-stage, .hero-stage, [data-spatial="midground"]'
        )
      );
      const fg = Array.from(
        section.querySelectorAll<HTMLElement>(
          '.spatial-fg-layer, h1, h2, .page-kicker, .eyebrow, .hero-actions, .floating-caption, .primary-action, [data-spatial="foreground"]'
        )
      );

      bg.forEach((el) => el.classList.add("spatial-bg-layer"));
      mid.forEach((el) => el.classList.add("spatial-mid-layer"));
      fg.forEach((el) => el.classList.add("spatial-fg-layer"));

      return {
        element: section,
        isFirst: index === 0,
        bgLayers: bg,
        midLayers: mid,
        fgLayers: fg,
      };
    });
  };

  scanTargets();

  // ResizeObserver automatically recalculates if layout heights change dynamically
  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined" && document.body) {
    resizeObserver = new ResizeObserver(() => {
      scanTargets();
      requestTick();
    });
    resizeObserver.observe(document.body);
  }

  // Animation calculation tick
  const render = (now: number) => {
    if (!isRunning) return;

    const dt = Math.max(1, Math.min(100, now - lastTimestamp));
    lastTimestamp = now;

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Fluid momentum / velocity response with exponential decay
    targetVelocity = (scrollDelta / dt) * 16.67;
    currentVelocity += (targetVelocity - currentVelocity) * 0.12;
    if (Math.abs(currentVelocity) < 0.005) currentVelocity = 0;

    const viewportHeight = window.innerHeight || 800;
    const windowWidth = window.innerWidth || 1200;

    // Responsive intensity scaling: mobile tones down 3D shifts to keep touch scrolling native
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    const intensityScale = isMobile ? 0.25 : isTablet ? 0.6 : 1.0;

    const velocityPitch = options.enableVelocityResponse !== false
      ? clamp(currentVelocity * 0.06 * intensityScale, -2.5, 2.5)
      : 0;

    // Evaluate each section against viewport metrics
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const el = target.element;
      const rect = el.getBoundingClientRect();

      // Completely off-screen cull to avoid unnecessary style recalculations
      if (rect.bottom < -viewportHeight * 0.5 || rect.top > viewportHeight * 1.5) {
        continue;
      }

      const top = rect.top;
      const height = rect.height || 400;

      // Calculate entering progress [0, 1]:
      // 0 = section top just touching bottom of viewport
      // 1 = section top in active focal zone (top <= viewportHeight * 0.4)
      let enterProgress = 1.0;
      if (!target.isFirst || currentScrollY > 20) {
        const enterStart = viewportHeight;
        const enterEnd = viewportHeight * 0.35;
        enterProgress = smoothstep(enterStart, enterEnd, top);
      }

      // Calculate exiting progress [0, 1]:
      // 0 = section top still comfortably on screen (top >= 0)
      // 1 = section top has scrolled past top of screen (top <= -height * 0.75)
      const exitStart = 0;
      const exitEnd = -Math.min(height * 0.8, viewportHeight * 0.7);
      const exitProgress = smoothstep(exitStart, exitEnd, top);

      // SECTION TRANSITION BEHAVIOR:
      // 1. ENTERING: translateZ negative (-110px), scale 0.94, opacity 0.35 -> 1.0, subtle pitch (+3.5deg)
      // 2. ACTIVE: translateZ 0px, scale 1.0, opacity 1.0, pitch 0deg
      // 3. EXITING: translateZ negative (-80px), scale 0.96, opacity 0.40, subtle pitch (-2.5deg), blur 2.5px
      let tz = 0;
      let scale = 1.0;
      let opacity = 1.0;
      let rotX = 0;
      let blurPx = 0;

      if (enterProgress < 1.0) {
        // Entering phase
        const enterFactor = 1 - enterProgress;
        tz = -110 * enterFactor * intensityScale;
        scale = 1.0 - 0.05 * enterFactor * intensityScale;
        opacity = 0.35 + 0.65 * enterProgress;
        rotX = 3.5 * enterFactor * intensityScale;
      } else if (exitProgress > 0) {
        // Exiting phase
        tz = -80 * exitProgress * intensityScale;
        scale = 1.0 - 0.04 * exitProgress * intensityScale;
        opacity = 1.0 - 0.55 * exitProgress;
        rotX = -2.5 * exitProgress * intensityScale;
        blurPx = isMobile ? 0 : 2.5 * exitProgress * intensityScale;
      }

      // Add velocity pitch momentum
      rotX += velocityPitch;

      // Apply hardware-accelerated 3D transform to section container
      el.style.transform = `translate3d(0, 0, ${tz.toFixed(1)}px) scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1) rotateX(${rotX.toFixed(2)}deg)`;
      el.style.opacity = `${opacity.toFixed(3)}`;
      el.style.filter = blurPx > 0.1 ? `blur(${blurPx.toFixed(1)}px)` : "none";

      // LAYERED 3D DEPTH & PARALLAX:
      // 1. Background layer: slower parallax movement + recessed depth (-60px)
      if (target.bgLayers.length > 0) {
        const bgParallaxY = (top - viewportHeight * 0.5) * 0.12 * intensityScale;
        for (let b = 0; b < target.bgLayers.length; b++) {
          target.bgLayers[b].style.transform = `translate3d(0, ${bgParallaxY.toFixed(1)}px, -60px) scale(1.04)`;
        }
      }

      // 2. Midground layer: subtle card tilt and physical presence
      if (target.midLayers.length > 0 && !isMobile) {
        const midZ = (tz * 0.4).toFixed(1);
        for (let m = 0; m < target.midLayers.length; m++) {
          target.midLayers[m].style.transform = `translate3d(0, 0, ${midZ}px)`;
        }
      }

      // 3. Foreground layer: floats forward (+18px to +24px), razor sharp text, no blur
      if (target.fgLayers.length > 0) {
        const fgZ = isMobile ? 0 : 20 * intensityScale;
        for (let f = 0; f < target.fgLayers.length; f++) {
          target.fgLayers[f].style.transform = `translate3d(0, 0, ${fgZ.toFixed(1)}px)`;
        }
      }
    }

    // Continue animation loop if user is scrolling or velocity has not yet settled
    if (isScrolling || Math.abs(currentVelocity) > 0.01) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  };

  const requestTick = () => {
    isScrolling = true;
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150);

    if (!rafId && isRunning) {
      rafId = requestAnimationFrame(render);
    }
  };

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    scanTargets();
    requestTick();
  }, { passive: true });

  // Initial trigger so sections in view settle immediately
  requestTick();

  return {
    update: () => {
      scanTargets();
      requestTick();
    },
    destroy: () => {
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (idleTimeout) clearTimeout(idleTimeout);
      window.removeEventListener("scroll", requestTick);
      if (resizeObserver) resizeObserver.disconnect();

      // Clean up inline styles on teardown
      targets.forEach((t) => {
        t.element.style.transform = "";
        t.element.style.opacity = "";
        t.element.style.filter = "";
        t.bgLayers.forEach((el) => { el.style.transform = ""; });
        t.midLayers.forEach((el) => { el.style.transform = ""; });
        t.fgLayers.forEach((el) => { el.style.transform = ""; });
      });
    },
  };
}
