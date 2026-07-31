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

export type LessonPhase = 'watch' | 'remember' | 'quiz';

export type LessonCheckpoint = {
  phase: LessonPhase;
  stepIndex: number;
  quizAnswered: number;
};

type StoredProgress = {
  completed: Record<string, number>;
  /** in-progress lessons — cleared when completed */
  checkpoints: Record<string, LessonCheckpoint>;
  onboardingDone: boolean;
};

export type LessonProgressParts = {
  /** segments finished, e.g. 3 */
  done: number;
  /** Learn steps + Remember (+ Quiz as last segment), e.g. 4 */
  total: number;
  /** done/total for the green fill */
  fraction: number;
};

type ProgressValue = {
  ready: boolean;
  completed: Record<string, number>;
  checkpoints: Record<string, LessonCheckpoint>;
  markComplete: (lessonId: string) => void;
  isComplete: (lessonId: string) => boolean;
  setCheckpoint: (lessonId: string, checkpoint: LessonCheckpoint) => void;
  getLessonProgress: (lessonId: string, steps: number, quizLen: number) => LessonProgressParts;
  /** 0–1 fill — convenience for Home etc. */
  getProgress: (lessonId: string, steps: number, quizLen: number) => number;
  onboardingDone: boolean;
  finishOnboarding: () => void;
};

const ProgressContext = createContext<ProgressValue | null>(null);

/**
 * Lesson bar units = Learn steps + Remember + Quiz.
 * cpu-001 (3 steps) → total 5; if we only want 4 for “3/4 at Remember”,
 * treat Quiz as the final segment: total = steps + 1.
 * Remember / Quiz-in-progress → done = steps (e.g. 3/4). Finish → full.
 */
export function computeLessonProgressParts(
  checkpoint: LessonCheckpoint | undefined,
  steps: number,
  _quizLen: number,
  complete: boolean
): LessonProgressParts {
  const total = Math.max(1, steps + 1);
  if (complete) return { done: total, total, fraction: 1 };
  if (!checkpoint || steps < 1) return { done: 0, total, fraction: 0 };

  let done = 0;
  if (checkpoint.phase === 'watch') {
    done = Math.min(checkpoint.stepIndex, steps);
  } else {
    // Remember or Quiz — all learn steps done; one segment left until Finish
    done = steps;
  }
  return {
    done,
    total,
    fraction: Math.max(0, Math.min(1, done / total)),
  };
}

async function loadStored(): Promise<StoredProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {}, checkpoints: {}, onboardingDone: false };
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
      checkpoints:
        parsed.checkpoints && typeof parsed.checkpoints === 'object' ? parsed.checkpoints : {},
      onboardingDone: !!parsed.onboardingDone,
    };
  } catch {
    return { completed: {}, checkpoints: {}, onboardingDone: false };
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
  const [checkpoints, setCheckpoints] = useState<Record<string, LessonCheckpoint>>({});
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    let alive = true;
    loadStored().then((stored) => {
      if (!alive) return;
      setCompleted(stored.completed);
      setCheckpoints(stored.checkpoints);
      setOnboardingDone(stored.onboardingDone);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveStored({ completed, checkpoints, onboardingDone });
  }, [ready, completed, checkpoints, onboardingDone]);

  const markComplete = useCallback((lessonId: string) => {
    setCompleted((prev) => (prev[lessonId] ? prev : { ...prev, [lessonId]: Date.now() }));
    setCheckpoints((prev) => {
      if (!(lessonId in prev)) return prev;
      const next = { ...prev };
      delete next[lessonId];
      return next;
    });
  }, []);

  const setCheckpoint = useCallback((lessonId: string, checkpoint: LessonCheckpoint) => {
    setCheckpoints((prev) => {
      const cur = prev[lessonId];
      if (
        cur &&
        cur.phase === checkpoint.phase &&
        cur.stepIndex === checkpoint.stepIndex &&
        cur.quizAnswered === checkpoint.quizAnswered
      ) {
        return prev;
      }
      return { ...prev, [lessonId]: checkpoint };
    });
  }, []);

  const finishOnboarding = useCallback(() => {
    setOnboardingDone(true);
  }, []);

  const isComplete = useCallback(
    (lessonId: string) => completed[lessonId] !== undefined,
    [completed]
  );

  const getLessonProgress = useCallback(
    (lessonId: string, steps: number, quizLen: number) =>
      computeLessonProgressParts(checkpoints[lessonId], steps, quizLen, isComplete(lessonId)),
    [checkpoints, isComplete]
  );

  const getProgress = useCallback(
    (lessonId: string, steps: number, quizLen: number) =>
      getLessonProgress(lessonId, steps, quizLen).fraction,
    [getLessonProgress]
  );

  const value = useMemo<ProgressValue>(
    () => ({
      ready,
      completed,
      checkpoints,
      markComplete,
      isComplete,
      setCheckpoint,
      getLessonProgress,
      getProgress,
      onboardingDone,
      finishOnboarding,
    }),
    [
      ready,
      completed,
      checkpoints,
      markComplete,
      isComplete,
      setCheckpoint,
      getLessonProgress,
      getProgress,
      onboardingDone,
      finishOnboarding,
    ]
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
