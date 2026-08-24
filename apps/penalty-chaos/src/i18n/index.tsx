import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { en } from "./en";
import { nb } from "./nb";
import { LOCALES, type Locale, type Messages } from "./messages";

export type { Locale, Messages } from "./messages";
export { LOCALES } from "./messages";

const STORAGE_KEY = "penalty-chaos/locale";

const BUNDLES: Record<Locale, Messages> = { nb, en };

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Norwegian appears as `nb`, `nn` and the macro-language `no` depending on the
 * device, and all three should get Bokmål rather than falling back to English.
 */
function deviceLocale(): Locale {
  try {
    const code = getLocales()[0]?.languageCode?.toLowerCase() ?? "";
    return ["nb", "nn", "no"].includes(code) ? "nb" : "en";
  } catch {
    return "en";
  }
}

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start from the device language so the first launch is already right; a
  // stored choice overrides it as soon as it loads.
  const [locale, setLocaleState] = useState<Locale>(deviceLocale);
  // The provider mounts once, so this window is effectively unreachable in
  // practice, but it's the same "load clobbers an in-flight edit" shape as
  // the name-storage hooks, so it gets the same guard for consistency.
  const dirty = useRef(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && !dirty.current && isLocale(stored)) setLocaleState(stored);
      })
      .catch(() => {
        // Storage unavailable — the device language is a fine answer.
      });
    return () => {
      active = false;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    dirty.current = true;
    setLocaleState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Best effort; the choice still applies for this session.
    });
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: BUNDLES[locale] }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside an I18nProvider");
  return value;
}
