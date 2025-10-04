/**
 * InfoTooltip Component - Hover/click popover with information
 */

'use client';

import React, { useState } from 'react';

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zus-gray text-white text-xs font-bold hover:bg-zus-blue transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        ?
      </button>
      {isVisible && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-zus-navy text-white text-sm rounded-md shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zus-navy"></div>
        </div>
      )}
    </div>
  );
}
