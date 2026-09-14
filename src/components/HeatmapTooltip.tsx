/**
 * Heatmap Floating Tooltip Component
 *
 * Renders a lightweight, high-contrast floating tooltip positioned dynamically
 * above hovered heatmap day squares. Displays date formatted as full day/month/year,
 * completion status, reminder day flags, and aggregated counts in multi-habit views.
 */

import React from 'react';
import { formatFullDate } from '../utils/dateUtils';

interface HeatmapTooltipProps {
  /** Visibility state of the tooltip */
  visible: boolean;
  /** Viewport X coordinate for positioning */
  x: number;
  /** Viewport Y coordinate for positioning */
  y: number;
  /** ISO date string (YYYY-MM-DD) */
  dateKey: string;
  /** Whether the targeted habit was completed on this date */
  isCompleted: boolean;
  /** Optional aggregate completion count across all habits */
  count?: number;
  /** Optional name of the active habit */
  habitName?: string;
  /** Indicates whether the targeted date is today */
  isToday: boolean;
  /** Indicates whether the targeted date is in the future */
  isFuture: boolean;
  /** Indicates whether this day is scheduled as a target reminder day */
  isReminderDay?: boolean;
}

export const HeatmapTooltip: React.FC<HeatmapTooltipProps> = ({
  visible,
  x,
  y,
  dateKey,
  isCompleted,
  count,
  habitName,
  isToday,
  isFuture,
  isReminderDay,
}) => {
  if (!visible || !dateKey) return null;

  return (
    <div
      id="heatmap-floating-tooltip"
      className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-75 ease-out"
      style={{
        left: `${x}px`,
        top: `${y - 8}px`,
      }}
    >
      <div className="bg-zinc-900 text-zinc-100 text-xs py-1.5 px-2.5 rounded-md shadow-xl border border-zinc-700/80 whitespace-nowrap">
        <div className="font-semibold flex items-center gap-1.5">
          {isFuture ? (
            <span className="text-zinc-400">Future Date</span>
          ) : count !== undefined ? (
            <span>
              <strong className="text-emerald-400">{count}</strong> habit
              {count === 1 ? '' : 's'} completed
            </span>
          ) : isCompleted ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Completed
            </span>
          ) : (
            <span className="text-zinc-400">Not completed</span>
          )}
          {isToday && (
            <span className="bg-zinc-800 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/30 font-medium">
              Today
            </span>
          )}
          {isReminderDay && (
            <span className="bg-amber-950/80 text-amber-300 text-[10px] px-1.5 py-0.2 rounded border border-amber-500/40 font-medium flex items-center gap-0.5">
              🔔 Reminder day
            </span>
          )}
        </div>
        <div className="text-[11px] text-zinc-300 mt-0.5 font-normal">
          {formatFullDate(dateKey)}
        </div>
        {habitName && (
          <div className="text-[10px] text-zinc-400 mt-0.5 italic">
            Habit: {habitName}
          </div>
        )}
        {!isFuture && (
          <div className="text-[9px] text-zinc-400 mt-1 border-t border-zinc-800 pt-0.5">
            Click square to toggle
          </div>
        )}
      </div>
      {/* Visual orientation arrowhead */}
      <div className="w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700/80 transform rotate-45 mx-auto -mt-1" />
    </div>
  );
};
