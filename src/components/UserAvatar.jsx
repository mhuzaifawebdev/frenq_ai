"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";

const UserAvatar = ({ user, size = 56 }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the image URL to prevent unnecessary re-computations
  const optimizedImageUrl = useMemo(() => {
    const rawUrl = user?.profilePicture || user?.picture;
    
    if (process.env.NODE_ENV === 'development') {
      console.log("UserAvatar: Processing image URL:", rawUrl);
    }
    
    if (!rawUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.log("UserAvatar: No URL provided");
      }
      return null;
    }
    
    // For Google profile images, ensure we're using the right size parameter
    if (rawUrl.includes('googleusercontent.com')) {
      // Remove any existing size parameters and add our own
      const baseUrl = rawUrl.split('=')[0];
      const optimizedUrl = `${baseUrl}=s${size * 2}-c`;
      if (process.env.NODE_ENV === 'development') {
        console.log("UserAvatar: Google URL optimized from", rawUrl, "to", optimizedUrl);
      }
      return optimizedUrl;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log("UserAvatar: Using original URL:", rawUrl);
    }
    return rawUrl;
  }, [user?.profilePicture, user?.picture, size]);

  // Reset error state when optimized URL changes
  useEffect(() => {
    if (optimizedImageUrl) {
      setImageError(false);
      setIsLoading(true);
    }
  }, [optimizedImageUrl]);

  const handleImageError = (e) => {
    console.error("Avatar image failed to load:", {
      src: e.target.src,
      originalUrl: optimizedImageUrl,
      error: e.type
    });
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    if (process.env.NODE_ENV === 'development') {
      console.log("Avatar image loaded successfully:", optimizedImageUrl);
    }
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log("UserAvatar: Render state:", {
      hasUser: !!user,
      userPicture: user?.picture,
      profilePicture: user?.profilePicture,
      optimizedUrl: optimizedImageUrl,
      imageError,
      isLoading
    });
  }

  // If no picture or image failed to load, show initials
  if (!optimizedImageUrl || imageError) {
    return (
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-gray-700/50"
        style={{ width: size, height: size }}
      >
        <span 
          className="font-bold text-white"
          style={{ fontSize: size * 0.4 }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
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
        src={optimizedImageUrl}
        alt={user?.name || user?.email || "User"}
        width={size}
        height={size}
        className={`rounded-full object-cover shadow-lg ring-2 ring-gray-700/50 transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority
        unoptimized // Bypass Next.js optimization for external images
      />
    </div>
  );
};

export default UserAvatar;
