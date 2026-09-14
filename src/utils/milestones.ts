/**
 * Milestone & Achievement Definitions and Confetti Engine
 *
 * Configures streak threshold milestones (7, 30, 100 days, etc.)
 * and manages celebratory animations and badge unlock verifications.
 */

import confetti from 'canvas-confetti';
import { MilestoneDefinition, UnlockedMilestone, Habit } from '../types';
import { calculateStreaks, getTodayKey } from './dateUtils';

/**
 * Pre-configured list of streak achievements.
 * Targets prominent habit formation milestones:
 * - 3 days: Initial momentum
 * - 7 days: Complete 1-week streak
 * - 14 days: 2-week consistency
 * - 21 days: Neurological habit formation threshold
 * - 30 days: Full calendar month mastery
 * - 60 days: Sustained habit discipline
 * - 100 days: Century elite consistency
 * - 365 days: Full year dedication
 */
export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: 'streak-3',
    days: 3,
    title: 'Spark of Momentum',
    subtitle: '3-Day Streak',
    description: 'You completed 3 consecutive days. The initial spark has caught fire!',
    icon: 'spark',
    tier: 'bronze',
  },
  {
    id: 'streak-7',
    days: 7,
    title: 'Consistency Champion',
    subtitle: '7-Day Streak',
    description: 'A full week of non-stop execution. Your habit is starting to become second nature.',
    icon: 'flame',
    tier: 'bronze',
  },
  {
    id: 'streak-14',
    days: 14,
    title: 'Fortnight Focus',
    subtitle: '14-Day Streak',
    description: 'Two full weeks uninterrupted! You have weathered daily friction and persisted.',
    icon: 'zap',
    tier: 'silver',
  },
  {
    id: 'streak-21',
    days: 21,
    title: 'Habit Locked In',
    subtitle: '21-Day Streak',
    description: '21 days reached! Scientific research marks this as the threshold for automatic habits.',
    icon: 'star',
    tier: 'silver',
  },
  {
    id: 'streak-30',
    days: 30,
    title: 'Monthly Master',
    subtitle: '30-Day Streak',
    description: 'A legendary 30-day streak! Your dedication has redefined your daily routine.',
    icon: 'trophy',
    tier: 'gold',
  },
  {
    id: 'streak-60',
    days: 60,
    title: 'Iron Will',
    subtitle: '60-Day Streak',
    description: 'Two months of unwavering consistency. True discipline forged through action.',
    icon: 'diamond',
    tier: 'platinum',
  },
  {
    id: 'streak-100',
    days: 100,
    title: 'Century Legend',
    subtitle: '100-Day Streak',
    description: '100 consecutive days completed! You belong to the top 1% of disciplined builders.',
    icon: 'crown',
    tier: 'diamond',
  },
  {
    id: 'streak-365',
    days: 365,
    title: 'Yearly Titan',
    subtitle: '365-Day Streak',
    description: 'An entire year of unwavering commitment. An extraordinary life accomplishment.',
    icon: 'crown',
    tier: 'legendary',
  },
];

/**
 * Triggers a multi-stage celebratory confetti explosion across the viewport.
 * Uses canvas-confetti with physics simulation and multiple bursts.
 */
export function triggerCelebrationConfetti(): void {
  // Burst 1: Center burst with stars and circles
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff'],
    disableForReducedMotion: true,
  });

  // Burst 2: Left fountain
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#10b981', '#34d399', '#fbbf24', '#f43f5e'],
      disableForReducedMotion: true,
    });
  }, 180);

  // Burst 3: Right fountain
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#3b82f6', '#60a5fa', '#a855f7', '#fbbf24'],
      disableForReducedMotion: true,
    });
  }, 360);
}

/**
 * Checks if a habit has reached any new milestone that hasn't been unlocked yet.
 * Returns the highest newly reached milestone definition, or null if none.
 */
export function checkNewMilestones(
  habit: Habit,
  currentUnlocked: UnlockedMilestone[]
): { milestone: MilestoneDefinition; newRecord: UnlockedMilestone } | null {
  const streakInfo = calculateStreaks(habit.completions);
  const currentStreak = streakInfo.currentStreak;

  // Find milestones that this habit qualifies for based on current streak
  const eligibleMilestones = MILESTONE_DEFINITIONS.filter(
    (m) => currentStreak >= m.days
  );

  // Check from highest to lowest milestone
  const reversed = [...eligibleMilestones].reverse();

  for (const m of reversed) {
    // Check if this specific milestone for this habit has already been unlocked
    const alreadyUnlocked = currentUnlocked.some(
      (u) => u.habitId === habit.id && u.milestoneId === m.id
    );

    if (!alreadyUnlocked) {
      const newRecord: UnlockedMilestone = {
        id: `milestone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        milestoneId: m.id,
        habitId: habit.id,
        habitName: habit.name,
        days: m.days,
        unlockedAt: getTodayKey(),
      };

      return {
        milestone: m,
        newRecord,
      };
    }
  }

  return null;
}
