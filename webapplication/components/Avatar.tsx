"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
  userId?: string;
  className?: string;
}

/**
 * Avatar component for displaying user profile images
 * Features:
 * - Displays profile image or initials fallback
 * - Circular frame with border
 * - Click navigation to profile
 * - Responsive sizing
 * - Loading states and error handling
 */
export function Avatar({
  imageUrl,
  name,
  size = "md",
  clickable = false,
  userId,
  className = "",
}: AvatarProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };

  // Handle click
  const handleClick = () => {
    if (clickable && userId) {
      router.push(`/profile/${userId}`);
    }
  };

  // Determine if we should show image or initials
  const showImage = imageUrl && !imageError;

  return (
    <div
      className={`
        relative rounded-full overflow-hidden flex items-center justify-center
        ${sizeClasses[size]}
        ${clickable ? "cursor-pointer hover:ring-2 hover:ring-amber-500 hover:ring-offset-2 transition-all" : ""}
        ${className}
      `}
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          handleClick();
        }
      }}
    >
      {showImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-200 animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={`${name}'s profile`}
            className={`
              h-full w-full object-cover
              ${imageLoading ? "opacity-0" : "opacity-100"}
              transition-opacity duration-300
            `}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
          {name ? getInitials(name) : <User className="h-1/2 w-1/2" />}
        </div>
      )}
    </div>
  );
}
