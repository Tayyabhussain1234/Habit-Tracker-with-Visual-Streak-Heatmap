/**
 * Add Habit Form Component
 *
 * Provides habit creation input with:
 * - Direct text input and keyboard submission.
 * - Heatmap accent color selector (Emerald, Sky Blue, Violet, Amber).
 * - Common daily habit recommendation pills for fast initial setup.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Sparkles } from 'lucide-react';
import { AppTheme } from '../types';

interface AddHabitFormProps {
  /** Callback invoked when a valid habit name and color are submitted */
  onAddHabit: (name: string, color: string) => void;
  /** Active UI color theme ('dark' | 'light') */
  theme?: AppTheme;
}

const COLOR_OPTIONS = [
  { id: 'emerald', label: 'GitHub Green', bg: 'bg-[#2ea043]' },
  { id: 'blue', label: 'Sky Blue', bg: 'bg-sky-500' },
  { id: 'purple', label: 'Violet', bg: 'bg-violet-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
];

const PRESETS = [
  'Morning Meditation',
  'Read 20 Pages',
  'Daily 30m Workout',
  'Drink 2L Water',
  'Sleep by 11 PM',
  'Code for 1 Hour',
];

export const AddHabitForm: React.FC<AddHabitFormProps> = ({ onAddHabit, theme = 'dark' }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('emerald');
  const [isExpanded, setIsExpanded] = useState(false);
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit(name.trim(), selectedColor);
    setName('');
    setIsExpanded(false);
  };

  const handleSelectPreset = (preset: string) => {
    setName(preset);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition-all ${
        isDark
          ? 'bg-[#161b22] border-[#30363d]'
          : 'bg-white border-zinc-200/90'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              id="new-habit-input"
              type="text"
              placeholder="e.g. Read 20 pages every day..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!isExpanded && e.target.value.length > 0) setIsExpanded(true);
              }}
              onFocus={() => setIsExpanded(true)}
              className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-[#0d1117] border border-[#30363d] text-zinc-100 placeholder:text-zinc-500 focus:bg-[#0d1117]'
                  : 'bg-zinc-50 border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:bg-white'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Color selection buttons */}
            <div
              className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                isDark ? 'bg-[#0d1117] border-[#30363d]' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              {COLOR_OPTIONS.map((c) => (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  title={c.label}
                  className={`w-5 h-5 rounded-full ${c.bg} transition-all cursor-pointer ${
                    selectedColor === c.id
                      ? isDark
                        ? 'ring-2 ring-white ring-offset-1 ring-offset-[#161b22] scale-110 shadow-xs'
                        : 'ring-2 ring-zinc-900 ring-offset-1 scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  aria-label={c.label}
                />
              ))}
            </div>

            <motion.button
              id="add-habit-btn"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: !name.trim() ? 1 : 1.02 }}
              type="submit"
              disabled={!name.trim()}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl shadow-xs transition-all whitespace-nowrap cursor-pointer ${
                !name.trim()
                  ? isDark
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Habit</span>
            </motion.button>
          </div>
        </div>

        {/* Quick Suggestions */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`pt-2 border-t space-y-1.5 overflow-hidden ${
                isDark ? 'border-[#30363d]' : 'border-zinc-100'
              }`}
            >
              <div
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  isDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick ideas:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <motion.button
                    key={preset}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors border cursor-pointer ${
                      isDark
                        ? 'bg-[#0d1117] hover:bg-zinc-800 text-zinc-300 border-[#30363d]'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    + {preset}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};
