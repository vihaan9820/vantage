import React, { useState } from "react";
import { accountInitials } from "@/contexts/AccountContext";

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  rounded?: "full" | "2xl" | "3xl";
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
};

export function isImageUrl(value?: string | null): boolean {
  if (!value) return false;
  const str = value.trim();
  return (
    str.startsWith("http://") ||
    str.startsWith("https://") ||
    str.startsWith("data:") ||
    str.startsWith("/") ||
    str.includes("googleusercontent.com") ||
    /\.(jpg|jpeg|png|webp|svg|gif|avif)(\?.*)?$/i.test(str)
  );
}

export function UserAvatar({
  src,
  name,
  size = "sm",
  className = "",
  rounded,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const isImage = isImageUrl(src) && !hasError;

  // Determine fallback initials safely without ever spilling raw URL strings
  let initials = "SS";
  if (name && name.trim()) {
    initials = accountInitials(name);
  } else if (src && !isImageUrl(src) && src.trim().length <= 4) {
    initials = src.trim().toUpperCase();
  }

  const defaultRounded =
    rounded || (size === "xl" ? "3xl" : size === "lg" ? "2xl" : "full");
  const roundedClass =
    defaultRounded === "3xl"
      ? "rounded-3xl"
      : defaultRounded === "2xl"
      ? "rounded-2xl"
      : "rounded-full";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none font-semibold transition-transform ${sizeClasses[size]} ${roundedClass} ${
        !isImage
          ? "bg-[#181a24] text-zinc-200 border border-white/10 shadow-sm"
          : "border border-white/10 shadow-sm bg-white/5"
      } ${className}`}
      aria-label={name || "User Avatar"}
      role="img"
    >
      {isImage ? (
        <img
          src={src!}
          alt={name || "User avatar"}
          className="w-full h-full object-cover rounded-[inherit] pointer-events-none"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="leading-none font-semibold uppercase tracking-wider text-zinc-200">
          {initials}
        </span>
      )}

      {/* Subtle top specular border */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none border-t border-white/15" />
    </div>
  );
}

export default UserAvatar;
