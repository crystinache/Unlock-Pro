/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import LockScreen from './components/LockScreen';
import PinScreen from './components/PinScreen';
import PasswordScreen from './components/PasswordScreen';
import PatternScreen from './components/PatternScreen';
import MenuScreen from './components/MenuScreen';
import PeekScreen from './components/PeekScreen';
import { loadSettings, loadBackground, AppSettings, loadPeekState, savePeekState } from './store';

export type ScreenType = 'lock' | 'pin4' | 'pin5' | 'pin6' | 'password' | 'pattern' | 'menu' | 'peek';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('lock');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  
  // State for unlock attempts
  const [attemptsMade, setAttemptsMade] = useState(0);
  const [memorizedPeek, setMemorizedPeek] = useState<string | number[] | null>(null);
  const [peekType, setPeekType] = useState<'pin' | 'password' | 'pattern' | null>(null);

  useEffect(() => {
    loadBackground().then(bg => {
      if (bg) setBgImage(bg);
    });

    // Load peek state if it exists
    const peekState = loadPeekState();
    if (peekState) {
      setCurrentScreen(peekState.screen as ScreenType);
      setMemorizedPeek(peekState.value);
      setPeekType(peekState.type);
    }
  }, []);

  useEffect(() => {
    // Update theme-color meta tag dynamically to match app background
    const updateThemeColor = () => {
      let color = '#000000'; // Default black
      
      // If we're on a screen with a background image, we could try to match it,
      // but for "hiding" the status bar, solid black is often best.
      // However, the user specifically asked for matching if possible.
      // Since we don't have easy access to the image pixels here, 
      // we stick to deep black for 'peek' and 'lock' to avoid artifacts.
      
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', color);
      }
    };

    updateThemeColor();
  }, [currentScreen]);

  const handleUnlockAttempt = useCallback((value: string | number[], type: 'pin' | 'password' | 'pattern') => {
    const currentAttempts = attemptsMade + 1;
    
    // Memorize if it's the configured peek attempt
    let newMemorizedPeek = memorizedPeek;
    let newPeekType = peekType;
    if (currentAttempts === settings.peekValue) {
      let finalValue = value;

      // Passcode by Adrian Lacroix logic
      if (settings.passcodeAdrianLacroix && type === 'pin' && typeof value === 'string') {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          const currentYear = new Date().getFullYear();
          const result = numValue - currentYear;
          // Format the result as string, pad with zeros to match original length to maintain date parsing (DDMM)
          // If result is negative, it will include '-', which is fine for display
          finalValue = result.toString();
          if (result >= 0) {
            finalValue = finalValue.padStart(value.length, '0');
          }
        }
      }

      newMemorizedPeek = finalValue;
      newPeekType = type;
      setMemorizedPeek(finalValue);
      setPeekType(type);
    }

    if (currentAttempts >= settings.unlockAttempts) {
      // Save peek state so that the NEXT time the app is opened, it starts in the 'peek' screen
      savePeekState({
        screen: 'peek',
        value: newMemorizedPeek,
        type: newPeekType
      });

      // Small delay to let the user see the last input
      setTimeout(() => {
        setAttemptsMade(0);
        
        // Attempt to "close" the app (minimize/background)
        if (typeof window !== 'undefined') {
          window.close();
        }

        // Return to lock screen if window doesn't close
        setCurrentScreen('lock');
      }, 300);
      return true; // indicates success/unlock
    } else {
      setAttemptsMade(currentAttempts);
      return false; // indicates failure
    }
  }, [attemptsMade, settings, memorizedPeek, peekType]);

  const cancelToLock = useCallback(() => {
    setCurrentScreen('lock');
    setAttemptsMade(0);
  }, []);

  const resetToLock = useCallback(() => {
    setCurrentScreen('lock');
    setAttemptsMade(0);
    setMemorizedPeek(null);
    setPeekType(null);
    savePeekState(null);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'lock':
        return <LockScreen onNavigate={setCurrentScreen} bgImage={bgImage} />;
      case 'pin4':
        return <PinScreen length={4} onCancel={cancelToLock} onAttempt={(val) => handleUnlockAttempt(val, 'pin')} bgImage={bgImage} />;
      case 'pin5':
        return <PinScreen length={5} onCancel={cancelToLock} onAttempt={(val) => handleUnlockAttempt(val, 'pin')} bgImage={bgImage} />;
      case 'pin6':
        return <PinScreen length={6} onCancel={cancelToLock} onAttempt={(val) => handleUnlockAttempt(val, 'pin')} bgImage={bgImage} />;
      case 'password':
        return <PasswordScreen onCancel={cancelToLock} onAttempt={(val) => handleUnlockAttempt(val, 'password')} bgImage={bgImage} />;
      case 'pattern':
        return <PatternScreen onCancel={cancelToLock} onAttempt={(val) => handleUnlockAttempt(val, 'pattern')} bgImage={bgImage} />;
      case 'menu':
        return <MenuScreen 
          onClose={() => setCurrentScreen('lock')} 
          settings={settings} 
          onSaveSettings={setSettings}
          bgImage={bgImage}
          onSaveBgImage={setBgImage}
        />;
      case 'peek':
        return <PeekScreen 
          peekValue={memorizedPeek} 
          peekType={peekType} 
          onReset={resetToLock} 
          zodiacAndAgeEnabled={settings.zodiacAndAge}
          autoShowPeek={settings.autoShowPeek}
          famousPersonEnabled={settings.famousPerson}
          textColorPercent={settings.peekTextColor}
        />;
      default:
        return <LockScreen onNavigate={setCurrentScreen} bgImage={bgImage} />;
    }
  };

  return (
    <div className="fixed -top-[2px] -left-[2px] -right-[2px] -bottom-[2px] bg-black text-white overflow-hidden select-none font-sans">
      {renderScreen()}
    </div>
  );
}
