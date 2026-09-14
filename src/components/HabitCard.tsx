/**
 * Habit Card Component
 *
 * Represents an individual tracked habit with comprehensive statistics and interactive controls:
 * - Direct check-in toggle button for today with animated checkmark and sound feedback
 * - Editable habit name with inline form save/cancel
 * - Key metrics: current streak, best streak, 30-day consistency percentage, total completions
 * - Reminder day scheduler with weekday toggles and preset buttons (daily, weekdays, weekends)
 * - GitHub-style 365-day contribution heatmap with interactive date clicking and view switcher
 * - Safe deletion confirmation barrier
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Flame,
  Trophy,
  Trash2,
  Calendar,
  Layers,
  Edit2,
  X,
  Sparkles,
  Bell,
  BellOff,
} from 'lucide-react';
import { Habit, AppTheme } from '../types';
import { calculateStreaks, getTodayKey, formatFullDate } from '../utils/dateUtils';
import { HeatmapGrid } from './HeatmapGrid';
import { playChime } from '../utils/audio';

interface HabitCardProps {
  /** Habit data object */
  habit: Habit;
  /** Callback fired when toggling today's completion */
  onToggleToday: (habitId: string) => void;
  /** Callback fired when clicking an arbitrary date square in the heatmap */
  onToggleDate: (habitId: string, dateKey: string) => void;
  /** Callback fired when confirming habit deletion */
  onDelete: (habitId: string) => void;
  /** Callback fired when renaming a habit */
  onRename: (habitId: string, newName: string) => void;
  /** Callback fired to toggle the reminder state on or off */
  onToggleReminder: (habitId: string) => void;
  /** Callback fired when toggling a specific weekday index (0-6) */
  onToggleReminderDay: (habitId: string, dayOfWeek: number) => void;
  /** Callback fired when setting a reminder schedule preset */
  onSetReminderPreset: (habitId: string, preset: 'weekdays' | 'weekends' | 'daily') => void;
  /** Active UI color theme ('dark' | 'light') */
  theme?: AppTheme;
}

