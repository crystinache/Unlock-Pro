import { useState, useEffect, useRef } from 'react';
import { Delete, Lock } from 'lucide-react';
import { cn, hapticFeedback } from '../lib/utils';

interface PinScreenProps {
  length: number;
  onCancel: () => void;
  onAttempt: (pin: string) => boolean;
  bgImage: string | null;
}

export default function PinScreen({ length, onCancel, onAttempt, bgImage }: PinScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    if (pin.length === length && !processingRef.current) {
      processingRef.current = true;
      const isUnlocked = onAttempt(pin);
      
      if (!isUnlocked) {
        setError(true);
        hapticFeedback.error();
        setTimeout(() => {
          setPin('');
          setError(false);
          processingRef.current = false;
        }, 1000);
      } else {
        // If unlocked, we don't reset processingRef because we are leaving the screen
      }
    }
  }, [pin, length, onAttempt]);

  const handlePress = (digit: string) => {
    if (pin.length < length && !error && !processingRef.current) {
      hapticFeedback.tap();
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !error && !processingRef.current) {
      hapticFeedback.tap();
      setPin(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-end pb-32">
      {bgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center blur-md scale-110"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="absolute inset-0 z-0 bg-black/40" />

      <div className="z-10 flex flex-col items-center w-full max-w-[280px] mb-8">
        <Lock className="w-6 h-6 text-white mb-4" />
        <div className="h-8 mb-6 text-white text-lg font-medium text-center">
          {error ? 'PIN errato, riprova' : 'Inserisci PIN'}
        </div>

        <div className="flex gap-3 mb-12 h-3">
          {Array.from({ length }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-3 h-3 rounded-full border-2 border-white transition-all duration-200",
                i < pin.length ? "bg-white" : "bg-transparent",
                error && "border-red-500 bg-red-500"
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-light text-white active:bg-white/30 transition-colors mx-auto"
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={onCancel}
            className="w-16 h-16 flex items-center justify-center text-sm font-medium text-white active:text-white/50 transition-colors mx-auto"
          >
            Annulla
          </button>
          
          <button
            onClick={() => handlePress('0')}
            className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-light text-white active:bg-white/30 transition-colors mx-auto"
          >
            0
          </button>
          
          <button
            onClick={handleDelete}
            className="w-16 h-16 flex items-center justify-center text-white active:text-white/50 transition-colors mx-auto"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
