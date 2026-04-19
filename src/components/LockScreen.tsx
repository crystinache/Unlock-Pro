import { useState, useEffect, useRef } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { Fingerprint, Camera, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ScreenType } from '../App';

interface LockScreenProps {
  onNavigate: (screen: ScreenType) => void;
  bgImage: string | null;
}

export default function LockScreen({ onNavigate, bgImage }: LockScreenProps) {
  const [time, setTime] = useState(new Date());
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCameraTap = (e: MouseEvent | TouchEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      onNavigate('menu');
    }
    lastTapRef.current = now;
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center">
      {bgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      
      {/* Clock and Date */}
      <div className="z-10 mt-20 flex flex-col items-center">
        <div className="text-7xl font-bold tracking-wider text-white">
          {format(time, 'HH:mm')}
        </div>
        <div className="text-lg font-medium text-white/90 mt-2 capitalize">
          {format(time, 'EEE dd MMMM', { locale: it })}
        </div>
      </div>

      {/* Invisible Grid Buttons */}
      <div className="z-10 flex-1 w-full flex flex-col justify-center items-center px-4">
        {/* Row 1: 3 buttons */}
        <div className="w-full h-32 flex">
          <div className="flex-1 h-full" onClick={() => onNavigate('pin4')} />
          <div className="flex-1 h-full" onClick={() => onNavigate('pin5')} />
          <div className="flex-1 h-full" onClick={() => onNavigate('pin6')} />
        </div>
        {/* Row 2: 2 buttons */}
        <div className="w-full h-32 flex mt-4">
          <div className="flex-1 h-full" onClick={() => onNavigate('password')} />
          <div className="flex-1 h-full" onClick={() => onNavigate('pattern')} />
        </div>
      </div>

      {/* Bottom Icons */}
      <div className="z-10 w-full px-8 pb-12 relative flex justify-between items-end h-40">
        <div className="p-3 rounded-full bg-black/20 backdrop-blur-sm">
          <Phone className="w-6 h-6 text-white" />
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 bottom-20">
          <div className="p-4 rounded-full bg-black/20 backdrop-blur-sm">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>
        </div>

        <div 
          className="p-3 rounded-full bg-black/20 backdrop-blur-sm cursor-pointer"
          onClick={handleCameraTap}
        >
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