const WEEKDAYS_CONFIG = [
  { day: 0, short: 'Su', full: 'Sunday' },
  { day: 1, short: 'Mo', full: 'Monday' },
  { day: 2, short: 'Tu', full: 'Tuesday' },
  { day: 3, short: 'We', full: 'Wednesday' },
  { day: 4, short: 'Th', full: 'Thursday' },
  { day: 5, short: 'Fr', full: 'Friday' },
  { day: 6, short: 'Sa', full: 'Saturday' },
];

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleToday,
  onToggleDate,
  onDelete,
  onRename,
  onToggleReminder,
  onToggleReminderDay,
  onSetReminderPreset,
  theme = 'dark',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(habit.name);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [viewVariant, setViewVariant] = useState<'github-horizontal' | 'calendar-vertical'>('github-horizontal');

  const todayKey = getTodayKey();
  const todayDate = new Date();
  const todayDayOfWeek = todayDate.getDay();
  const isDoneToday = Boolean(habit.completions[todayKey]);
  const streakInfo = calculateStreaks(habit.completions);

  const reminderDays = habit.reminderDays || [];
  const reminderEnabled = Boolean(habit.reminderEnabled);
  const isTodayReminder = reminderEnabled && reminderDays.includes(todayDayOfWeek);
  const isDark = theme === 'dark';

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim() && editedName.trim() !== habit.name) {
      onRename(habit.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCheckInClick = () => {
    onToggleToday(habit.id);
    playChime(isDoneToday ? 'reminder' : 'complete');
  };

  return (
    <motion.div
      id={`habit-card-${habit.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border transition-all duration-200 p-5 space-y-4 shadow-sm hover:shadow-md ${
        isDark
          ? 'bg-[#161b22] border-[#30363d] shadow-black/20 hover:border-zinc-600'
          : 'bg-white border-zinc-200/90 shadow-zinc-200/40 hover:border-zinc-300'
      }`}
    >
      {/* Card Header: Title, Check-in status, actions */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
          isDark ? 'border-[#30363d]' : 'border-zinc-100'
        }`}
      >
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className={`text-lg font-semibold px-2.5 py-1 rounded-md focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full max-w-sm border ${
                  isDark
                    ? 'bg-[#0d1117] border-zinc-700 text-zinc-100'
                    : 'bg-white border-zinc-300 text-zinc-900'
                }`}
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md transition-colors cursor-pointer"
              >
                Save
              </motion.button>
              <button
                type="button"
                onClick={() => {
                  setEditedName(habit.name);
                  setIsEditing(false);
                }}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3
                className={`text-base sm:text-lg font-bold truncate ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                {habit.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-200 rounded transition-opacity cursor-pointer"
                title="Rename habit"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="text-xs text-zinc-400 mt-0.5 flex flex-wrap items-center gap-2">
            <span>Started {formatFullDate(habit.createdAt)}</span>
            <span>•</span>
            <span>{streakInfo.totalCompletions} total check-ins</span>
            {isTodayReminder && (
              <>
                <span>•</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[11px] font-medium flex items-center gap-1 ${
                    isDoneToday
                      ? isDark
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDark
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800 animate-pulse'
                      : 'bg-amber-50 text-amber-700 border border-amber-300'
                  }`}
                >
                  <Bell className="w-3 h-3" />
                  {isDoneToday ? 'Reminder done today' : 'Reminder scheduled for today'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Side Controls: Animated "Mark Done Today" Button & Delete */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <motion.button
            id={`mark-done-today-${habit.id}`}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03 }}
            type="button"
            onClick={handleCheckInClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border cursor-pointer ${
              isDoneToday
                ? isDark
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : isDark
                ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800 shadow-xs'
            }`}
          >
            <motion.div
              animate={{ rotate: isDoneToday ? 360 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                isDoneToday
                  ? 'bg-emerald-500 text-zinc-950 font-black'
                  : isDark
                  ? 'border border-emerald-200'
                  : 'border border-zinc-400'
              }`}
            >
              {isDoneToday && <Check className="w-3 h-3 stroke-[3]" />}
            </motion.div>
            <span>{isDoneToday ? 'Done Today' : 'Check In Today'}</span>
          </motion.button>

          {showConfirmDelete ? (
            <div
              className={`flex items-center gap-1 p-1 rounded-lg border ${
                isDark ? 'bg-red-950/40 border-red-800' : 'bg-red-50 border-red-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onDelete(habit.id)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-medium transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className={`text-xs px-1.5 py-1 rounded cursor-pointer ${
                  isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-800'
                }`}
              >
                Cancel
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? 'text-zinc-400 hover:text-red-400 hover:bg-red-950/40'
                  : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Delete habit"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Streak Stats Bar with badges */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl border ${
          isDark
            ? 'bg-[#0d1117] border-[#30363d]'
            : 'bg-zinc-50/70 border-zinc-100'
        }`}
      >
        {/* Current Streak */}
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-100 text-orange-600'
            }`}
          >
            <Flame className="w-5 h-5 fill-orange-500/30" />
          </motion.div>
          <div>
            <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Current Streak
            </div>
            <div className={`text-base font-bold flex items-baseline gap-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              <span>{streakInfo.currentStreak}</span>
              <span className={`text-xs font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {streakInfo.currentStreak === 1 ? 'day' : 'days'}
              </span>
              {streakInfo.currentStreak > 0 && streakInfo.isCompletedToday && (
                <span className="text-[10px] text-emerald-400 font-semibold ml-1">Active</span>
              )}
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.15, rotate: -5 }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <Trophy className="w-5 h-5 fill-amber-500/30" />
          </motion.div>
          <div>
            <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Best Streak
            </div>
            <div className={`text-base font-bold flex items-baseline gap-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              <span>{streakInfo.longestStreak}</span>
              <span className={`text-xs font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {streakInfo.longestStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
        </div>

        {/* 30-Day Completion Rate */}
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.15 }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-600'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          <div>
            <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Last 30 Days
            </div>
            <div className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {streakInfo.completionRate30d}%
            </div>
          </div>
        </div>

        {/* Total Days Done */}
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.15 }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-sky-100 text-sky-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </motion.div>
          <div>
            <div className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Total Logged
            </div>
            <div className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {streakInfo.totalCompletions} <span className={`text-xs font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Status & Specific Days Selector */}
      <div
        className={`p-3 rounded-xl border space-y-2.5 ${
          isDark
            ? 'bg-[#0d1117] border-[#30363d]'
            : 'bg-zinc-50/70 border-zinc-150'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Simple toggle button for Reminder Status */}
            <motion.button
              id={`reminder-toggle-${habit.id}`}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => onToggleReminder(habit.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border cursor-pointer ${
                reminderEnabled
                  ? 'bg-amber-500 text-zinc-950 border-amber-600 shadow-xs font-semibold'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  : 'bg-white text-zinc-600 border-zinc-250 hover:bg-zinc-100'
              }`}
              title={reminderEnabled ? 'Click to turn reminders off' : 'Click to turn reminders on'}
            >
              {reminderEnabled ? (
                <Bell className="w-3.5 h-3.5 fill-zinc-950" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>{reminderEnabled ? 'Reminder: ON' : 'Reminder: OFF'}</span>
            </motion.button>

            <span className={`text-xs hidden sm:inline ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {reminderEnabled
                ? 'Highlights scheduled target days on the heatmap'
                : 'Turn on to highlight scheduled days on heatmap'}
            </span>
          </div>

          {/* Quick presets for days */}
          {reminderEnabled && (
            <div className="flex items-center gap-1 text-[11px]">
              <span className={`mr-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Presets:</span>
              <button
                type="button"
                onClick={() => onSetReminderPreset(habit.id, 'daily')}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                    : 'bg-white hover:bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => onSetReminderPreset(habit.id, 'weekdays')}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                    : 'bg-white hover:bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}
              >
                Mon–Fri
              </button>
              <button
                type="button"
                onClick={() => onSetReminderPreset(habit.id, 'weekends')}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                    : 'bg-white hover:bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}
              >
                Weekends
              </button>
            </div>
          )}
        </div>

        {/* Days of the Week Chips */}
        {reminderEnabled && (
          <div
            className={`pt-2 border-t flex flex-wrap items-center gap-2 ${
              isDark ? 'border-[#30363d]' : 'border-zinc-200/60'
            }`}
          >
            <span className={`text-[11px] font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              Reminder days:
            </span>
            <div className="flex items-center gap-1">
              {WEEKDAYS_CONFIG.map(({ day, short, full }) => {
                const isSelected = reminderDays.includes(day);
                return (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.08 }}
                    type="button"
                    onClick={() => onToggleReminderDay(habit.id, day)}
                    className={`w-7 h-7 rounded-md text-xs font-medium transition-all flex items-center justify-center cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-zinc-950 border-amber-500 font-bold ring-1 ring-amber-400/40 shadow-xs'
                        : isDark
                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:bg-zinc-750'
                        : 'bg-white text-zinc-400 border-zinc-200 hover:text-zinc-700 hover:bg-zinc-50'
                    }`}
                    title={`${full} (${isSelected ? 'Active reminder' : 'No reminder'})`}
                  >
                    {short}
                  </motion.button>
                );
              })}
            </div>
            <span className={`text-[11px] ml-auto ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>
              {reminderDays.length === 7
                ? 'Active every day'
                : reminderDays.length === 0
                ? 'No days selected'
                : `${reminderDays.length} day${reminderDays.length === 1 ? '' : 's'}/week`}
            </span>
          </div>
        )}
      </div>

      {/* Heatmap Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
            <Layers className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-zinc-500'}`} />
            Consistency Heatmap (Last 365 Days)
          </span>

          {/* View toggle (GitHub 53-week graph vs Calendar vertical) */}
          <div
            className={`inline-flex rounded-lg p-0.5 text-[11px] border ${
              isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewVariant('github-horizontal')}
              className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
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
              className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
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

        <div
          className={`p-3.5 rounded-xl border ${
            isDark
              ? 'bg-[#0d1117] border-[#30363d]'
              : 'bg-zinc-50/50 border-zinc-100'
          }`}
        >
          <HeatmapGrid
            completions={habit.completions}
            onToggleDate={(dateKey) => onToggleDate(habit.id, dateKey)}
            habitName={habit.name}
            colorScheme={habit.color || 'emerald'}
            variant={viewVariant}
            reminderEnabled={reminderEnabled}
            reminderDays={reminderDays}
            theme={theme}
          />
        </div>
      </div>
    </motion.div>
  );
};
