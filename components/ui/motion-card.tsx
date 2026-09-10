"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

export interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

/**
 * High-performance interactive card powered by Motion (motion.dev).
 * Features spring tap feedback and subtle monochrome hover lift.
 */
export const MotionCard: React.FC<MotionCardProps> = ({
  children,
  className = "",
  glowOnHover = true,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.985, transition: { type: "spring", stiffness: 500, damping: 20 } }}
      className={`relative rounded-2xl bg-[#141417]/80 backdrop-blur-xl border border-white/10 transition-colors ${
        glowOnHover ? "hover:border-white/25 hover:shadow-[0_8px_30px_rgba(255,255,255,0.06)]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
