'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface MinecraftGameProps {
  isSnakePlaying: boolean;
}

const MinecraftGame: React.FC<MinecraftGameProps> = ({ isSnakePlaying }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start when Snake game starts
  useEffect(() => {
    if (isSnakePlaying) {
      setIsPlaying(true);
      setIsAutoPlaying(true);
    }
  }, [isSnakePlaying]);

  // Random input simulation for Minecraft
  const simulateRandomInputs = useCallback(() => {
    if (!iframeRef.current || !isAutoPlaying) return;

    const iframe = iframeRef.current;
    
    // Focus the iframe first
    iframe.focus();
    
    // Random arrow keys
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const randomKey = arrowKeys[Math.floor(Math.random() * arrowKeys.length)];
    
    // Random mouse movements
    const randomMouseX = Math.random() * 400; // Within iframe width
    const randomMouseY = Math.random() * 300; // Within iframe height
    
    // Create events with more comprehensive properties
    const keyDownEvent = new KeyboardEvent('keydown', {
      key: randomKey,
      code: randomKey,
      keyCode: randomKey === 'ArrowUp' ? 38 : randomKey === 'ArrowDown' ? 40 : 
               randomKey === 'ArrowLeft' ? 37 : 39,
      which: randomKey === 'ArrowUp' ? 38 : randomKey === 'ArrowDown' ? 40 : 
             randomKey === 'ArrowLeft' ? 37 : 39,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    const keyUpEvent = new KeyboardEvent('keyup', {
      key: randomKey,
      code: randomKey,
      keyCode: randomKey === 'ArrowUp' ? 38 : randomKey === 'ArrowDown' ? 40 : 
               randomKey === 'ArrowLeft' ? 37 : 39,
      which: randomKey === 'ArrowUp' ? 38 : randomKey === 'ArrowDown' ? 40 : 
             randomKey === 'ArrowLeft' ? 37 : 39,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    // Simulate mouse movement
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: randomMouseX,
      clientY: randomMouseY,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    // Send events to iframe
    try {
      // Try to access iframe content
      if (iframe.contentWindow && iframe.contentDocument) {
        iframe.contentWindow.focus();
        iframe.contentDocument.dispatchEvent(keyDownEvent);
        iframe.contentDocument.dispatchEvent(mouseMoveEvent);
        
        // Hold key for 200ms then release
        setTimeout(() => {
          iframe.contentDocument?.dispatchEvent(keyUpEvent);
        }, 200);
      } else {
        // Fallback: send events to the iframe element itself
        iframe.dispatchEvent(keyDownEvent);
        iframe.dispatchEvent(mouseMoveEvent);
        
        setTimeout(() => {
          iframe.dispatchEvent(keyUpEvent);
        }, 200);
      }
    } catch (error) {
      // If cross-origin restrictions prevent direct access, try alternative approach
      console.log('Cross-origin iframe access restricted, using fallback');
      
      // Fallback: simulate clicks and focus
      iframe.click();
      iframe.focus();
      
      // Try to send events to the parent window
      window.dispatchEvent(keyDownEvent);
      window.dispatchEvent(mouseMoveEvent);
      
      setTimeout(() => {
        window.dispatchEvent(keyUpEvent);
      }, 200);
    }
  }, [isAutoPlaying]);

  // Auto-play interval
  useEffect(() => {
    if (isAutoPlaying && isSnakePlaying) {
      autoPlayIntervalRef.current = setInterval(() => {
        simulateRandomInputs();
      }, 1000); // Execute every 1 second
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlaying, isSnakePlaying, simulateRandomInputs]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-120 z-50 bg-white rounded-lg shadow-2xl border-2 border-zus-green overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-zus-green text-white">
        <h3 className="text-sm font-bold">⛏️ Minecraft 1.8.8</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-2 py-1 text-xs rounded ${
              isAutoPlaying 
                ? 'bg-zus-orange text-white' 
                : 'bg-white text-zus-green'
            }`}
          >
            {isAutoPlaying ? '🤖 AUTO' : '🎮 MANUAL'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-zus-green-light text-lg font-bold"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="relative" style={{ width: '400px', height: '300px' }}>
        {/* Main iframe - try Classic Minecraft first as it's more iframe-friendly */}
        <iframe
          ref={iframeRef}
          src="https://classic.minecraft.net/"
          title="Minecraft Classic"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-b-lg"
          style={{ border: 'none' }}
        />
        
        {/* Debug overlay to ensure visibility */}
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          DEBUG: Minecraft Game
        </div>
        
        {/* Overlay for game controls */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded text-center">
              {isAutoPlaying ? '🤖 Auto-Playing' : isPlaying ? '🎮 Playing' : '⏸️ Paused'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinecraftGame;
