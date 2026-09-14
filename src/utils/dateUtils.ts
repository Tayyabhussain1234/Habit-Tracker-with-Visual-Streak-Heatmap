/**
 * Date & Streak Mathematics Engine
 *
 * Implements pure date manipulations, contribution grid generation,
 * and robust streak calculation algorithms without external date libraries.
 */

import { DaySquare, WeekColumn, StreakInfo } from '../types';

/**
 * Formats a given Date instance into a standardized ISO date key (YYYY-MM-DD)
 * using local calendar time to prevent timezone offset discrepancies.
 *
 * @param date - Input Date instance
 * @returns Standardized "YYYY-MM-DD" string
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a "YYYY-MM-DD" key string into a clean local midnight Date instance.
 *
 * @param dateKey - ISO date string formatted as "YYYY-MM-DD"
 * @returns Date instance initialized at 00:00:00 local time
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Produces a human-friendly date string (e.g., "Monday, Sep 14, 2026").
 *
 * @param date - Date instance or "YYYY-MM-DD" string
 * @returns Human-readable formatted date string
 */
export function formatFullDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns today's ISO date string ("YYYY-MM-DD").
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Adds or subtracts integer calendar days from a reference date.
 *
 * @param date - Base Date object
 * @param days - Integer number of days to offset (positive or negative)
 * @returns New Date instance with offset applied
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generates a 53-week contribution matrix formatted identically to GitHub's contribution graph.
 *
 * Grid Structure:
 * - Columns: 53 calendar weeks arranged horizontally chronologically.
 * - Rows: 7 days per week starting from Sunday (index 0) to Saturday (index 6).
 * - Bounded on the right by the end of the current calendar week.
 *
 * @param endDate - Reference date (defaults to current date)
 * @returns Array of 53 WeekColumn structures
 */
export function generateGitHubWeeksGrid(endDate: Date = new Date()): WeekColumn[] {
  const todayKey = formatDateKey(endDate);
  const currentDayOfWeek = endDate.getDay(); // 0 is Sunday, 6 is Saturday

  // Display approximately 53 weeks (53 * 7 = 371 days)
  const totalWeeks = 53;
  const totalDays = totalWeeks * 7;

  // Align grid to the upcoming Saturday so today sits naturally in the final week column
  const daysUntilSaturday = 6 - currentDayOfWeek;
  const gridEndDate = addDays(endDate, daysUntilSaturday);
  const gridStartDate = addDays(gridEndDate, -(totalDays - 1));

  const weeks: WeekColumn[] = [];
  let currentMonthTracked = -1;

  for (let w = 0; w < totalWeeks; w++) {
    const days: (DaySquare | null)[] = [];
    let monthLabelForWeek: string | undefined = undefined;

    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + d;
      const dayDate = addDays(gridStartDate, dayOffset);
      const dayDateKey = formatDateKey(dayDate);
      const isFuture = dayDateKey > todayKey;
      const isToday = dayDateKey === todayKey;
      const monthIndex = dayDate.getMonth();
      const dayOfMonth = dayDate.getDate();

      // Attach month label on the first occurrence of a new month in this column
      if (dayOfMonth <= 7 && monthIndex !== currentMonthTracked && !isFuture) {
        currentMonthTracked = monthIndex;
        monthLabelForWeek = dayDate.toLocaleDateString('en-US', { month: 'short' });
      }

      days.push({
        date: dayDate,
        dateKey: dayDateKey,
        dayOfWeek: d,
        isToday,
        isFuture,
        monthName: dayDate.toLocaleDateString('en-US', { month: 'short' }),
        monthIndex,
        dayOfMonth,
      });
    }

    weeks.push({
      weekIndex: w,
      days,
      monthLabel: monthLabelForWeek,
    });
  }

  return weeks;
}

/**
 * Computes streak statistics for a habit's completion dictionary.
 *
 * Algorithms:
 * 1. Current Streak:
 *    - If today is completed, walk backwards from today consecutively.
 *    - If today is pending but yesterday was completed, the streak remains intact
 *      (grace period until end of day), walking backwards from yesterday.
 *    - If neither today nor yesterday was completed, current streak is 0.
 *
 * 2. Longest Streak:
 *    - Sorts all historical completion keys chronologically.
 *    - Iterates and counts consecutive day chains (difference == 1 day) to record the all-time peak.
 *
 * 3. 30-Day Completion Rate:
 *    - Inspects the trailing 30 calendar days to compute an exact adherence percentage.
 *
 * @param completions - Record of boolean completion flags keyed by date string
 * @param referenceDate - Reference base date (defaults to now)
 * @returns Computed StreakInfo metrics
 */
export function calculateStreaks(
  completions: Record<string, boolean>,
  referenceDate: Date = new Date()
): StreakInfo {
  const todayKey = formatDateKey(referenceDate);
  const yesterdayKey = formatDateKey(addDays(referenceDate, -1));

  const isCompletedToday = Boolean(completions[todayKey]);

  // Determine starting point for current streak traversal
  let currentStreak = 0;
  let checkDate = isCompletedToday
    ? referenceDate
    : completions[yesterdayKey]
    ? addDays(referenceDate, -1)
    : null;

  if (checkDate) {
    while (true) {
      const key = formatDateKey(checkDate);
      if (completions[key]) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across history
  const completedDateKeys = Object.keys(completions)
    .filter((key) => completions[key] && key <= todayKey)
    .sort();

  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dateKey of completedDateKeys) {
    const curDate = parseDateKey(dateKey);
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = curDate;
  }

  const totalCompletions = completedDateKeys.length;

  // 30-day adherence rate
  let last30DaysCount = 0;
  for (let i = 0; i < 30; i++) {
    const d = addDays(referenceDate, -i);
    const key = formatDateKey(d);
    if (completions[key]) {
      last30DaysCount++;
    }
  }
  const completionRate30d = Math.round((last30DaysCount / 30) * 100);

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRate30d,
    isCompletedToday,
  };
}
