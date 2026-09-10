/**
 * React hook wrapper for the Vantage / SkillSwap Spatial 3D Scroll Engine.
 */
import { useEffect, useRef } from "react";
import { initSpatial3DScroll, SpatialScrollOptions, SpatialScrollController } from "@/lib/spatialScrollEngine";

export function useSpatial3DScroll(options: SpatialScrollOptions = {}) {
  const controllerRef = useRef<SpatialScrollController | null>(null);

  useEffect(() => {
    // Gracefully handle server-side rendering or test suites where window is mock
    if (typeof window === "undefined") return;

    // Initialize the engine with slight delay to ensure child DOM elements are fully mounted
    const timer = setTimeout(() => {
      controllerRef.current = initSpatial3DScroll(options);
    }, 20);

    return () => {
      clearTimeout(timer);
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
    };
  }, [options.root, options.sectionSelector, options.enableVelocityResponse]);

  return controllerRef;
}
