/**
 * Persistence & Storage Layer
 *
 * Handles client-side persistence of user habits, completion heatmaps,
 * configuration settings, and milestone badges using browser localStorage.
 * Provides fallback mock data for first-time visits and schema migrations.
 */

import { Habit, HabitTrackerData, AppTheme } from '../types';
import { formatDateKey, addDays } from './dateUtils';

const STORAGE_KEY = 'habit_tracker_data';

/**
 * Generates initial realistic habit completion history for demonstration.
 * Creates an unbroken streak up to today, plus scattered historical check-ins.
 */
function generateSampleCompletions(streakDays: number, totalHistoryDays: number): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const today = new Date();

  // Generate current streak (consecutive days leading up to today)
  for (let i = 0; i < streakDays; i++) {
    const d = addDays(today, -i);
    result[formatDateKey(d)] = true;
  }

  // Generate historical completions scattered across prior weeks
  for (let i = streakDays + 2; i < totalHistoryDays; i++) {
    if ((i * 7 + 3) % 5 <= 2) {
      const d = addDays(today, -i);
      result[formatDateKey(d)] = true;
    }
  }

  return result;
}

/**
 * Returns initial default habits with predefined streaks (e.g. 7 and 14 days)
 * to immediately showcase heatmap density and unlocked milestones.
 */
export function getDefaultHabits(): Habit[] {
  const today = new Date();
  return [
    {
      id: 'habit-1',
      name: 'Morning Meditation (15 min)',
      color: 'emerald',
      createdAt: formatDateKey(addDays(today, -60)),
      completions: generateSampleCompletions(7, 50),
      reminderEnabled: true,
      reminderDays: [1, 2, 3, 4, 5], // Monday through Friday
    },
    {
      id: 'habit-2',
      name: 'Read 20 Pages of a Book',
      color: 'blue',
      createdAt: formatDateKey(addDays(today, -90)),
      completions: generateSampleCompletions(14, 75),
      reminderEnabled: true,
      reminderDays: [0, 1, 2, 3, 4, 5, 6], // Daily
    },
    {
      id: 'habit-3',
      name: 'Strength Training & Core',
      color: 'purple',
      createdAt: formatDateKey(addDays(today, -45)),
      completions: generateSampleCompletions(3, 30),
      reminderEnabled: true,
      reminderDays: [1, 3, 5], // Mon, Wed, Fri
    },
  ];
}

/**
 * Loads habit tracker state from local storage.
 * Performs schema validation and upgrades legacy themes.
 */
export function loadHabitData(): HabitTrackerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultData: HabitTrackerData = {
        version: 2,
        habits: getDefaultHabits(),
        theme: 'dark',
        dailyReminderEnabled: true,
        dailyReminderTime: '20:00',
        unlockedMilestones: [
          {
            id: 'init-milestone-1',
            milestoneId: 'streak-3',
            habitId: 'habit-1',
            habitName: 'Morning Meditation (15 min)',
            days: 3,
            unlockedAt: formatDateKey(addDays(new Date(), -4)),
          },
          {
            id: 'init-milestone-2',
            milestoneId: 'streak-7',
            habitId: 'habit-1',
            habitName: 'Morning Meditation (15 min)',
            days: 7,
            unlockedAt: formatDateKey(new Date()),
          },
          {
            id: 'init-milestone-3',
            milestoneId: 'streak-14',
            habitId: 'habit-2',
            habitName: 'Read 20 Pages of a Book',
            days: 14,
            unlockedAt: formatDateKey(new Date()),
          },
        ],
      };
      saveHabitData(defaultData);
      return defaultData;
    }

    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.habits)) {
      // Normalize habits
      const normalizedHabits = parsed.habits.map((h: Habit) => ({
        ...h,
        reminderEnabled: h.reminderEnabled ?? false,
        reminderDays: Array.isArray(h.reminderDays) ? h.reminderDays : [1, 2, 3, 4, 5],
        reminderTime: h.reminderTime || '09:00',
      }));

      // Normalize theme: convert legacy 'midnight' to 'dark'
      let normalizedTheme: AppTheme = 'dark';
      if (parsed.theme === 'light') {
        normalizedTheme = 'light';
      }

      return {
        ...parsed,
        version: 2,
        habits: normalizedHabits,
        theme: normalizedTheme,
        dailyReminderEnabled: parsed.dailyReminderEnabled ?? true,
        dailyReminderTime: parsed.dailyReminderTime || '20:00',
        unlockedMilestones: Array.isArray(parsed.unlockedMilestones)
          ? parsed.unlockedMilestones
          : [],
      };
    }
  } catch (err) {
    console.error('Failed to load habit data from localStorage:', err);
  }

  const fallback: HabitTrackerData = {
    version: 2,
    habits: getDefaultHabits(),
    theme: 'dark',
    dailyReminderEnabled: true,
    dailyReminderTime: '20:00',
    unlockedMilestones: [],
  };
  saveHabitData(fallback);
  return fallback;
}

/**
 * Saves current habit tracker state to local storage.
 */
export function saveHabitData(data: HabitTrackerData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save habit data to localStorage:', err);
  }
}
