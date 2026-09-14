/**
 * Milestone Celebration Modal
 *
 * Fullscreen celebration overlay that animates into view when a user
 * achieves a new streak milestone (e.g. 7, 30, or 100 days).
 *
 * Features:
 * - Animated trophy/medal icon with dynamic metallic tier styling
 * - Triggerable particle confetti re-fire
 * - High-contrast readable typography and celebration card
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Flame,
  Zap,
  Star,
  Crown,
  Sparkles,
  Check,
  X,
  Share2,
} from 'lucide-react';
import { MilestoneDefinition, UnlockedMilestone, AppTheme } from '../types';
import { triggerCelebrationConfetti } from '../utils/milestones';

interface MilestoneCelebrationModalProps {
  milestoneData: {
    milestone: MilestoneDefinition;
    record: UnlockedMilestone;
  } | null;
  onClose: () => void;
  onViewAllBadges?: () => void;
  theme?: AppTheme;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  milestoneData,
  onClose,
  onViewAllBadges,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Automatically trigger confetti when the celebratory modal mounts
  useEffect(() => {
    if (milestoneData) {
      triggerCelebrationConfetti();
    }
  }, [milestoneData]);

  if (!milestoneData) return null;

  const { milestone, record } = milestoneData;

  // Helper to render appropriate icon based on milestone configuration
  const renderBadgeIcon = () => {
    const iconProps = { className: 'w-12 h-12 stroke-[2.2]' };
    switch (milestone.icon) {
      case 'flame':
        return <Flame {...iconProps} className="w-12 h-12 text-amber-400 fill-amber-400/20" />;
      case 'zap':
        return <Zap {...iconProps} className="w-12 h-12 text-blue-400 fill-blue-400/20" />;
      case 'star':
        return <Star {...iconProps} className="w-12 h-12 text-yellow-400 fill-yellow-400/20" />;
      case 'diamond':
        return <Sparkles {...iconProps} className="w-12 h-12 text-cyan-300" />;
      case 'crown':
        return <Crown {...iconProps} className="w-12 h-12 text-amber-300 fill-amber-300/30" />;
      case 'trophy':
      default:
        return <Trophy {...iconProps} className="w-12 h-12 text-yellow-400 fill-yellow-400/20" />;
    }
  };

  // Determine tier gradient styling
  const getTierGlow = () => {
    switch (milestone.tier) {
      case 'legendary':
      case 'diamond':
        return 'from-cyan-500/30 via-indigo-500/20 to-purple-500/30 border-cyan-400/50 text-cyan-300';
      case 'platinum':
        return 'from-slate-400/30 via-zinc-400/20 to-slate-500/30 border-slate-300/50 text-slate-200';
      case 'gold':
        return 'from-amber-500/30 via-yellow-500/20 to-orange-500/30 border-amber-400/50 text-amber-300';
      case 'silver':
        return 'from-blue-500/30 via-sky-500/20 to-indigo-500/30 border-blue-400/50 text-blue-300';
      case 'bronze':
      default:
        return 'from-emerald-500/30 via-teal-500/20 to-emerald-600/30 border-emerald-400/50 text-emerald-300';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop blur with dark tint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`relative z-10 w-full max-w-md overflow-hidden rounded-3xl border p-6 sm:p-8 text-center shadow-2xl ${
            isDark
              ? 'bg-[#161b22] border-[#30363d] text-zinc-100 shadow-black/80'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/50'
          }`}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Radial Celebration Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-radial from-emerald-500/20 to-transparent blur-2xl pointer-events-none" />

          {/* Animated Badge Medallion */}
          <div className="relative mx-auto mb-5 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`w-24 h-24 rounded-3xl bg-linear-to-b ${getTierGlow()} border-2 flex items-center justify-center shadow-xl`}
            >
              {renderBadgeIcon()}
            </motion.div>

            {/* Sparkle Badges */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2 text-amber-400"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </div>

          {/* Milestone Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Milestone Unlocked!</span>
          </div>

          {/* Title and Streak Days */}
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {milestone.title}
          </h2>

          <p className="mt-1 text-sm font-semibold text-emerald-400">
            {milestone.days}-Day Streak Milestone Reached
          </p>

          {/* Habit Context Callout */}
          <div
            className={`mt-4 p-3.5 rounded-2xl border text-xs text-left ${
              isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="text-zinc-400 font-medium">Earned on habit:</div>
            <div className={`text-sm font-bold mt-0.5 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {record.habitName}
            </div>
            <p className={`mt-2 text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              {milestone.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Collect Badge</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={triggerCelebrationConfetti}
              className={`w-full sm:w-auto py-3 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
              }`}
              title="Launch more confetti"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Confetti</span>
            </motion.button>
          </div>

          {onViewAllBadges && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewAllBadges();
              }}
              className="mt-3 text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors hover:underline"
            >
              View all earned badges & upcoming milestones →
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
