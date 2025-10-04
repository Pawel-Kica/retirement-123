"use client";

import { useState, useEffect, useRef } from "react";

interface VerticalCarouselProps {
  phrases: string[];
  interval?: number;
  className?: string;
}

export function VerticalCarousel({ 
  phrases, 
  interval = 3000,
  className = "" 
}: VerticalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length);
    }, interval);

    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  return (
    <div 
      className={`relative overflow-hidden align-top w-full`}
      style={{ 
        height: '93px',
        verticalAlign: 'top',
        display: 'inline-block',
        minWidth: 'max-content'
      }}
    >
      <div className="relative h-full">
        {phrases.map((phrase, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + phrases.length) % phrases.length;
          
          let translateY = '100%'; // Default: below viewport
          let opacity = 0; // Default: invisible
          
          if (isActive) {
            translateY = '0%'; // Active: visible
            opacity = 1;
          } else if (isPrev) {
            translateY = '-100%'; // Previous: above viewport
            opacity = 1;
          }
          
          return (
            <div
              key={index}
              ref={index === 0 ? measureRef : null}
              className={`absolute top-0 left-[50%] whitespace-nowrap transition-transform duration-700 ease-in-out ${className}`}
              style={{
                transform: `translateY(${translateY}) translateX(-50%)`,
                width: 'max-content',
                lineHeight: '1.3',
                opacity: opacity
              }}
            >
              {phrase}
            </div>
          );
        })}
      </div>
    </div>
  );
}

