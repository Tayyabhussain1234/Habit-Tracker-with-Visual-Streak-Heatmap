/**
 * Application Type Definitions
 * 
 * Provides type contracts for habits, completion tracking, streak calculations,
 * grid rendering matrices, visual themes, and milestone achievement awards.
 */

export type AppTheme = 'dark' | 'light';

/**
 * Habit entity representing an individual tracked habit.
 */
export interface Habit {
  /** Unique identifier for the habit */
  id: string;
  /** Display title of the habit */
  name: string;
  /** Accent color identifier ('emerald' | 'blue' | 'purple' | 'amber') */
  color: string;
  /** ISO date string (YYYY-MM-DD) when the habit was first created */
  createdAt: string;
  /** Dictionary of completion records keyed by date string (YYYY-MM-DD) */
  completions: Record<string, boolean>;
  /** Whether reminder day indicators are active for this habit */
  reminderEnabled?: boolean;
  /** Array of target weekday indices (0 = Sunday, 1 = Monday, ..., 6 = Saturday) */
  reminderDays?: number[];
  /** Preferred notification time (HH:MM) */
  reminderTime?: string;
}

/**
 * Record of an earned milestone achievement.
 */
export interface UnlockedMilestone {
  /** Unique identifier for the unlocked event */
  id: string;
  /** Reference to the milestone definition ID (e.g. 'streak-7') */
  milestoneId: string;
  /** Identifier of the habit that unlocked this milestone */
  habitId: string;
  /** Snapshot of the habit name when achieved */
  habitName: string;
  /** Target streak days achieved */
  days: number;
  /** ISO date string (YYYY-MM-DD) when the milestone was achieved */
  unlockedAt: string;
}

/**
 * Metadata definition for streak milestones and awards.
 */
export interface MilestoneDefinition {
  id: string;
  days: number;
  title: string;
  subtitle: string;
  description: string;
  icon: 'spark' | 'flame' | 'zap' | 'star' | 'trophy' | 'diamond' | 'crown';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
}

/**
 * Top-level persistent store schema saved to local storage.
 */
export interface HabitTrackerData {
  version: number;
  habits: Habit[];
  theme?: AppTheme;
  dailyReminderEnabled?: boolean;
  dailyReminderTime?: string; // "20:00"
  unlockedMilestones?: UnlockedMilestone[];
}

/**
 * Computed streak analytics for a specific habit.
 */
export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate30d: number;
  isCompletedToday: boolean;
}

/**
 * Single cell in the activity heatmap.
 */
export interface DaySquare {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isToday: boolean;
  isFuture: boolean;
  monthName: string;
  monthIndex: number;
  dayOfMonth: number;
}

/**
 * Column of 7 days representing a calendar week in the contribution grid.
 */
export interface WeekColumn {
  weekIndex: number;
  days: (DaySquare | null)[];
  monthLabel?: string;
}
