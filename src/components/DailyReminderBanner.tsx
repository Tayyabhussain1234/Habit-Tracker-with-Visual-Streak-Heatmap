/**
 * Daily Reminder Banner Component
 *
 * Provides an interactive daily reminder control center at the top of the dashboard:
 * - Shows today's scheduled habits with live check-in progress
 * - Allows configuring the daily reminder notification time (stored in localStorage)
 * - Offers a test chime button using the Web Audio API
 * - Quick check-in action buttons for all scheduled habits
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Volume2,
  Check,
} from 'lucide-react';
import { Habit, AppTheme } from '../types';
import { getTodayKey } from '../utils/dateUtils';
import { playChime } from '../utils/audio';

interface DailyReminderBannerProps {
  /** Array of active habits */
  habits: Habit[];
  /** Callback fired to toggle completion status for today's date */
  onToggleToday: (habitId: string) => void;
  /** Whether daily reminders are enabled globally */
  dailyReminderEnabled: boolean;
  /** Scheduled daily reminder time in "HH:MM" format */
  dailyReminderTime: string;
  /** Callback to persist updated reminder settings */
  onUpdateDailyReminder: (enabled: boolean, time: string) => void;
  /** Active UI color theme ('dark' | 'light') */
  theme?: AppTheme;
}

export const DailyReminderBanner: React.FC<DailyReminderBannerProps> = ({
  habits,
  onToggleToday,
  dailyReminderEnabled,
  dailyReminderTime,
  onUpdateDailyReminder,
  theme = 'dark',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [selectedTime, setSelectedTime] = useState(dailyReminderTime || '20:00');
  const [testNotificationActive, setTestNotificationActive] = useState(false);

  const todayDate = new Date();
  const todayDayOfWeek = todayDate.getDay();
  const todayKey = getTodayKey();

  // Find habits scheduled for today
  const scheduledToday = habits.filter((habit) => {
    if (!habit.reminderEnabled) return false;
    const days = habit.reminderDays || [];
    return days.includes(todayDayOfWeek);
  });

  const habitsToTrack = scheduledToday.length > 0 ? scheduledToday : habits;
  const pendingHabits = habitsToTrack.filter((h) => !h.completions[todayKey]);
  const completedHabits = habitsToTrack.filter((h) => h.completions[todayKey]);
  const isAllDone = habitsToTrack.length > 0 && pendingHabits.length === 0;

  const handleTestReminder = () => {
    playChime('reminder');
    setTestNotificationActive(true);
    setTimeout(() => setTestNotificationActive(false), 4000);
  };

  const handleSaveTime = () => {
    onUpdateDailyReminder(dailyReminderEnabled, selectedTime);
    setIsEditingTime(false);
  };

  // Convert 24-hour military time string to 12-hour format with AM/PM
  const formatDisplayTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  };

  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden ${
        isDark
          ? 'bg-linear-to-b from-[#161b22] to-[#0d1117] border-[#30363d]'
          : 'bg-linear-to-b from-amber-50/50 to-white border-amber-200/80 shadow-amber-500/5'
      }`}
    >
      {/* Test notification toast banner */}
      <AnimatePresence>
        {testNotificationActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-zinc-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-bounce" />
              <span>🔔 Daily Habit Reminder: You have {pendingHabits.length} pending habit{pendingHabits.length === 1 ? '' : 's'} scheduled for today!</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black/10 rounded">
              Active alert
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Header line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isAllDone
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isAllDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bell className="w-5 h-5 text-amber-400 fill-amber-400/20 animate-pulse" />
              )}
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm sm:text-base font-bold ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}
                >
                  Daily Habit Reminder
                </h3>
                <button
                  type="button"
                  onClick={() => onUpdateDailyReminder(!dailyReminderEnabled, dailyReminderTime)}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all border cursor-pointer ${
                    dailyReminderEnabled
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                  }`}
                >
                  {dailyReminderEnabled ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {isAllDone ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> All scheduled habits completed today!
                  </span>
                ) : (
                  <span>
                    {pendingHabits.length} habit{pendingHabits.length === 1 ? '' : 's'} waiting for today's check-in
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right Controls: Time Setting, Test Chime, Collapse */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex items-center">
              {isEditingTime ? (
                <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-lg border border-zinc-700">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTime}
                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] rounded font-medium cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTime(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                      : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                  title="Change daily reminder time"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatDisplayTime(dailyReminderTime || '20:00')}</span>
                </button>
              )}
            </div>

            {/* Test Chime button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleTestReminder}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}
              title="Test reminder chime"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
            </motion.button>

            {/* Expand / Collapse */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 border-zinc-700'
                  : 'bg-white hover:bg-zinc-100 text-zinc-500 border-zinc-200'
              }`}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Checklist for Today */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pt-2 border-t border-zinc-800/40 space-y-2 overflow-hidden"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Today's Habit Checklist</span>
                <span>
                  {completedHabits.length} of {habitsToTrack.length} Completed
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${habitsToTrack.length ? (completedHabits.length / habitsToTrack.length) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              {/* Habit items pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {habitsToTrack.map((habit) => {
                  const isDone = Boolean(habit.completions[todayKey]);
                  return (
                    <motion.div
                      key={habit.id}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isDone
                          ? isDark
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                            : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                          : isDark
                          ? 'bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700/60 text-zinc-200'
                          : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isDone ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                          }`}
                        />
                        <span
                          className={`text-xs font-medium truncate ${
                            isDone ? 'line-through opacity-75' : ''
                          }`}
                        >
                          {habit.name}
                        </span>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => {
                          onToggleToday(habit.id);
                          playChime(isDone ? 'reminder' : 'complete');
                        }}
                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-xs'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Done</span>
                          </>
                        ) : (
                          <span>Check In</span>
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
