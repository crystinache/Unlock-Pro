import { get, set } from 'idb-keyval';

export interface AppSettings {
  unlockAttempts: number;
  peekValue: number;
  zodiacAndAge: boolean;
  autoShowPeek: boolean;
  famousPerson: boolean;
  peekTextColor: number;
  passcodeAdrianLacroix: boolean;
  pushNotificationsEnabled: boolean;
  pushNotificationAttempt: number;
  pushNotificationTiming: 'atAttempt' | 'afterUnlock';
  pushNotificationDelay: number;
}

export interface PeekState {
  screen: string;
  value: string | number[] | null;
  type: 'pin' | 'password' | 'pattern' | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  unlockAttempts: 3,
  peekValue: 1,
  zodiacAndAge: false,
  autoShowPeek: false,
   famousPerson: false,
  peekTextColor: 0,
  passcodeAdrianLacroix: false,
  pushNotificationsEnabled: false,
  pushNotificationAttempt: 1,
  pushNotificationTiming: 'atAttempt',
  pushNotificationDelay: 0,
};

export const loadSettings = (): AppSettings => {
  const stored = localStorage.getItem('app_settings');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        unlockAttempts: Number(parsed.unlockAttempts) || DEFAULT_SETTINGS.unlockAttempts,
        peekValue: Number(parsed.peekValue) || DEFAULT_SETTINGS.peekValue,
        zodiacAndAge: !!parsed.zodiacAndAge,
        autoShowPeek: !!parsed.autoShowPeek,
        famousPerson: !!parsed.famousPerson,
        peekTextColor: Number(parsed.peekTextColor) || DEFAULT_SETTINGS.peekTextColor,
        passcodeAdrianLacroix: !!parsed.passcodeAdrianLacroix,
        pushNotificationsEnabled: !!parsed.pushNotificationsEnabled,
        pushNotificationAttempt: Number(parsed.pushNotificationAttempt) || DEFAULT_SETTINGS.pushNotificationAttempt,
        pushNotificationTiming: parsed.pushNotificationTiming || DEFAULT_SETTINGS.pushNotificationTiming,
        pushNotificationDelay: Number(parsed.pushNotificationDelay) || DEFAULT_SETTINGS.pushNotificationDelay,
      };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem('app_settings', JSON.stringify(settings));
};

export const savePeekState = (state: PeekState | null) => {
  if (state) {
    localStorage.setItem('peek_state', JSON.stringify(state));
  } else {
    localStorage.removeItem('peek_state');
  }
};

export const loadPeekState = (): PeekState | null => {
  const stored = localStorage.getItem('peek_state');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const loadBackground = async (): Promise<string | null> => {
  try {
    return await get('app_background');
  } catch (e) {
    return null;
  }
};

export const saveBackground = async (base64: string) => {
  try {
    await set('app_background', base64);
  } catch (e) {
    console.error('Failed to save background', e);
  }
};
