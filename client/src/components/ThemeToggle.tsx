import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export interface ThemeToggleProps {
  className?: string;
  theme?: "light" | "dark";
  onToggle?: () => void;
  disabled?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  theme: controlledTheme,
  onToggle,
  disabled = false,
}) => {
  const context = useTheme();

  // If theme switching is disabled in the application and not in a controlled test, render nothing
  if (!context.switchable && controlledTheme === undefined && !onToggle) {
    return null;
  }

  const activeTheme = controlledTheme ?? context.theme;
  const isDark = activeTheme === "dark";
  const shouldReduceMotion = useReducedMotion();

  const handleToggle = () => {
    if (disabled) return;
    if (onToggle) {
      onToggle();
    } else {
      context.toggleTheme();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  const springConfig = shouldReduceMotion
    ? { duration: 0.1 }
    : { type: "spring" as const, stiffness: 400, damping: 30 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle light and dark theme"
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center w-16 h-8 rounded-full p-0.5 cursor-pointer select-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#C9AD7F] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none hover:brightness-105 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      style={{
        background: isDark
          ? "linear-gradient(90deg, #1C1C20, #09090B)"
          : "linear-gradient(90deg, #E4E4E7, #FFFFFF)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(0, 0, 0, 0.16)",
        boxShadow: isDark
          ? "inset 0 2px 4px rgba(0, 0, 0, 0.7), 0 0 12px rgba(255, 255, 255, 0.05)"
          : "inset 0 2px 4px rgba(0, 0, 0, 0.08), 0 0 10px rgba(0, 0, 0, 0.05)",
      }}
    >
      <motion.div
        className="relative w-7 h-7 rounded-full flex items-center justify-center shadow-md"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #FFFFFF 0%, #D4D4D8 100%)"
            : "linear-gradient(135deg, #FFFFFF 0%, #F4F4F5 100%)",
          boxShadow: isDark
            ? "0 0 12px 2px rgba(255, 255, 255, 0.35), 0 2px 4px rgba(0, 0, 0, 0.5)"
            : "0 0 10px 2px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        animate={{
          x: isDark ? 32 : 0,
        }}
        transition={springConfig}
        whileTap={disabled || shouldReduceMotion ? undefined : { scale: 0.94 }}
        whileHover={
          disabled || shouldReduceMotion
            ? undefined
            : {
                boxShadow: isDark
                  ? "0 0 16px 3px rgba(255, 255, 255, 0.5), 0 2px 6px rgba(0, 0, 0, 0.6)"
                  : "0 0 14px 3px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.15)",
              }
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -180, scale: 0.6 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 180, scale: 0.6 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center justify-center"
            >
              <Moon size={14} className="text-black fill-black" strokeWidth={2.4} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: 180, scale: 0.6 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, rotate: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, rotate: -180, scale: 0.6 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center justify-center"
            >
              <Sun size={15} className="text-black stroke-black" strokeWidth={2.4} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
