import { useState, useRef, useEffect, useMemo } from 'react';
import type { TouchEvent, MouseEvent } from 'react';
import { Lock } from 'lucide-react';
import { cn, hapticFeedback } from '../lib/utils';

interface PatternScreenProps {
  onCancel: () => void;
  onAttempt: (pattern: number[]) => boolean;
  bgImage: string | null;
}

const INTERMEDIATES: Record<string, number> = {
  '0-2': 1, '2-0': 1,
  '3-5': 4, '5-3': 4,
  '6-8': 7, '8-6': 7,
  '0-6': 3, '6-0': 3,
  '1-7': 4, '7-1': 4,
  '2-8': 5, '8-2': 5,
  '0-8': 4, '8-0': 4,
  '2-6': 4, '6-2': 4,
};

export default function PatternScreen({ onCancel, onAttempt, bgImage }: PatternScreenProps) {
  const [path, setPath] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState(false);
  const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleStart = (e: MouseEvent | TouchEvent, index: number) => {
    if (error) return;
    hapticFeedback.tap();
    setIsDrawing(true);
    setPath([index]);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCurrentPos({ x: clientX, y: clientY });
  };

  const handleMove = (e: TouchEvent | MouseEvent) => {
    if (!isDrawing || error) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCurrentPos({ x: clientX, y: clientY });

    // Check if we are over a dot
    dotRefs.current.forEach((dot, index) => {
      if (!dot || path.includes(index)) return;
      
      const rect = dot.getBoundingClientRect();
      const hitRadius = rect.width * 0.8; // Larger hit area
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dist = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
      
      if (dist < hitRadius) {
        hapticFeedback.tap();
        const lastIndex = path[path.length - 1];
        const jumpKey = `${lastIndex}-${index}`;
        const intermediate = INTERMEDIATES[jumpKey];

        let newPath = [...path];
        if (intermediate !== undefined && !path.includes(intermediate)) {
          newPath.push(intermediate);
        }
        newPath.push(index);
        setPath(newPath);
      }
    });
  };

  const handleEnd = () => {
    if (!isDrawing || error) return;
    setIsDrawing(false);
    setCurrentPos(null);

    if (path.length > 0) {
      const isUnlocked = onAttempt(path);
      if (!isUnlocked) {
        setError(true);
        hapticFeedback.error();
        setTimeout(() => {
          setPath([]);
          setError(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    const handleGlobalEnd = () => handleEnd();
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDrawing, path, error]);

  const getDotCenter = (index: number) => {
    const dot = dotRefs.current[index];
    if (!dot || !containerRef.current) return { x: 0, y: 0 };
    const rect = dot.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  };

  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-end pb-24 touch-none"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {bgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center blur-md scale-110"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="absolute inset-0 z-0 bg-black/40" />

      <div className="z-10 flex flex-col items-center w-full max-w-sm px-6">
        <Lock className="w-6 h-6 text-white mb-6" />
        <div className="h-8 mb-8 text-white text-lg font-medium">
          {error ? 'Sequenza errata, riprova' : 'Disegna sequenza di sblocco'}
        </div>

        <div 
          ref={containerRef}
          className="grid grid-cols-3 gap-12 p-4 relative"
        >
          {/* SVG for lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
            {path.map((point, i) => {
              if (i === 0) return null;
              const start = getDotCenter(path[i - 1]);
              const end = getDotCenter(point);
              return (
                <line 
                  key={i}
                  x1={start.x} y1={start.y}
                  x2={end.x} y2={end.y}
                  stroke={error ? "#ef4444" : "white"}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}
            {isDrawing && path.length > 0 && currentPos && containerRef.current && (
              <line 
                x1={getDotCenter(path[path.length - 1]).x}
                y1={getDotCenter(path[path.length - 1]).y}
                x2={currentPos.x - containerRef.current.getBoundingClientRect().left}
                y2={currentPos.y - containerRef.current.getBoundingClientRect().top}
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeOpacity="0.5"
              />
            )}
          </svg>

          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              ref={el => dotRefs.current[i] = el}
              onMouseDown={(e) => handleStart(e, i)}
              onTouchStart={(e) => handleStart(e, i)}
              className="w-12 h-12 rounded-full flex items-center justify-center relative z-10"
            >
              <div 
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  path.includes(i) ? (error ? "bg-red-500 scale-150" : "bg-white scale-150") : "bg-white/40"
                )}
              />
            </div>
          ))}
        </div>

        <div className="w-full mt-10 px-4 flex justify-start">
          <button
            onClick={onCancel}
            className="text-white/80 text-lg font-medium active:text-white transition-colors uppercase"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}
