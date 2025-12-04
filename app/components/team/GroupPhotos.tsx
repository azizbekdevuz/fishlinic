"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Images, ChevronDown, ChevronUp } from "lucide-react";

type GroupPhoto = {
  src: string;
  alt: string;
};

const INITIAL_COUNT = 3;
const LOAD_MORE_COUNT = 10;

// Static list of group photos - update this with actual image names from groupPics folder
// You can also fetch this from an API endpoint if preferred
const GROUP_PHOTOS: GroupPhoto[] = [
  // Add your actual image filenames here, e.g.:
  // { src: "/groupPics/meeting1.jpg", alt: "Team meeting - Planning session" },
  // { src: "/groupPics/meeting2.jpg", alt: "Team meeting - Development phase" },
  // { src: "/groupPics/activity1.jpg", alt: "Team activity - Group photo" },
  // ... add more as needed
];

// Helper function to auto-discover images (optional - for development)
async function discoverGroupPhotos(): Promise<GroupPhoto[]> {
  // Try common naming patterns
  const patterns = [
    ...Array.from({ length: 20 }, (_, i) => `group-${i + 1}.jpg`),
    ...Array.from({ length: 20 }, (_, i) => `meeting-${i + 1}.jpg`),
    ...Array.from({ length: 20 }, (_, i) => `activity-${i + 1}.jpg`),
    ...Array.from({ length: 20 }, (_, i) => `photo-${i + 1}.jpg`),
    ...Array.from({ length: 20 }, (_, i) => `img-${i + 1}.jpg`),
  ];

  const discovered: GroupPhoto[] = [];
  
  // Test images in parallel batches
  const batchSize = 10;
  for (let i = 0; i < patterns.length; i += batchSize) {
    const batch = patterns.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((name) => {
        return new Promise<GroupPhoto | null>((resolve) => {
          const img = document.createElement('img');
          img.onload = () => {
            resolve({
              src: `/groupPics/${name}`,
              alt: `Team group photo - ${name.replace(/\.(jpg|jpeg|png|webp)$/i, '')}`
            });
          };
          img.onerror = () => resolve(null);
          img.src = `/groupPics/${name}`;
          // Timeout after 200ms
          setTimeout(() => resolve(null), 200);
        });
      })
    );
    
    discovered.push(...results.filter((r): r is GroupPhoto => r !== null));
  }
  
  return discovered;
}

export function GroupPhotos() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [images, setImages] = useState<GroupPhoto[]>(GROUP_PHOTOS);
  const [isLoading, setIsLoading] = useState(GROUP_PHOTOS.length === 0);

  // Auto-discover if no static images provided
  useEffect(() => {
    if (GROUP_PHOTOS.length === 0 && isLoading) {
      discoverGroupPhotos()
        .then((discovered) => {
          setImages(discovered);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [isLoading]);

  const visibleImages = useMemo(() => {
    return images.slice(0, visibleCount);
  }, [images, visibleCount]);

  const hasMore = visibleCount < images.length;
  const canShowLess = visibleCount > INITIAL_COUNT;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, images.length));
  }, [images.length]);

  const handleShowLess = useCallback(() => {
    setVisibleCount(INITIAL_COUNT);
    // Smooth scroll to top of section
    const section = document.getElementById("group-photos-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (isLoading) {
    return (
      <section id="group-photos-section" className="mb-16 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Images className="w-6 h-6" style={{ color: "rgb(var(--primary))" }} />
          <h2 
            className="text-2xl font-bold"
            style={{ color: "rgb(var(--text-primary))" }}
          >
            Team Memories
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div 
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "rgba(var(--primary), 0.3)", borderTopColor: "rgb(var(--primary))" }}
          />
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null; // Don't show section if no images
  }

  return (
    <section id="group-photos-section" className="mb-16 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Images className="w-6 h-6" style={{ color: "rgb(var(--primary))" }} />
        <h2 
          className="text-2xl font-bold"
          style={{ color: "rgb(var(--text-primary))" }}
        >
          Team Memories
        </h2>
        <span 
          className="text-sm px-3 py-1 rounded-full"
          style={{
            background: "rgba(var(--primary), 0.15)",
            color: "rgb(var(--primary))"
          }}
        >
          {images.length} photos
        </span>
      </div>

      <div className="group-photo-grid">
        {visibleImages.map((photo, index) => (
          <div
            key={photo.src}
            className="group-photo-item photo-reveal"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center"
              loading={index < INITIAL_COUNT ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Load More / Show Less Controls */}
      <div className="flex justify-center mt-8 gap-4">
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="btn btn-secondary flex items-center gap-2 group"
          >
            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-1" />
            <span>See More ({images.length - visibleCount} remaining)</span>
          </button>
        )}
        
        {canShowLess && (
          <button
            onClick={handleShowLess}
            className="btn btn-ghost flex items-center gap-2 group"
          >
            <ChevronUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-1" />
            <span>Show Less</span>
          </button>
        )}
      </div>
    </section>
  );
}

