import { UserAttempt, SRSItem, UserProfile, TopicName } from '../types/math';

const STORAGE_KEYS = {
  ATTEMPTS: 'jupeb_attempts_v1',
  SRS: 'jupeb_srs_items_v1',
  PROFILE: 'jupeb_profile_v1',
  CUSTOM_QUESTIONS: 'jupeb_custom_questions_v1',
};

export function getStoredAttempts(): UserAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: UserAttempt) {
  try {
    const current = getStoredAttempts();
    const updated = [attempt, ...current.slice(0, 499)];
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(updated));
    updateUserProfileStats(attempt.time_taken_seconds);
  } catch (e) {
    console.error('Failed to save attempt', e);
  }
}

export function getStoredSRS(): Record<string, SRSItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SRS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * SM-2 Spaced Repetition algorithm implementation
 * rating:
 * 'hard' -> quality = 2 (reset interval or set to 1 day)
 * 'good' -> quality = 4 (standard progression)
 * 'easy' -> quality = 5 (accelerated interval)
 */
export function updateSRSProgress(questionId: string, rating: 'hard' | 'good' | 'easy'): SRSItem {
  const allSRS = getStoredSRS();
  const existing = allSRS[questionId] || {
    question_id: questionId,
    repetition: 0,
    interval_days: 1,
    ease_factor: 2.5,
    next_review_date: new Date().toISOString(),
    last_reviewed_date: new Date().toISOString(),
    status: 'learning' as const,
  };

  let quality = 4;
  if (rating === 'hard') quality = 2;
  if (rating === 'easy') quality = 5;

  let newRepetition = existing.repetition;
  let newInterval = existing.interval_days;
  let newEase = existing.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEase < 1.3) newEase = 1.3;

  if (quality < 3) {
    newRepetition = 0;
    newInterval = 1;
  } else {
    if (newRepetition === 0) {
      newInterval = 1;
    } else if (newRepetition === 1) {
      newInterval = 3;
    } else {
      newInterval = Math.round(newInterval * newEase);
    }
    newRepetition += 1;
  }

  // Cap interval to reasonable maximum
  if (newInterval > 90) newInterval = 90;

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  let status: 'learning' | 'review' | 'mastered' = 'learning';
  if (newRepetition >= 3 && quality >= 4) {
    status = 'mastered';
  } else if (newRepetition >= 1) {
    status = 'review';
  }

  const updatedItem: SRSItem = {
    question_id: questionId,
    repetition: newRepetition,
    interval_days: newInterval,
    ease_factor: Number(newEase.toFixed(2)),
    next_review_date: nextDate.toISOString(),
    last_reviewed_date: new Date().toISOString(),
    status,
  };

  allSRS[questionId] = updatedItem;
  try {
    localStorage.setItem(STORAGE_KEYS.SRS, JSON.stringify(allSRS));
  } catch (e) {
    console.error('Failed to save SRS', e);
  }

  return updatedItem;
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaultProfile: UserProfile = {
    id: 'user_jupeb_student',
    full_name: 'A-Level Scholar',
    subscription_tier: 'free',
    streak_days: 3,
    last_active_date: new Date().toISOString(),
    total_study_seconds: 1420,
  };
  return defaultProfile;
}

export function updateUserProfileStats(additionalSeconds: number) {
  const profile = getUserProfile();
  profile.total_study_seconds += additionalSeconds;

  const today = new Date().toDateString();
  const lastActive = new Date(profile.last_active_date).toDateString();

  if (today !== lastActive) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === lastActive) {
      profile.streak_days += 1;
    } else {
      profile.streak_days = 1;
    }
    profile.last_active_date = new Date().toISOString();
  }

  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {}
}

export function calculateTopicProficiency(topic: TopicName, attempts: UserAttempt[]) {
  const topicAttempts = attempts.filter((a) => a.topic === topic);
  if (topicAttempts.length === 0) return { attempted: 0, accuracy: 0, score: 0 };

  const correctCount = topicAttempts.filter((a) => a.is_correct).length;
  const accuracy = Math.round((correctCount / topicAttempts.length) * 100);

  // Score considers accuracy and penalty for excessive hint reliance
  const hintPenalties = topicAttempts.reduce((acc, curr) => acc + (curr.hints_used_count * 5), 0);
  const rawScore = Math.max(10, Math.min(100, accuracy - Math.round(hintPenalties / topicAttempts.length)));

  return {
    attempted: topicAttempts.length,
    accuracy,
    score: rawScore,
  };
}
