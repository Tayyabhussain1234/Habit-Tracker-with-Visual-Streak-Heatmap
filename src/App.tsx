/**
 * Habit Tracker Application Entry Point
 *
 * A client-side habit tracking dashboard featuring:
 * - GitHub-style 365-day visual streak heatmaps with custom-built date rendering
 * - Real-time habit check-ins and streaks calculation (current, best, 30-day rate)
 * - Milestone achievement awards (3, 7, 14, 21, 30, 60, 100, 365 days) with celebratory confetti
 * - Scheduled daily reminder banner with customizable notification times and Web Audio chimes
 * - Overall consistency matrix aggregating check-ins across all habits
 * - Dark and Light color theme toggles
 * - Robust client-side local storage synchronization with JSON backup export and import
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Calendar,
  RotateCcw,
  Download,
  Upload,
  Layers,
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Habit, HabitTrackerData, AppTheme, MilestoneDefinition, UnlockedMilestone } from './types';
import { loadHabitData, saveHabitData, getDefaultHabits } from './utils/storage';
import { formatDateKey, getTodayKey, formatFullDate } from './utils/dateUtils';
import { HabitCard } from './components/HabitCard';
import { AddHabitForm } from './components/AddHabitForm';
import { OverallHeatmap } from './components/OverallHeatmap';
import { DailyReminderBanner } from './components/DailyReminderBanner';
import { MilestoneCelebrationModal } from './components/MilestoneCelebrationModal';
import { MilestoneShowcase } from './components/MilestoneShowcase';
import { checkNewMilestones, triggerCelebrationConfetti } from './utils/milestones';
import { playChime } from './utils/audio';

export default function App() {
  const [trackerData, setTrackerData] = useState<HabitTrackerData>(() => loadHabitData());
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'streak' | 'name'>('default');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active milestone celebration overlay state
  const [celebratingMilestone, setCelebratingMilestone] = useState<{
    milestone: MilestoneDefinition;
    record: UnlockedMilestone;
  } | null>(null);

  // Theme normalization: support only 'dark' and 'light'
  const currentTheme: AppTheme = trackerData.theme === 'light' ? 'light' : 'dark';
  const isDark = currentTheme === 'dark';
  const lastTriggeredTimeRef = useRef<string>('');
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Synchronize state with browser localStorage on every mutation
  useEffect(() => {
    saveHabitData({
      ...trackerData,
      theme: currentTheme,
    });
  }, [trackerData, currentTheme]);

  /**
   * Displays temporary toast banner in bottom right.
   */
  const showNotification = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  /**
   * Switches the application color scheme between Dark and Light.
   */
  const handleChangeTheme = (newTheme: AppTheme) => {
    setTrackerData((prev) => ({
      ...prev,
      theme: newTheme,
    }));
    showNotification(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme`);
  };

  /**
   * Updates global daily reminder status and scheduled time.
   */
  const handleUpdateDailyReminder = (enabled: boolean, time: string) => {
    setTrackerData((prev) => ({
      ...prev,
      dailyReminderEnabled: enabled,
      dailyReminderTime: time,
    }));
    showNotification(
      enabled ? `Daily reminder set for ${time}` : 'Daily reminders paused'
    );
  };

  /**
   * Periodically checks if the current time matches the scheduled daily reminder.
   */
  useEffect(() => {
    const checkReminderTime = () => {
      if (!trackerData.dailyReminderEnabled || !trackerData.dailyReminderTime) return;

      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentH}:${currentM}`;

      if (
        currentTimeStr === trackerData.dailyReminderTime &&
        lastTriggeredTimeRef.current !== currentTimeStr
      ) {
        lastTriggeredTimeRef.current = currentTimeStr;
        const todayKey = getTodayKey();
        const pendingCount = trackerData.habits.filter((h) => !h.completions[todayKey]).length;

        if (pendingCount > 0) {
          if (soundEnabled) playChime('reminder');
          showNotification(
            `🔔 Reminder Time (${currentTimeStr}): You have ${pendingCount} habit${
              pendingCount === 1 ? '' : 's'
            } waiting for check-in today!`
          );
        }
      }
    };

    const interval = setInterval(checkReminderTime, 30000);
    return () => clearInterval(interval);
  }, [trackerData.dailyReminderEnabled, trackerData.dailyReminderTime, trackerData.habits, soundEnabled]);

  /**
   * Appends a new habit entity to the user's habit list.
   */
  const handleAddHabit = (name: string, color: string) => {
    const today = new Date();
    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      color,
      createdAt: formatDateKey(today),
      completions: {},
      reminderEnabled: true,
      reminderDays: [1, 2, 3, 4, 5],
    };

    setTrackerData((prev) => ({
      ...prev,
      habits: [newHabit, ...prev.habits],
    }));

    if (soundEnabled) playChime('complete');
    showNotification(`Added habit "${name}"`);
  };

  /**
   * Toggles reminder indicator visibility on the heatmap for a habit.
   */
  const handleToggleReminder = (habitId: string) => {
    setTrackerData((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const willEnable = !habit.reminderEnabled;
        const currentDays =
          habit.reminderDays && habit.reminderDays.length > 0
            ? habit.reminderDays
            : [1, 2, 3, 4, 5];
        return {
          ...habit,
          reminderEnabled: willEnable,
          reminderDays: currentDays,
        };
      }),
    }));
  };

  /**
   * Toggles a specific weekday index (0 = Sunday through 6 = Saturday).
   */
  const handleToggleReminderDay = (habitId: string, dayOfWeek: number) => {
    setTrackerData((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const currentDays = habit.reminderDays || [];
        const newDays = currentDays.includes(dayOfWeek)
          ? currentDays.filter((d) => d !== dayOfWeek)
          : [...currentDays, dayOfWeek].sort((a, b) => a - b);
        return {
          ...habit,
          reminderDays: newDays,
          reminderEnabled: true,
        };
      }),
    }));
  };

  /**
   * Sets scheduled reminder days to common presets (daily, weekdays, weekends).
   */
  const handleSetReminderPreset = (habitId: string, preset: 'weekdays' | 'weekends' | 'daily') => {
    let presetDays = [1, 2, 3, 4, 5];
    if (preset === 'daily') presetDays = [0, 1, 2, 3, 4, 5, 6];
    if (preset === 'weekends') presetDays = [0, 6];

    setTrackerData((prev) => ({
      ...prev,
      habits: prev.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        return {
          ...habit,
          reminderEnabled: true,
          reminderDays: presetDays,
        };
      }),
    }));
  };

  /**
   * Removes a habit from tracking.
   */
  const handleDeleteHabit = (habitId: string) => {
    setTrackerData((prev) => {
      const target = prev.habits.find((h) => h.id === habitId);
      const updated = prev.habits.filter((h) => h.id !== habitId);
      if (target) {
        showNotification(`Deleted "${target.name}"`);
      }
      return { ...prev, habits: updated };
    });
  };

  /**
   * Updates display name for an existing habit.
   */
  const handleRenameHabit = (habitId: string, newName: string) => {
    setTrackerData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, name: newName } : h)),
    }));
    showNotification(`Updated habit name`);
  };

  /**
   * Toggles today's completion status for a habit.
   */
  const handleToggleToday = (habitId: string) => {
    const todayKey = getTodayKey();
    handleToggleDate(habitId, todayKey);
  };

  /**
   * Toggles completion on any past or present date key.
   * Checks for newly achieved streak milestones (e.g. 7, 30, 100 days)
   * and launches celebratory effects if a milestone threshold is crossed.
   */
  const handleToggleDate = (habitId: string, dateKey: string) => {
    setTrackerData((prev) => {
      const existingUnlocked = prev.unlockedMilestones || [];
      let updatedHabitTarget: Habit | null = null;

      const updatedHabits = prev.habits.map((habit) => {
        if (habit.id !== habitId) return habit;

        const newCompletions = { ...habit.completions };
        if (newCompletions[dateKey]) {
          delete newCompletions[dateKey];
        } else {
          newCompletions[dateKey] = true;
        }

        const modified: Habit = {
          ...habit,
          completions: newCompletions,
        };
        updatedHabitTarget = modified;
        return modified;
      });

      // Check if this completion reached a new milestone
      let newlyUnlockedRecord: UnlockedMilestone | null = null;
      let milestoneMatch: MilestoneDefinition | null = null;

      if (updatedHabitTarget) {
        const milestoneCheck = checkNewMilestones(updatedHabitTarget, existingUnlocked);
        if (milestoneCheck) {
          milestoneMatch = milestoneCheck.milestone;
          newlyUnlockedRecord = milestoneCheck.newRecord;
        }
      }

      if (milestoneMatch && newlyUnlockedRecord) {
        // Trigger celebratory audio and modal
        if (soundEnabled) playChime('milestone');
        triggerCelebrationConfetti();
        setCelebratingMilestone({
          milestone: milestoneMatch,
          record: newlyUnlockedRecord,
        });

        return {
          ...prev,
          habits: updatedHabits,
          unlockedMilestones: [...existingUnlocked, newlyUnlockedRecord],
        };
      }

      return {
        ...prev,
        habits: updatedHabits,
      };
    });
  };

  /**
   * Replaces current storage state with populated starter habits.
   */
  const handleResetToSample = () => {
    if (window.confirm('Reset habits back to the sample dataset? Current data will be replaced.')) {
      const samples = getDefaultHabits();
      const updated: HabitTrackerData = {
        version: 1,
        habits: samples,
        theme: currentTheme,
        dailyReminderEnabled: true,
        dailyReminderTime: '20:00',
        unlockedMilestones: [],
      };
      setTrackerData(updated);
      saveHabitData(updated);
      showNotification('Reset to sample habits');
    }
  };

  /**
   * Exports tracker records as a downloadable JSON file.
   */
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(trackerData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit_tracker_backup_${getTodayKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported as JSON');
  };

  /**
   * Imports previously backed-up JSON data.
   */
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.habits)) {
          setTrackerData(parsed);
          saveHabitData(parsed);
          showNotification('Successfully imported habits!');
        } else {
          alert('Invalid habit data file format.');
        }
      } catch {
        alert('Failed to parse the imported JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const todayKey = getTodayKey();
  const todayFormatted = formatFullDate(new Date());

  // Filter & Sort Habits for view
  const displayedHabits = trackerData.habits
    .filter((h) => {
      const isDoneToday = Boolean(h.completions[todayKey]);
      if (filterMode === 'completed') return isDoneToday;
      if (filterMode === 'pending') return !isDoneToday;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const allCompletedTodayCount = trackerData.habits.filter((h) => h.completions[todayKey]).length;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? 'bg-[#0d1117] text-[#c9d1d9]' : 'bg-[#f8fafc] text-zinc-900'
      }`}
    >
      {/* Milestone Celebration Modal Overlay */}
      <MilestoneCelebrationModal
        milestoneData={celebratingMilestone}
        onClose={() => setCelebratingMilestone(null)}
        onViewAllBadges={() => {
          showcaseRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        theme={currentTheme}
      />

      {/* Temporary Toast Notification */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 bg-zinc-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-zinc-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
          isDark ? 'bg-[#161b22]/95 border-[#30363d]' : 'bg-white/95 border-zinc-200/80'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-950/20"
            >
              <Flame className="w-5 h-5 fill-white/20" />
            </motion.div>
            <div>
              <h1
                className={`text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 ${
                  isDark ? 'text-zinc-100' : 'text-zinc-900'
                }`}
              >
                Habit Tracker
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  GitHub Heatmap
                </span>
              </h1>
              <p className={`text-xs hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Visual streak heatmap & daily consistency logger
              </p>
            </div>
          </div>

          {/* Controls: Theme Selector (Dark & Light), Sound Toggle, Date, Backup */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Selector: Dark and Light buttons */}
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <button
                type="button"
                onClick={() => handleChangeTheme('dark')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentTheme === 'dark'
                    ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dark</span>
              </button>

              <button
                type="button"
                onClick={() => handleChangeTheme('light')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentTheme === 'light'
                    ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </button>
            </div>

            {/* Date Indicator */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
                isDark
                  ? 'bg-[#0d1117] border-[#30363d] text-zinc-300'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">{todayFormatted}</span>
            </div>

            {/* Utilities Menu */}
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-transparent hover:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border-transparent hover:border-zinc-200'
                }`}
                title={soundEnabled ? 'Chime sound enabled (click to mute)' : 'Chime sound muted (click to enable)'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleExportJson}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-transparent hover:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border-transparent hover:border-zinc-200'
                }`}
                title="Export data as JSON"
              >
                <Download className="w-4 h-4" />
              </motion.button>

              <label
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-transparent hover:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border-transparent hover:border-zinc-200'
                }`}
                title="Import data from JSON"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>

              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleResetToSample}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-transparent hover:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border-transparent hover:border-zinc-200'
                }`}
                title="Reset to sample data"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Daily Reminder Hub */}
        <section>
          <DailyReminderBanner
            habits={trackerData.habits}
            onToggleToday={handleToggleToday}
            dailyReminderEnabled={Boolean(trackerData.dailyReminderEnabled ?? true)}
            dailyReminderTime={trackerData.dailyReminderTime || '20:00'}
            onUpdateDailyReminder={handleUpdateDailyReminder}
            theme={currentTheme}
          />
        </section>

        {/* Overall Activity Consistency Matrix */}
        {trackerData.habits.length > 0 && (
          <section>
            <OverallHeatmap habits={trackerData.habits} theme={currentTheme} />
          </section>
        )}

        {/* Milestone Badges & Streak Achievements Gallery */}
        <section ref={showcaseRef}>
          <MilestoneShowcase
            habits={trackerData.habits}
            unlockedMilestones={trackerData.unlockedMilestones || []}
            onSelectMilestone={(milestone, record) => {
              setCelebratingMilestone({ milestone, record });
              triggerCelebrationConfetti();
            }}
            theme={currentTheme}
          />
        </section>

        {/* Add New Habit Section */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Add New Habit</span>
            </h2>
          </div>
          <AddHabitForm onAddHabit={handleAddHabit} theme={currentTheme} />
        </section>

        {/* Habits List Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
            <div className="flex items-center gap-2.5">
              <h2 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                Your Habits ({trackerData.habits.length})
              </h2>
              {trackerData.habits.length > 0 && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    allCompletedTodayCount === trackerData.habits.length
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                  }`}
                >
                  {allCompletedTodayCount} of {trackerData.habits.length} done today
                </span>
              )}
            </div>

            {/* Filter Controls */}
            {trackerData.habits.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`inline-flex rounded-xl p-0.5 border ${
                    isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-100 border-zinc-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      filterMode === 'all'
                        ? isDark
                          ? 'bg-zinc-800 text-white shadow-xs'
                          : 'bg-white text-zinc-900 shadow-2xs'
                        : isDark
                        ? 'text-zinc-400 hover:text-zinc-200'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('pending')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      filterMode === 'pending'
                        ? isDark
                          ? 'bg-zinc-800 text-white shadow-xs'
                          : 'bg-white text-zinc-900 shadow-2xs'
                        : isDark
                        ? 'text-zinc-400 hover:text-zinc-200'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Pending Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('completed')}
                    className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      filterMode === 'completed'
                        ? isDark
                          ? 'bg-zinc-800 text-white shadow-xs'
                          : 'bg-white text-zinc-900 shadow-2xs'
                        : isDark
                        ? 'text-zinc-400 hover:text-zinc-200'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Done Today
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Habit Cards */}
          <AnimatePresence mode="popLayout">
            {displayedHabits.length > 0 ? (
              <div className="space-y-4">
                {displayedHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggleToday={handleToggleToday}
                    onToggleDate={handleToggleDate}
                    onDelete={handleDeleteHabit}
                    onRename={handleRenameHabit}
                    onToggleReminder={handleToggleReminder}
                    onToggleReminderDay={handleToggleReminderDay}
                    onSetReminderPreset={handleSetReminderPreset}
                    theme={currentTheme}
                  />
                ))}
              </div>
            ) : trackerData.habits.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-12 rounded-2xl border p-8 space-y-2 ${
                  isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-zinc-200'
                }`}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  No habits match the "{filterMode}" filter.
                </div>
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className="text-xs text-emerald-400 hover:underline font-medium cursor-pointer"
                >
                  Show all habits
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center py-14 rounded-2xl border p-8 space-y-4 ${
                  isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-zinc-200'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                    isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-400'
                  }`}
                >
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    No habits tracked yet
                  </h3>
                  <p className={`text-xs max-w-sm mx-auto mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Start building your visual streak heatmap by creating your first daily habit above, or restore sample data.
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleResetToSample}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Sample Habits</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-4 mt-8 transition-colors duration-300 ${
          isDark ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]' : 'bg-white border-zinc-200 text-zinc-500'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
              Habit Tracker
            </span>
            <span>•</span>
            <span>Client-Side Contribution Heatmap Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Saved in localStorage</span>
            <span>•</span>
            <button
              type="button"
              onClick={handleExportJson}
              className="hover:underline cursor-pointer"
            >
              Export JSON
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
