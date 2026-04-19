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
import { formatPin, getFamousPerson, getZodiacAndAge } from './lib/peek';

export type ScreenType = 'lock' | 'pin4' | 'pin5' | 'pin6' | 'password' | 'pattern' | 'menu' | 'peek';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('lock');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  
  // State for unlock attempts
  const [attemptsMade, setAttemptsMade] = useState(0);
  const [memorizedPeek, setMemorizedPeek] = useState<string | number[] | null>(null);
  const [peekType, setPeekType] = useState<'pin' | 'password' | 'pattern' | null>(null);

  // Store all attempts for push notifications
  const [attemptsValues, setAttemptsValues] = useState<Record<number, { value: string | number[], type: 'pin' | 'password' | 'pattern' }>>({});

  const sendNotification = useCallback((attemptIndex: number, data: { value: string | number[], type: 'pin' | 'password' | 'pattern' }) => {
    if (!settings.pushNotificationsEnabled) return;
    
    const delay = settings.pushNotificationDelay * 1000;
    
    setTimeout(() => {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      let title = `Nuovo Tentativo (#${attemptIndex})`;
      let body = '';

      if (data.type === 'pattern') {
        body = `Sequenza: ${(data.value as number[]).map(n => n + 1).join(' → ')}`;
      } else {
        const val = data.value as string;
        body = data.type === 'pin' ? formatPin(val) : val;

        if (data.type === 'pin' && val.length >= 4) {
          const extraInfo = [];
          if (settings.zodiacAndAge) {
            extraInfo.push(getZodiacAndAge(val));
          }
          if (settings.famousPerson) {
            const person = getFamousPerson(val);
            if (person) extraInfo.push(person);
          }
          if (extraInfo.length > 0) {
            body += `\n${extraInfo.join(' | ')}`;
          }
        }
      }

      const options = {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'peek-notification',
        renotify: true,
        vibrate: [200, 100, 200]
      };

      // Prova a usare il Service Worker (raccomandato per PWA su Android)
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options as any);
        });
      } else if (typeof Notification !== 'undefined') {
        // Fallback per browser che non supportano SW o non sono in modalità PWA
        new Notification(title, options as any);
      }
    }, delay);
  }, [settings]);

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

  const handleUnlockAttempt = useCallback((value: string | number[], type: 'pin' | 'password' | 'pattern') => {
    const currentAttempts = attemptsMade + 1;
    
    // Store this attempt
    setAttemptsValues(prev => ({
      ...prev,
      [currentAttempts]: { value, type }
    }));

    // Passcode by Adrian Lacroix logic (only for Peek/Storage)
    let processedValue = value;
    if (settings.passcodeAdrianLacroix && type === 'pin' && typeof value === 'string') {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        const currentYear = new Date().getFullYear();
        const result = numValue - currentYear;
        processedValue = result.toString();
        if (result >= 0) {
          processedValue = processedValue.padStart(value.length, '0');
        }
      }
    }

    // Memorize if it's the configured peek attempt
    let newMemorizedPeek = memorizedPeek;
    let newPeekType = peekType;
    if (currentAttempts === settings.peekValue) {
      newMemorizedPeek = processedValue;
      newPeekType = type;
      setMemorizedPeek(processedValue);
      setPeekType(type);
    }

    // Push Notification: At Attempt logic
    if (settings.pushNotificationsEnabled && settings.pushNotificationTiming === 'atAttempt' && currentAttempts === settings.pushNotificationAttempt) {
      sendNotification(currentAttempts, { value: processedValue, type });
    }

    if (currentAttempts >= settings.unlockAttempts) {
      // "Unlock" -> go to peek screen (black screen)
      // Small delay to let the user see the last input
      setTimeout(() => {
        setCurrentScreen('peek');
        setAttemptsMade(0);
        
        // Push Notification: After Unlock logic
        if (settings.pushNotificationsEnabled && settings.pushNotificationTiming === 'afterUnlock') {
          const notifyAttempt = settings.pushNotificationAttempt;
          // We need the value from that specific attempt
          // Since setAttemptsValues is async, we check if it's the current one or a previous one
          const dataToNotify = currentAttempts === notifyAttempt ? { value: processedValue, type } : attemptsValues[notifyAttempt];
          
          if (dataToNotify) {
            sendNotification(notifyAttempt, dataToNotify);
          }
        }

        // Save peek state
        savePeekState({
          screen: 'peek',
          value: newMemorizedPeek,
          type: newPeekType
        });

        // Attempt to "close" the app (minimize/background)
        // Note: window.close() only works if the tab was opened by a script,
        // but we'll try it as a best effort.
        if (typeof window !== 'undefined') {
          window.close();
        }
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
    <div className="fixed inset-0 bg-black text-white overflow-hidden select-none font-sans">
      {renderScreen()}
    </div>
  );
}
