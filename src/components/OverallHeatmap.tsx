/**
 * Overall Heatmap & Aggregated Consistency Matrix Component
 *
 * Computes an aggregated activity map overlaying check-ins across all user habits.
 * Renders high-level productivity metrics:
 * - Today's check-in progress (X of Y done)
 * - Maximum active streak across any habit
 * - Total lifetime check-ins
 * - Multi-level contribution grid with 4 intensity gradations
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Layers, CalendarCheck2, Flame } from 'lucide-react';
import { Habit, AppTheme } from '../types';
import { getTodayKey, calculateStreaks } from '../utils/dateUtils';
import { HeatmapGrid } from './HeatmapGrid';

interface OverallHeatmapProps {
  /** List of all habits */
  habits: Habit[];
  /** Optional date toggle callback */
  onToggleDate?: (dateKey: string) => void;
  /** Active UI color theme ('dark' | 'light') */
  theme?: AppTheme;
}

export const OverallHeatmap: React.FC<OverallHeatmapProps> = ({ habits, theme = 'dark' }) => {
  const [viewVariant, setViewVariant] = useState<'github-horizontal' | 'calendar-vertical'>('github-horizontal');
  const todayKey = getTodayKey();
  const isDark = theme === 'dark';

  // Aggregate completion counts per dateKey across all habits
  const aggregateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const habit of habits) {
      for (const [dateKey, isDone] of Object.entries(habit.completions)) {
        if (isDone) {
          counts[dateKey] = (counts[dateKey] || 0) + 1;
        }
      }
    }
    return counts;
  }, [habits]);

  // Total check-ins across all habits
  const totalAllCompletions = useMemo(() => {
    return Object.values(aggregateCounts).reduce((acc: number, count: number) => acc + count, 0);
  }, [aggregateCounts]);

  // Today's completion count
  const habitsDoneToday = useMemo(() => {
    return habits.filter((h) => h.completions[todayKey]).length;
  }, [habits, todayKey]);

  // Highest active streak across all habits
  const maxActiveStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((h) => calculateStreaks(h.completions).currentStreak), 0);
  }, [habits]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border p-5 space-y-4 shadow-sm ${
        isDark
          ? 'bg-[#161b22] border-[#30363d]'
          : 'bg-white border-zinc-200/90'
      }`}
    >
      {/* Top Bar of the Overview */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
          isDark ? 'border-[#30363d]' : 'border-zinc-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Overall Consistency Matrix
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Aggregated daily consistency across all {habits.length} habit{habits.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* View Variant Toggle */}
        <div
          className={`inline-flex rounded-lg p-0.5 text-[11px] border self-start sm:self-center ${
            isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setViewVariant('github-horizontal')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewVariant === 'github-horizontal'
                ? isDark
                  ? 'bg-zinc-700 text-white font-medium shadow-xs'
                  : 'bg-white text-zinc-900 font-medium shadow-2xs'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            52 Weeks
          </button>
          <button
            type="button"
            onClick={() => setViewVariant('calendar-vertical')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewVariant === 'calendar-vertical'
                ? isDark
                  ? 'bg-zinc-700 text-white font-medium shadow-xs'
                  : 'bg-white text-zinc-900 font-medium shadow-2xs'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          whileHover={{ y: -2 }}
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-50 border-zinc-100'
          }`}
        >
          <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Today's Progress
          </div>
          <div
            className={`text-lg font-bold flex items-baseline gap-1 mt-0.5 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            <span>
              {habitsDoneToday} / {habits.length}
            </span>
            <span className={`text-xs font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              habits
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-50 border-zinc-100'
          }`}
        >
          <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Max Active Streak
          </div>
          <div className="text-lg font-bold text-orange-500 flex items-baseline gap-1.5 mt-0.5">
            <Flame className="w-4 h-4 fill-orange-500/20" />
            <span>{maxActiveStreak}</span>
            <span className={`text-xs font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              days
            </span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-50 border-zinc-100'
          }`}
        >
          <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Total Check-Ins
          </div>
          <div
            className={`text-lg font-bold flex items-baseline gap-1.5 mt-0.5 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
            <span>{totalAllCompletions}</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className={`p-3 rounded-xl border ${
            isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-50 border-zinc-100'
          }`}
        >
          <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Active Habits
          </div>
          <div
            className={`text-lg font-bold flex items-baseline gap-1.5 mt-0.5 ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>{habits.length}</span>
          </div>
        </motion.div>
      </div>

      {/* Combined Heatmap */}
      <div
        className={`p-3.5 rounded-xl border ${
          isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-50/50 border-zinc-100'
        }`}
      >
        <HeatmapGrid
          completions={{}}
          aggregateCounts={aggregateCounts}
          maxAggregate={Math.max(habits.length, 4)}
          variant={viewVariant}
          theme={theme}
        />
      </div>
    </motion.div>
  );
};
