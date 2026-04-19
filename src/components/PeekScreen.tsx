import { useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { cn } from '../lib/utils';
import { FAMOUS_PEOPLE } from '../constants';

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

  const formatPin = (pin: string) => {
    return pin.match(/.{1,2}/g)?.join(' ') || pin;
  };

  const getFamousPerson = (pin: string) => {
    if (pin.length < 4) return null;
    const day = pin.substring(0, 2);
    const month = pin.substring(2, 4);
    const key = `${month}-${day}`;
    return FAMOUS_PEOPLE[key] || null;
  };

  const getZodiacAndAge = (pin: string) => {
    if (pin.length !== 4 && pin.length !== 6) return '- -';
    
    const day = parseInt(pin.substring(0, 2));
    const month = parseInt(pin.substring(2, 4));
    
    // Basic date validation
    if (isNaN(day) || isNaN(month) || month < 1 || month > 12 || day < 1 || day > 31) return '- -';
    
    // More specific day validation
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) return '- -';

    const zodiacSigns = [
      { name: 'Capricorno', start: { m: 12, d: 22 }, end: { m: 1, d: 19 } },
      { name: 'Acquario', start: { m: 1, d: 20 }, end: { m: 2, d: 18 } },
      { name: 'Pesci', start: { m: 2, d: 19 }, end: { m: 3, d: 20 } },
      { name: 'Ariete', start: { m: 3, d: 21 }, end: { m: 4, d: 19 } },
      { name: 'Toro', start: { m: 4, d: 20 }, end: { m: 5, d: 20 } },
      { name: 'Gemelli', start: { m: 5, d: 21 }, end: { m: 6, d: 20 } },
      { name: 'Cancro', start: { m: 6, d: 21 }, end: { m: 7, d: 22 } },
      { name: 'Leone', start: { m: 7, d: 23 }, end: { m: 8, d: 22 } },
      { name: 'Vergine', start: { m: 8, d: 23 }, end: { m: 9, d: 22 } },
      { name: 'Bilancia', start: { m: 9, d: 23 }, end: { m: 10, d: 22 } },
      { name: 'Scorpione', start: { m: 10, d: 23 }, end: { m: 11, d: 21 } },
      { name: 'Sagittario', start: { m: 11, d: 22 }, end: { m: 12, d: 21 } }
    ];

    let sign = '';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) sign = 'Capricorno';
    else {
      const found = zodiacSigns.find(s => 
        (month === s.start.m && day >= s.start.d) || 
        (month === s.end.m && day <= s.end.d)
      );
      sign = found ? found.name : '-';
    }

    let age = '-';
    if (pin.length === 6) {
      let year = parseInt(pin.substring(4, 6));
      if (!isNaN(year)) {
        // Assume 2000s if year <= 26 (current year is 2026), else 1900s
        const fullYear = year <= 26 ? 2000 + year : 1900 + year;
        
        // Current date: 2026-04-05
        const currentYear = 2026;
        const currentMonth = 4;
        const currentDay = 5;
        
        age = (currentYear - fullYear).toString();
        if (month > currentMonth || (month === currentMonth && day > currentDay)) {
          age = (currentYear - fullYear - 1).toString();
        }
      }
    }

    return `${sign} ${age}`;
  };

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
