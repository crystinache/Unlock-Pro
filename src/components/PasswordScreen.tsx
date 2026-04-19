import { useState, useRef, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Lock } from 'lucide-react';
import { hapticFeedback } from '../lib/utils';

interface PasswordScreenProps {
  onCancel: () => void;
  onAttempt: (password: string) => boolean;
  bgImage: string | null;
}

export default function PasswordScreen({ onCancel, onAttempt, bgImage }: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [error, setError] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;

    const isUnlocked = onAttempt(password);
    if (!isUnlocked) {
      setError(true);
      hapticFeedback.error();
      setTimeout(() => {
        setPassword('');
        setDisplayValue('');
        setError(false);
      }, 1000);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    hapticFeedback.tap();

    if (val.length > password.length) {
      // Character added
      const newChar = val.slice(-1);
      const newPassword = password + newChar;
      setPassword(newPassword);
      
      // Show the last character, mask the rest
      const masked = '•'.repeat(newPassword.length - 1) + newChar;
      setDisplayValue(masked);

      // Set timer to mask the last character after 2 seconds
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDisplayValue('•'.repeat(newPassword.length));
      }, 2000);
    } else {
      // Character deleted
      const newPassword = password.slice(0, val.length);
      setPassword(newPassword);
      setDisplayValue('•'.repeat(newPassword.length));
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center">
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
          {error ? 'Password errata, riprova' : 'Inserisci password'}
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            spellCheck={false}
            autoComplete="off"
            className={`w-full bg-white/10 border-b-2 ${error ? 'border-red-500 text-red-500' : 'border-white text-white'} px-4 py-3 text-center text-xl outline-none focus:bg-white/20 transition-colors rounded-t-md font-mono`}
            autoFocus
          />
          
          <div className="flex justify-between w-full mt-12 px-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-white/80 text-lg font-medium active:text-white transition-colors uppercase"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="text-white/80 text-lg font-medium active:text-white transition-colors uppercase"
            >
              Ok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
