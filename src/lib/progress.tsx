import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'uplink.progress.v1';

type StoredProgress = {
  completed: Record<string, number>;
  onboardingDone: boolean;
};

type ProgressValue = {
  ready: boolean;
  completed: Record<string, number>;
  markComplete: (lessonId: string) => void;
  isComplete: (lessonId: string) => boolean;
  onboardingDone: boolean;
  finishOnboarding: () => void;
};

const ProgressContext = createContext<ProgressValue | null>(null);

async function loadStored(): Promise<StoredProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {}, onboardingDone: false };
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
      onboardingDone: !!parsed.onboardingDone,
    };
  } catch {
    return { completed: {}, onboardingDone: false };
  }
}

async function saveStored(data: StoredProgress) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore — in-memory state still works for the session
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    let alive = true;
    loadStored().then((stored) => {
      if (!alive) return;
      setCompleted(stored.completed);
      setOnboardingDone(stored.onboardingDone);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveStored({ completed, onboardingDone });
  }, [ready, completed, onboardingDone]);

  const markComplete = useCallback((lessonId: string) => {
    setCompleted((prev) => (prev[lessonId] ? prev : { ...prev, [lessonId]: Date.now() }));
  }, []);

  const finishOnboarding = useCallback(() => {
    setOnboardingDone(true);
  }, []);

  const value = useMemo<ProgressValue>(
    () => ({
      ready,
      completed,
      markComplete,
      isComplete: (lessonId: string) => completed[lessonId] !== undefined,
      onboardingDone,
      finishOnboarding,
    }),
    [ready, completed, markComplete, onboardingDone, finishOnboarding]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const value = useContext(ProgressContext);
  if (!value) {
    throw new Error('useProgress must be used inside <ProgressProvider>');
  }
  return value;
}
