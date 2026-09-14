/**
 * Milestone Showcase & Badges Gallery
 *
 * Provides a dedicated achievements showcase highlighting:
 * - Unlocked streak badges (with dates and habit names)
 * - In-progress milestone tracks with dynamic progress bars (e.g. 7, 30, 100 days)
 * - Re-triggerable celebratory preview
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Flame,
  Zap,
  Star,
  Crown,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronRight,
  Award,
} from 'lucide-react';
import { MilestoneDefinition, UnlockedMilestone, Habit, AppTheme } from '../types';
import { MILESTONE_DEFINITIONS } from '../utils/milestones';
import { calculateStreaks } from '../utils/dateUtils';

interface MilestoneShowcaseProps {
  habits: Habit[];
  unlockedMilestones: UnlockedMilestone[];
  onSelectMilestone?: (milestone: MilestoneDefinition, record: UnlockedMilestone) => void;
  theme?: AppTheme;
}

export const MilestoneShowcase: React.FC<MilestoneShowcaseProps> = ({
  habits,
  unlockedMilestones,
  onSelectMilestone,
  theme = 'dark',
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [isExpanded, setIsExpanded] = useState(true);
  const isDark = theme === 'dark';

  // Calculate highest active streak across all tracked habits
  const highestCurrentStreak = habits.length > 0
    ? Math.max(...habits.map((h) => calculateStreaks(h.completions).currentStreak), 0)
    : 0;

  // Calculate all-time best streak across all habits
  const highestEverStreak = habits.length > 0
    ? Math.max(...habits.map((h) => calculateStreaks(h.completions).longestStreak), 0)
    : 0;

  // Map icons to milestone types
  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-6 h-6 stroke-[2.2] ${isUnlocked ? '' : 'opacity-40'}`;
    switch (iconName) {
      case 'flame':
        return <Flame className={`${className} text-orange-400`} />;
      case 'zap':
        return <Zap className={`${className} text-blue-400`} />;
      case 'star':
        return <Star className={`${className} text-yellow-400`} />;
      case 'diamond':
        return <Sparkles className={`${className} text-cyan-400`} />;
      case 'crown':
        return <Crown className={`${className} text-amber-300`} />;
      case 'trophy':
      default:
        return <Trophy className={`${className} text-amber-400`} />;
    }
  };

  const filteredMilestones = MILESTONE_DEFINITIONS.filter((milestone) => {
    const isUnlocked = unlockedMilestones.some((u) => u.milestoneId === milestone.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  const totalUnlockedCount = MILESTONE_DEFINITIONS.filter((m) =>
    unlockedMilestones.some((u) => u.milestoneId === m.id)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
        isDark
          ? 'bg-[#161b22] border-[#30363d]'
          : 'bg-white border-zinc-200/90'
      }`}
    >
      {/* Header section with toggle and summary count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Milestone Badges
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {totalUnlockedCount} of {MILESTONE_DEFINITIONS.length} Unlocked
              </span>
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Celebratory rewards unlocked when hitting 3, 7, 30, and 100+ day streaks
            </p>
          </div>
        </div>

        {/* Filter controls and collapse */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div
            className={`inline-flex rounded-xl p-0.5 border text-xs ${
              isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-100 border-zinc-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                filter === 'all'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-zinc-900 shadow-2xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              All ({MILESTONE_DEFINITIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unlocked')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                filter === 'unlocked'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-zinc-900 shadow-2xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Unlocked ({totalUnlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('locked')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                filter === 'locked'
                  ? isDark
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-zinc-900 shadow-2xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              In Progress
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isDark
                ? 'border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1"
          >
            {filteredMilestones.map((milestone) => {
              const unlockRecord = unlockedMilestones.find((u) => u.milestoneId === milestone.id);
              const isUnlocked = Boolean(unlockRecord);

              // Calculate progress towards this milestone
              const currentProgress = Math.min(highestCurrentStreak, milestone.days);
              const progressPct = Math.round((currentProgress / milestone.days) * 100);

              return (
                <motion.div
                  key={milestone.id}
                  whileHover={isUnlocked ? { scale: 1.02, y: -2 } : { y: -1 }}
                  onClick={() => {
                    if (isUnlocked && onSelectMilestone && unlockRecord) {
                      onSelectMilestone(milestone, unlockRecord);
                    }
                  }}
                  className={`relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                    isUnlocked
                      ? isDark
                        ? 'bg-[#0d1117] border-amber-500/40 hover:border-amber-400 cursor-pointer shadow-md shadow-amber-950/20'
                        : 'bg-amber-50/40 border-amber-200 hover:border-amber-300 cursor-pointer shadow-xs'
                      : isDark
                      ? 'bg-[#0d1117]/60 border-zinc-800 text-zinc-500'
                      : 'bg-zinc-50 border-zinc-200/80 text-zinc-400'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon and Status Tag */}
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                          isUnlocked
                            ? isDark
                              ? 'bg-amber-500/20 border-amber-500/40'
                              : 'bg-amber-100 border-amber-200'
                            : isDark
                            ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-500'
                            : 'bg-zinc-200/60 border-zinc-300/60 text-zinc-400'
                        }`}
                      >
                        {getBadgeIcon(milestone.icon, isUnlocked)}
                      </div>

                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          {milestone.days}d
                        </span>
                      )}
                    </div>

                    {/* Title and Streak Milestone */}
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                        {milestone.subtitle}
                      </div>
                      <h3
                        className={`text-sm font-bold mt-0.5 ${
                          isUnlocked
                            ? isDark
                              ? 'text-zinc-100'
                              : 'text-zinc-900'
                            : isDark
                            ? 'text-zinc-400'
                            : 'text-zinc-600'
                        }`}
                      >
                        {milestone.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom section: Progress bar or Unlock Details */}
                  <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80">
                    {isUnlocked && unlockRecord ? (
                      <div className="text-[11px] flex items-center justify-between">
                        <span className="text-zinc-400 truncate max-w-[120px]" title={unlockRecord.habitName}>
                          {unlockRecord.habitName}
                        </span>
                        <span className="font-semibold text-emerald-400 shrink-0">
                          {unlockRecord.unlockedAt}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>Current best</span>
                          <span>
                            {highestCurrentStreak} / {milestone.days} days
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-700/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
