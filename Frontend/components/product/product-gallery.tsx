"use client";

import Image from "next/image";
import { useState } from "react";
import { ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Duplicate images to simulate multiple product shots
  const allImages =
    images.length > 1 ? images : [...images, ...images, ...images, ...images];

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main Image */}
        <div
          className="relative aspect-square bg-secondary overflow-hidden cursor-zoom-in group"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={allImages[selectedIndex] || "/placeholder.svg"}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute bottom-4 right-4 p-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5" />
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-20 h-20 flex-shrink-0 bg-secondary overflow-hidden transition-all ${
                selectedIndex === i
                  ? "ring-2 ring-foreground"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img || "/placeholder.svg"}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl w-full aspect-square">
            <Image
              src={allImages[selectedIndex] || "/placeholder.svg"}
              alt={`${productName} - Full size`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-background text-sm uppercase tracking-wider font-bold hover:text-primary transition-colors"
            aria-label="Close lightbox"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
