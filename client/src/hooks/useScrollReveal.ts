import { useEffect, useRef } from "react";
import { initPageScrollReveal, type ScrollRevealOptions } from "@/lib/scrollReveal";

/**
 * Hook to trigger the Studio tab's signature staggered entrance and scroll-reveal animation
 * on page components or the main application layout.
 */
export function useScrollReveal(triggerKey?: any, options?: ScrollRevealOptions) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Slight delay to ensure the new DOM nodes for the route have mounted and layout is computed
    const timer = setTimeout(() => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      cleanupRef.current = initPageScrollReveal(options);
    }, 30);

    return () => {
      clearTimeout(timer);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [triggerKey, options?.root]);
}
