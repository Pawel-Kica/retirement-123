'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SnakeGame } from '@/components/ui/SnakeGame';

interface TimeInterval {
  id: string;
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
  status: 'work' | 'unemployment';
  color: string;
}

const TIMELINE_CONFIG = {
  START_YEAR: 2020,
  START_MONTH: 1, // January
  END_YEAR: 2080,
  END_MONTH: 12, // December
  TIMELINE_HEIGHT: 80,
  TIMELINE_WIDTH: 1200, // Increased width for 60 years
  MONTH_WIDTH: 1.67, // pixels per month (1200/720 months = 1.67px per month)
  INTERVAL_MIN_WIDTH: 20, // minimum width for intervals
};

const STATUS_COLORS = {
  work: '#00843D',
  unemployment: '#D32F2F',
};

export default function TimelinePage() {
  const [intervals, setIntervals] = useState<TimeInterval[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate total work time in months
  const totalWorkTimeMonths = intervals
    .filter(interval => interval.status === 'work')
    .reduce((total, interval) => {
      const startMonths = interval.startYear * 12 + interval.startMonth;
      const endMonths = interval.endYear * 12 + interval.endMonth;
      return total + (endMonths - startMonths);
    }, 0);

  // Convert to years and months for display
  const totalWorkYears = Math.floor(totalWorkTimeMonths / 12);
  const totalWorkMonths = totalWorkTimeMonths % 12;

  // Convert year and month to pixel position
  const yearMonthToPixel = useCallback((year: number, month: number) => {
    const startMonths = TIMELINE_CONFIG.START_YEAR * 12 + TIMELINE_CONFIG.START_MONTH;
    const endMonths = TIMELINE_CONFIG.END_YEAR * 12 + TIMELINE_CONFIG.END_MONTH;
    const totalMonths = endMonths - startMonths;
    
    const currentMonths = year * 12 + month;
    const relativeMonths = currentMonths - startMonths;
    
    return (relativeMonths / totalMonths) * TIMELINE_CONFIG.TIMELINE_WIDTH;
  }, []);

  // Convert year to pixel position (assumes January)
  const yearToPixel = useCallback((year: number) => {
    return yearMonthToPixel(year, 1);
  }, [yearMonthToPixel]);

  // Convert pixel position to year and month
  const pixelToYearMonth = useCallback((pixel: number) => {
    const startMonths = TIMELINE_CONFIG.START_YEAR * 12 + TIMELINE_CONFIG.START_MONTH;
    const endMonths = TIMELINE_CONFIG.END_YEAR * 12 + TIMELINE_CONFIG.END_MONTH;
    const totalMonths = endMonths - startMonths;
    
    const relativePixel = pixel / TIMELINE_CONFIG.TIMELINE_WIDTH;
    const totalMonthsFromStart = Math.round(relativePixel * totalMonths);
    const absoluteMonths = startMonths + totalMonthsFromStart;
    
    const year = Math.floor(absoluteMonths / 12);
    const month = (absoluteMonths % 12) || 12; // Handle December (month 0 becomes 12)
    
    return { year, month };
  }, []);

  // Check if a new interval would overlap with existing ones
  const checkOverlap = useCallback((startYear: number, startMonth: number, endYear: number, endMonth: number, excludeId?: string) => {
    return intervals.some(interval => {
      if (excludeId && interval.id === excludeId) return false;
      
      const newStartMonths = startYear * 12 + startMonth;
      const newEndMonths = endYear * 12 + endMonth;
      const existingStartMonths = interval.startYear * 12 + interval.startMonth;
      const existingEndMonths = interval.endYear * 12 + interval.endMonth;
      
      // Check if the new interval overlaps with existing interval
      return !(newEndMonths <= existingStartMonths || newStartMonths >= existingEndMonths);
    });
  }, [intervals]);

  // Handle mouse down on timeline
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== timelineRef.current) return;
    
    const rect = timelineRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const { year, month } = pixelToYearMonth(x);
    
    setIsSelecting(true);
    setSelectionStart(year);
    setSelectionEnd(year);
  }, [pixelToYearMonth]);

  // Handle mouse move during selection
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !timelineRef.current || selectionStart === null) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const { year, month } = pixelToYearMonth(x);
    
    setSelectionEnd(year);
  }, [isSelecting, selectionStart, pixelToYearMonth]);

  // Handle mouse up to finish selection
  const handleMouseUp = useCallback(() => {
    if (!isSelecting || selectionStart === null || selectionEnd === null) return;
    
    const startYear = Math.min(selectionStart, selectionEnd);
    const endYear = Math.max(selectionStart, selectionEnd);
    
    // Only create interval if it's wide enough (at least 1 month)
    if (endYear - startYear >= 0) {
      const newInterval: TimeInterval = {
        id: `interval_${Date.now()}`,
        startYear,
        startMonth: 1, // Default to January
        endYear,
        endMonth: 12, // Default to December
        status: 'work', // default to work
        color: STATUS_COLORS.work,
      };
      
      setIntervals(prev => [...prev, newInterval]);
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd]);

  // Handle interval click to select
  const handleIntervalClick = useCallback((intervalId: string) => {
    setSelectedInterval(selectedInterval === intervalId ? null : intervalId);
  }, [selectedInterval]);

  // Handle status change for selected interval
  const handleStatusChange = useCallback((status: 'work' | 'unemployment') => {
    if (!selectedInterval) return;
    
    setIntervals(prev => prev.map(interval => 
      interval.id === selectedInterval 
        ? { ...interval, status, color: STATUS_COLORS[status] }
        : interval
    ));
  }, [selectedInterval]);

  // Handle interval deletion
  const handleDeleteInterval = useCallback(() => {
    if (!selectedInterval) return;
    
    setIntervals(prev => prev.filter(interval => interval.id !== selectedInterval));
    setSelectedInterval(null);
  }, [selectedInterval]);

  // Handle mouse leave to stop selection
  const handleMouseLeave = useCallback(() => {
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, []);

  // Generate year labels - every 10 years to prevent overlapping
  const yearLabels = [];
  for (let year = TIMELINE_CONFIG.START_YEAR; year <= TIMELINE_CONFIG.END_YEAR; year += 10) {
    yearLabels.push({ year, month: 1 });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Subway Surfers Video - Full Height Above Nav */}
      <div className="fixed top-0 left-0 w-1/3 h-screen bg-black z-50 overflow-hidden" style={{ height: '100vh' }}>
        <div className="h-full w-full relative">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/eRXE8Aebp7s?autoplay=1&mute=0&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&start=0"
            title="Subway Surfers Gameplay"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              height: '100vh',
              width: '177.78vh', // 16:9 aspect ratio scaled to fill height
              minWidth: '100%',
              minHeight: '56.25vw' // 9:16 aspect ratio scaled to fill width
            }}
          />
        </div>
        {/* Overlay with game title */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg">
            <h3 className="text-lg font-bold">🎮 Subway Surfers</h3>
          </div>
        </div>
      </div>

      {/* Right Side - Timeline Content with left margin to avoid video overlap */}
      <div className="ml-[33.333333%] min-h-screen">
        <div className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1000px]">
            <h1 className="text-4xl font-bold text-zus-grey-900 mb-8 text-center">
              📅 Timeline Pracy i Bezrobocia
            </h1>

        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-zus-grey-900 mb-4">
              Wybierz okresy pracy i bezrobocia
            </h2>
            <p className="text-zus-grey-700 mb-6">
              Kliknij i przeciągnij na osi czasu, aby wybrać okres. Następnie określ czy to okres pracy czy bezrobocia.
            </p>

            {/* Timeline Container */}
            <div className="relative mb-6 overflow-x-auto">
              {/* Year labels */}
              <div className="relative mb-2" style={{ width: `${TIMELINE_CONFIG.TIMELINE_WIDTH}px` }}>
                {yearLabels.map(({ year, month }) => (
                  <div
                    key={year}
                    className="absolute text-xs text-zus-grey-600 font-medium"
                    style={{ 
                      left: `${yearMonthToPixel(year, month)}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>

              {/* Timeline axis */}
              <div
                ref={timelineRef}
                className="relative bg-zus-grey-100 rounded-lg cursor-crosshair select-none border-2 border-zus-grey-300"
                style={{ 
                  height: `${TIMELINE_CONFIG.TIMELINE_HEIGHT}px`,
                  width: `${TIMELINE_CONFIG.TIMELINE_WIDTH}px`
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {/* Timeline line - main axis */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-zus-grey-600 transform -translate-y-1/2 rounded" />
                
                {/* Timeline markers */}
                {yearLabels.map(({ year, month }) => (
                  <div
                    key={year}
                    className="absolute top-1/2 w-1 h-6 bg-zus-grey-600 transform -translate-y-1/2 rounded"
                    style={{ left: `${yearMonthToPixel(year, month)}px` }}
                  />
                ))}

                {/* Start and end markers */}
                <div className="absolute top-1/2 left-4 w-2 h-8 bg-zus-green transform -translate-y-1/2 rounded" />
                <div className="absolute top-1/2 right-4 w-2 h-8 bg-zus-green transform -translate-y-1/2 rounded" />
                
                {/* Start and end labels */}
                <div className="absolute top-1/2 left-2 transform -translate-y-1/2 -translate-x-1/2 text-xs font-bold text-zus-green">
                  {TIMELINE_CONFIG.START_YEAR}
                </div>
                <div className="absolute top-1/2 right-2 transform -translate-y-1/2 translate-x-1/2 text-xs font-bold text-zus-green">
                  {TIMELINE_CONFIG.END_YEAR}
                </div>

                {/* Current year indicator */}
                {(() => {
                  const currentYear = new Date().getFullYear();
                  if (currentYear >= TIMELINE_CONFIG.START_YEAR && currentYear <= TIMELINE_CONFIG.END_YEAR) {
                    return (
                      <>
                        <div 
                          className="absolute top-0 w-1 h-full bg-zus-orange transform -translate-x-1/2"
                          style={{ left: `${yearToPixel(currentYear)}px` }}
                        />
                        <div 
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-zus-orange bg-white px-2 py-1 rounded shadow"
                          style={{ left: `${yearToPixel(currentYear)}px` }}
                        >
                          {currentYear} (obecny)
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}

                {/* Existing intervals */}
                {intervals.map(interval => (
                  <div
                    key={interval.id}
                    className={`absolute top-4 h-10 rounded cursor-pointer transition-all hover:opacity-80 shadow-md ${
                      selectedInterval === interval.id ? 'ring-2 ring-zus-orange' : ''
                    }`}
                    style={{
                      left: `${yearToPixel(interval.startYear)}px`,
                      width: `${Math.max(yearToPixel(interval.endYear) - yearToPixel(interval.startYear), 20)}px`,
                      backgroundColor: interval.color,
                    }}
                    onClick={() => handleIntervalClick(interval.id)}
                  >
                    <div className="flex items-center justify-center h-full text-white text-xs font-semibold">
                      {interval.status === 'work' ? '💼 Praca' : '🚫 Bezrobocie'}
                    </div>
                  </div>
                ))}

                {/* Selection preview */}
                {isSelecting && selectionStart !== null && selectionEnd !== null && (
                  <div
                    className="absolute top-4 h-10 rounded border-2 border-dashed bg-zus-orange/50 border-zus-orange"
                    style={{
                      left: `${yearToPixel(Math.min(selectionStart, selectionEnd))}px`,
                      width: `${Math.max(yearToPixel(Math.max(selectionStart, selectionEnd)) - yearToPixel(Math.min(selectionStart, selectionEnd)), 20)}px`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-zus-grey-600 mb-6">
              💡 <strong>Instrukcja:</strong> Kliknij i przeciągnij na osi czasu, aby wybrać okres. 
              Okresy nie mogą się nakładać - wybór zostanie automatycznie ograniczony. 
              Następnie kliknij na wybrany okres, aby określić czy to praca czy bezrobocie.
            </div>

            {/* Selected interval controls */}
            {selectedInterval && (
              <Card className="mb-6 border-2 border-zus-orange">
                <div className="p-4">
                  <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
                    Edytuj wybrany okres
                  </h3>
                  <div className="flex gap-4 items-center">
                    <div>
                      <label className="block text-sm font-semibold text-zus-grey-700 mb-2">
                        Status:
                      </label>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStatusChange('work')}
                          variant={intervals.find(i => i.id === selectedInterval)?.status === 'work' ? 'success' : 'secondary'}
                          size="sm"
                        >
                          💼 Praca
                        </Button>
                        <Button
                          onClick={() => handleStatusChange('unemployment')}
                          variant={intervals.find(i => i.id === selectedInterval)?.status === 'unemployment' ? 'secondary' : 'secondary'}
                          size="sm"
                        >
                          🚫 Bezrobocie
                        </Button>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Button
                        onClick={handleDeleteInterval}
                        variant="secondary"
                        size="sm"
                      >
                        🗑️ Usuń
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Summary */}
            <Card className="bg-zus-green-light border-2 border-zus-green">
              <div className="p-4">
                <h3 className="text-lg font-bold text-zus-grey-900 mb-3">
                  📊 Podsumowanie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Summary statistics */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zus-green">
                      {totalWorkYears}
                    </div>
                    <div className="text-sm text-zus-grey-700">
                      Lata pracy
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zus-error">
                      {intervals
                        .filter(i => i.status === 'unemployment')
                        .reduce((total, interval) => total + (interval.endYear - interval.startYear), 0)}
                    </div>
                    <div className="text-sm text-zus-grey-700">
                      Lata bezrobocia
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-zus-grey-900">
                      {intervals.length}
                    </div>
                    <div className="text-sm text-zus-grey-700">
                      Okresy łącznie
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => {
              setIntervals([]);
              setSelectedInterval(null);
            }}
            variant="secondary"
            size="lg"
          >
            🔄 Wyczyść wszystko
          </Button>
          <Button
            onClick={() => {
              // Export functionality could be added here
              console.log('Export timeline data:', intervals);
            }}
            variant="success"
            size="lg"
          >
            💾 Eksportuj dane
          </Button>
        </div>
          </div>
        </div>
      </div>
      
      {/* Auto Snake Game - Hidden from UI */}
      <SnakeGame isSnakePlaying={true} />
    </div>
  );
}
