"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";

const UserAvatar = ({ user, size = 56 }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // urlStage: 0 = try optimized Google URL, 1 = fallback to original URL, 2 = show initials
  const [urlStage, setUrlStage] = useState(0);

  // Compute the raw URL and two-stage optimized URL
  const rawUrl = useMemo(() => {
    return user?.profilePicture || user?.picture || null;
  }, [user?.profilePicture, user?.picture]);

  const optimizedImageUrl = useMemo(() => {
    if (!rawUrl || typeof rawUrl !== "string") return null;

    // Basic URL validation
    try {
      new URL(rawUrl);
    } catch (urlError) {
      console.error("UserAvatar: Invalid URL format:", rawUrl, urlError);
      return null;
    }

    if (urlStage === 0 && rawUrl.includes("googleusercontent.com")) {
      // Stage 0: Try size-optimized Google CDN URL
      const baseUrl = rawUrl.split("=")[0];
      return `${baseUrl}=s${size * 2}-c`;
    }

    // Stage 1 or non-Google URL: use original URL
    return rawUrl;
  }, [rawUrl, size, urlStage]);

  // Reset error/stage state when the raw URL changes
  useEffect(() => {
    if (rawUrl) {
      setImageError(false);
      setIsLoading(true);
      setUrlStage(0);
    }
  }, [rawUrl]);

  const handleImageError = () => {
    if (urlStage === 0 && rawUrl?.includes("googleusercontent.com")) {
      setUrlStage(1);
      setIsLoading(true);
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };


  // If no picture or all URL stages exhausted, show initials
  if (!rawUrl || (imageError && urlStage >= 1)) {
    return (
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-gray-700/50"
        style={{ width: size, height: size }}
      >
        <span className="font-bold text-white" style={{ fontSize: size * 0.4 }}>
          {user?.name?.charAt(0)?.toUpperCase() ||
            user?.email?.charAt(0)?.toUpperCase() ||
            "U"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-700 rounded-full flex items-center justify-center animate-pulse"
          style={{ width: size, height: size }}
        >
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        key={`avatar-${optimizedImageUrl}-${urlStage}`}
        src={optimizedImageUrl}
        alt={user?.name || user?.email || "User"}
        width={size}
        height={size}
        className={`rounded-full object-cover shadow-lg ring-2 ring-gray-700/50 transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        referrerPolicy="no-referrer"
        priority
        unoptimized // Bypass Next.js optimization for external images
      />
    </div>
  );
};

export default UserAvatar;
