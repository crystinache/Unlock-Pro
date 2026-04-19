import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { AppSettings, saveSettings, saveBackground } from '../store';

interface MenuScreenProps {
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  bgImage: string | null;
  onSaveBgImage: (bg: string | null) => void;
}

export default function MenuScreen({ onClose, settings, onSaveSettings, bgImage, onSaveBgImage }: MenuScreenProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    saveSettings(localSettings);
    onSaveSettings(localSettings);
    onClose();
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        saveBackground(base64);
        onSaveBgImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 text-white flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black">
        <h1 className="text-xl font-medium">Impostazioni Segrete</h1>
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium active:bg-blue-700 transition-colors"
        >
          Salva
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Background Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-blue-400">1. Background</h2>
          <p className="text-sm text-white/60">Imposta un'immagine di sfondo per la schermata di blocco.</p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/10 rounded-md active:bg-white/20 transition-colors"
            >
              Scegli Immagine
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageUpload}
            />
            {bgImage && (
              <div className="w-16 h-16 rounded-md bg-cover bg-center border border-white/20" style={{ backgroundImage: `url(${bgImage})` }} />
            )}
          </div>
        </section>

        {/* Unlock Attempt Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-blue-400">2. Unlock Attempt</h2>
          <p className="text-sm text-white/60">Numero di tentativi prima che il telefono si "sblocchi".</p>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => setLocalSettings(s => ({ ...s, unlockAttempts: num }))}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                  localSettings.unlockAttempts === num ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </section>

        {/* PEEK Value Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-blue-400">3. PEEK Value</h2>
          <p className="text-sm text-white/60">Quale tentativo memorizzare e mostrare nella schermata nera finale.</p>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => setLocalSettings(s => ({ ...s, peekValue: num }))}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                  localSettings.peekValue === num ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </section>

        {/* ZODIAC & AGE Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-blue-400">4. ZODIAC & AGE</h2>
          <p className="text-sm text-white/60">Mostra segno zodiacale ed età se il PIN è una data (GGMM o GGMMYY).</p>
          
          <button
            onClick={() => setLocalSettings(s => ({ ...s, zodiacAndAge: !s.zodiacAndAge }))}
            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-colors ${
              localSettings.zodiacAndAge ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 border-current flex items-center justify-center`}>
              {localSettings.zodiacAndAge && <div className="w-3 h-3 bg-white rounded-full" />}
            </div>
            <span className="font-medium">{localSettings.zodiacAndAge ? 'ON' : 'OFF'}</span>
          </button>
        </section>

        {/* AUTO SHOW PEEK Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-blue-400">5. AUTO SHOW PEEK</h2>
          <p className="text-sm text-white/60">Mostra subito le informazioni sulla schermata nera senza dover toccare.</p>
          
          <button
            onClick={() => setLocalSettings(s => ({ ...s, autoShowPeek: !s.autoShowPeek }))}
            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-colors ${
              localSettings.autoShowPeek ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 border-current flex items-center justify-center`}>
              {localSettings.autoShowPeek && <div className="w-3 h-3 bg-white rounded-full" />}
            </div>
            <span className="font-medium">{localSettings.autoShowPeek ? 'ON' : 'OFF'}</span>
          </button>
        </section>

        {/* FAMOUS PERSON Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-blue-400">6. FAMOUS PERSON</h2>
          <p className="text-sm text-white/60">Mostra il nome di una persona famosa nata nel giorno e mese del PIN.</p>
          
          <button
            onClick={() => setLocalSettings(s => ({ ...s, famousPerson: !s.famousPerson }))}
            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-colors ${
              localSettings.famousPerson ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 border-current flex items-center justify-center`}>
              {localSettings.famousPerson && <div className="w-3 h-3 bg-white rounded-full" />}
            </div>
            <span className="font-medium">{localSettings.famousPerson ? 'ON' : 'OFF'}</span>
          </button>
        </section>

        {/* PEEK TEXT COLOR Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-blue-400">7. PEEK TEXT COLOR</h2>
          <p className="text-sm text-white/60">Cambia il colore del testo nella schermata finale (da bianco a nero).</p>
          
          <div className="flex flex-col gap-4">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={localSettings.peekTextColor}
              onChange={(e) => setLocalSettings(s => ({ ...s, peekTextColor: parseInt(e.target.value) }))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            
            <div className="flex justify-between text-xs text-white/40">
              <span>BIANCO</span>
              <span>GRIGIO</span>
              <span>NERO</span>
            </div>

            {/* Preview Box */}
            <div className="w-full p-6 bg-black rounded-lg border border-white/10 flex flex-col items-center gap-2">
              <span className="text-xs text-white/20 mb-2 uppercase tracking-widest">Anteprima</span>
              <div 
                className="text-2xl font-mono tracking-wider"
                style={{ color: `rgb(${255 * (1 - localSettings.peekTextColor / 100)}, ${255 * (1 - localSettings.peekTextColor / 100)}, ${255 * (1 - localSettings.peekTextColor / 100)})` }}
              >
                10 11
              </div>
              <div 
                className="text-xl font-mono tracking-wider"
                style={{ color: `rgb(${255 * (1 - localSettings.peekTextColor / 100)}, ${255 * (1 - localSettings.peekTextColor / 100)}, ${255 * (1 - localSettings.peekTextColor / 100)})` }}
              >
                Scorpione 35
              </div>
              <div 
                className="text-lg font-mono tracking-wider"
                style={{ color: `rgb(${255 * (1 - localSettings.peekTextColor / 100)}, ${255 * (1 - localSettings.peekTextColor / 100)}, ${255 * (1 - localSettings.peekTextColor / 100)})` }}
              >
                Mikhail Kalashnikov
              </div>
              <div 
                className="text-sm uppercase tracking-widest mt-4"
                style={{ color: `rgb(${255 * (1 - localSettings.peekTextColor / 100)}, ${255 * (1 - localSettings.peekTextColor / 100)}, ${255 * (1 - localSettings.peekTextColor / 100)})` }}
              >
                Reset
              </div>
            </div>
          </div>
        </section>

        {/* Passcode by Adrian Lacroix Section */}
        <section className="space-y-4 pb-8">
          <h2 className="text-lg font-medium text-blue-400 uppercase">8. Passcode by Adrian Lacroix</h2>
          <p className="text-sm text-white">
            [L'App sottrae l'anno in corso dal "PEEK Value" . Attenzione, il tentativo Peek Value e Unlock attempt devono essere uguali]
          </p>
          
          <button
            onClick={() => setLocalSettings(s => ({ ...s, passcodeAdrianLacroix: !s.passcodeAdrianLacroix }))}
            className={`flex items-center gap-3 px-6 py-3 rounded-full transition-colors ${
              localSettings.passcodeAdrianLacroix ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 border-current flex items-center justify-center`}>
              {localSettings.passcodeAdrianLacroix && <div className="w-3 h-3 bg-white rounded-full" />}
            </div>
            <span className="font-medium">{localSettings.passcodeAdrianLacroix ? 'ON' : 'OFF'}</span>
          </button>
        </section>
      </div>
    </div>
  );
}
