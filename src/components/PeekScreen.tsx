import { useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { cn } from '../lib/utils';
import { formatPin, getFamousPerson, getZodiacAndAge } from '../lib/peek';

interface PeekScreenProps {
  peekValue: string | number[] | null;
  peekType: 'pin' | 'password' | 'pattern' | null;
  onReset: () => void;
  zodiacAndAgeEnabled: boolean;
  autoShowPeek: boolean;
  famousPersonEnabled: boolean;
  textColorPercent: number;
}

export default function PeekScreen({ 
  peekValue, 
  peekType, 
  onReset, 
  zodiacAndAgeEnabled, 
  autoShowPeek,
  famousPersonEnabled,
  textColorPercent
}: PeekScreenProps) {
  const [showPeek, setShowPeek] = useState(autoShowPeek);
  const [isHolding, setIsHolding] = useState(false);

  const handleInteractionStart = (e: MouseEvent | TouchEvent) => {
    if (autoShowPeek) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const screenHeight = window.innerHeight;
    const threshold = screenHeight * 0.75;

    if (clientY < threshold) {
      // Top 3/4: Hold to show
      setIsHolding(true);
    } else {
      // Bottom 1/4: Toggle
      setShowPeek(prev => !prev);
    }
  };

  const handleInteractionEnd = () => {
    if (autoShowPeek) return;
    setIsHolding(false);
  };

  const isVisible = autoShowPeek || showPeek || isHolding;

  const textColor = `rgb(${255 * (1 - textColorPercent / 100)}, ${255 * (1 - textColorPercent / 100)}, ${255 * (1 - textColorPercent / 100)})`;
  const resetColor = textColor;

  const renderPatternPeek = (pattern: number[]) => {
    return (
      <div className="flex flex-col items-end">
        <div className="relative w-48 h-48 bg-black/50 p-2 rounded-lg border border-white/10">
          <div className="grid grid-cols-3 gap-0 w-full h-full relative z-10">
            {Array.from({ length: 9 }).map((_, i) => {
              const orderIndex = pattern.indexOf(i);
              const isSelected = orderIndex !== -1;
              return (
                <div key={i} className="flex items-center justify-center w-full h-full">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      isSelected ? "bg-white text-black" : "bg-white/20"
                    )}
                    style={isSelected ? { backgroundColor: textColor } : {}}
                  >
                    {isSelected ? orderIndex + 1 : ''}
                  </div>
                </div>
              );
            })}
          </div>
          {/* SVG for lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100">
            {pattern.map((point, i) => {
              if (i === 0) return null;
              const prev = pattern[i - 1];
              
              const getCoords = (index: number) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                return {
                  x: 16.66 + col * 33.33,
                  y: 16.66 + row * 33.33
                };
              };

              const start = getCoords(prev);
              const end = getCoords(point);

              return (
                <line 
                  key={i}
                  x1={`${start.x}%`} 
                  y1={`${start.y}%`} 
                  x2={`${end.x}%`} 
                  y2={`${end.y}%`} 
                  stroke={textColor} 
                  strokeWidth="2"
                  strokeOpacity="0.5"
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="w-full h-full bg-black relative"
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      {isVisible && peekValue !== null && (
        <div className="absolute bottom-8 right-8 flex flex-col items-end">
          {peekType === 'pattern' && Array.isArray(peekValue) ? (
            renderPatternPeek(peekValue)
          ) : (
            <div className="flex flex-col items-end">
              <div 
                className="text-2xl font-mono tracking-wider mb-1"
                style={{ color: textColor }}
              >
                {peekType === 'pin' ? formatPin(peekValue as string) : (peekValue as string)}
              </div>
              {zodiacAndAgeEnabled && peekType === 'pin' && (
                <div 
                  className="text-2xl font-mono tracking-wider"
                  style={{ color: textColor }}
                >
                  {getZodiacAndAge(peekValue as string)}
                </div>
              )}
              {famousPersonEnabled && peekType === 'pin' && (
                <div 
                  className="text-2xl font-mono tracking-wider"
                  style={{ color: textColor }}
                >
                  {getFamousPerson(peekValue as string)}
                </div>
              )}
            </div>
          )}
          
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="text-sm uppercase tracking-widest mt-4 active:text-white transition-colors"
            style={{ color: resetColor }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
