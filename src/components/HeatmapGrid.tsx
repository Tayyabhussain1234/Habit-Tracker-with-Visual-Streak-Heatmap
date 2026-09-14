/**
 * Heatmap Grid Component
 *
 * Renders a contribution heatmap modeled after GitHub's contribution graph.
 *
 * Visual Characteristics:
 * - 53 weekly columns, 7 day rows (Sunday through Saturday).
 * - Dynamic color shading based on habit completion or multi-habit aggregate activity.
 * - Interactive hover with floating tooltip and click-to-toggle date completion.
 * - Today indicator ring and scheduled reminder day markers.
 * - Supports horizontal contribution graph or vertical calendar layout.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { generateGitHubWeeksGrid } from '../utils/dateUtils';
import { HeatmapTooltip } from './HeatmapTooltip';
import { AppTheme } from '../types';

interface HeatmapGridProps {
  /** Record of date keys (YYYY-MM-DD) mapping to boolean completion */
  completions: Record<string, boolean>;
  /** Callback fired when a past or current date square is clicked */
  onToggleDate?: (dateKey: string) => void;
  /** Display name of the active habit */
  habitName?: string;
  /** Accent color identifier ('emerald' | 'blue' | 'purple' | 'amber') */
  colorScheme?: string;
  /** Rendering orientation */
  variant?: 'github-horizontal' | 'calendar-vertical';
  /** Aggregate completion count dictionary for all-habits combined views */
  aggregateCounts?: Record<string, number>;
  /** Upper boundary for aggregate color scaling */
  maxAggregate?: number;
  /** Whether scheduled reminder day indicators should be highlighted */
  reminderEnabled?: boolean;
  /** Array of target weekday indices (0 = Sun, 1 = Mon, ..., 6 = Sat) */
  reminderDays?: number[];
  /** Active UI color theme ('dark' | 'light') */
  theme?: AppTheme;
}

export const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  completions,
  onToggleDate,
  habitName,
  colorScheme = 'emerald',
  variant = 'github-horizontal',
  aggregateCounts,
  reminderEnabled = false,
  reminderDays = [],
  theme = 'dark',
}) => {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dateKey: string;
    isCompleted: boolean;
    count?: number;
    isToday: boolean;
    isFuture: boolean;
    isReminderDay?: boolean;
  }>({
    visible: false,
    x: 0,
    y: 0,
    dateKey: '',
    isCompleted: false,
    isToday: false,
    isFuture: false,
    isReminderDay: false,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // Compute 53 weeks grid ending with current week
  const weeks = useMemo(() => generateGitHubWeeksGrid(new Date()), []);

  // Ensure scroll container is positioned on the most recent week initially
  useEffect(() => {
    if (scrollContainerRef.current && variant === 'github-horizontal') {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [variant]);

  /**
   * Resolves square fill and border styling based on status, theme, and color scheme.
   */
  const getSquareColor = (dateKey: string, isFuture: boolean, dayOfWeek?: number) => {
    if (isFuture) {
      return isDark
        ? 'bg-[#161b22]/40 border-[#30363d]/30 cursor-not-allowed opacity-25'
        : 'bg-zinc-100/60 border-zinc-200/50 cursor-not-allowed opacity-40';
    }

    if (aggregateCounts) {
      const count = aggregateCounts[dateKey] || 0;
      if (count === 0) {
        return isDark
          ? 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d]/70'
          : 'bg-[#ebedf0] hover:bg-zinc-200 border-zinc-200/60';
      }
      if (isDark) {
        if (count === 1) return 'bg-[#0e4429] hover:bg-[#006d32] border-[#006d32] shadow-xs shadow-emerald-950';
        if (count === 2) return 'bg-[#006d32] hover:bg-[#26a641] border-[#26a641] shadow-xs shadow-emerald-900';
        if (count === 3) return 'bg-[#26a641] hover:bg-[#39d353] border-[#39d353] shadow-xs shadow-emerald-800';
        return 'bg-[#39d353] hover:bg-[#56ff78] border-[#56ff78] shadow-sm shadow-emerald-500/30';
      } else {
        if (count === 1) return 'bg-[#9be9a8] hover:bg-[#85e394] border-[#7cdb8c]';
        if (count === 2) return 'bg-[#40c463] hover:bg-[#34b756] border-[#2ea44e]';
        if (count === 3) return 'bg-[#30a14e] hover:bg-[#288f43] border-[#227938]';
        return 'bg-[#216e39] hover:bg-[#19582d] border-[#164e28]';
      }
    }

    const isDone = Boolean(completions[dateKey]);
    const isReminder = Boolean(reminderEnabled && dayOfWeek !== undefined && reminderDays.includes(dayOfWeek));

    if (!isDone) {
      if (isReminder) {
        return isDark
          ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/60 ring-1 ring-amber-500/40'
          : 'bg-amber-50/90 hover:bg-amber-100 border-amber-300 ring-1 ring-amber-400/50';
      }
      return isDark
        ? 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d]/60'
        : 'bg-[#ebedf0] hover:bg-zinc-200 border-zinc-200/70';
    }

    if (isDark) {
      switch (colorScheme) {
        case 'blue':
          return 'bg-sky-500 hover:bg-sky-400 border-sky-400 text-white shadow-xs shadow-sky-500/30';
        case 'purple':
          return 'bg-violet-600 hover:bg-violet-500 border-violet-500 text-white shadow-xs shadow-violet-500/30';
        case 'amber':
          return 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-white shadow-xs shadow-amber-500/30';
        case 'emerald':
        default:
          return 'bg-[#238636] hover:bg-[#2ea043] border-[#2ea043] text-white shadow-xs shadow-emerald-500/20';
      }
    } else {
      switch (colorScheme) {
        case 'blue':
          return 'bg-sky-500 hover:bg-sky-600 border-sky-600 text-white';
        case 'purple':
          return 'bg-violet-500 hover:bg-violet-600 border-violet-600 text-white';
        case 'amber':
          return 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white';
        case 'emerald':
        default:
          return 'bg-[#2ea043] hover:bg-[#268838] border-[#227938] text-white';
      }
    }
  };

  /**
   * Dispatches hover coordinates to the tooltip state.
   */
  const handleMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
    dateKey: string,
    isToday: boolean,
    isFuture: boolean,
    dayOfWeek?: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isCompleted = Boolean(completions[dateKey]);
    const count = aggregateCounts ? aggregateCounts[dateKey] || 0 : undefined;
    const isReminderDay = Boolean(
      reminderEnabled && dayOfWeek !== undefined && reminderDays.includes(dayOfWeek) && !isFuture
    );

    setTooltipState({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      dateKey,
      isCompleted,
      count,
      isToday,
      isFuture,
      isReminderDay,
    });
  };

  const handleMouseLeave = () => {
    setTooltipState((prev) => ({ ...prev, visible: false }));
  };

  const handleClick = (dateKey: string, isFuture: boolean) => {
    if (isFuture) return;
    if (onToggleDate) {
      onToggleDate(dateKey);
      setTooltipState((prev) => ({
        ...prev,
        isCompleted: !prev.isCompleted,
        count: prev.count !== undefined ? (prev.isCompleted ? Math.max(0, prev.count - 1) : prev.count + 1) : undefined,
      }));
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar Vertical Mode
  if (variant === 'calendar-vertical') {
    const recentWeeks = weeks.slice(-20);

    return (
      <div className="w-full">
        <HeatmapTooltip {...tooltipState} habitName={habitName} />

        <div className={`grid grid-cols-7 gap-1.5 mb-2 text-center text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {weekdays.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
          {recentWeeks.map((week) => (
            <div key={week.weekIndex} className="grid grid-cols-7 gap-1.5">
              {week.days.map((daySquare, dayIdx) => {
                if (!daySquare) {
                  return <div key={dayIdx} className="h-7 rounded-sm bg-transparent" />;
                }

                const colorClass = getSquareColor(daySquare.dateKey, daySquare.isFuture, daySquare.dayOfWeek);
                const isReminder = Boolean(
                  reminderEnabled && reminderDays.includes(daySquare.dayOfWeek) && !daySquare.isFuture
                );
                const isDone = Boolean(completions[daySquare.dateKey]);

                return (
                  <button
                    key={daySquare.dateKey}
                    type="button"
                    onClick={() => handleClick(daySquare.dateKey, daySquare.isFuture)}
                    onMouseEnter={(e) =>
                      handleMouseEnter(e, daySquare.dateKey, daySquare.isToday, daySquare.isFuture, daySquare.dayOfWeek)
                    }
                    onMouseLeave={handleMouseLeave}
                    disabled={daySquare.isFuture}
                    className={`h-7 rounded-sm border transition-all duration-100 flex flex-col items-center justify-center relative group text-[10px] hover:scale-110 hover:z-10 cursor-pointer ${colorClass} ${
                      daySquare.isToday
                        ? isDark
                          ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#161b22] font-bold'
                          : 'ring-2 ring-emerald-500/80 ring-offset-1 font-bold'
                        : ''
                    }`}
                    aria-label={`${daySquare.dateKey}: ${isDone ? 'Completed' : 'Not completed'}`}
                  >
                    <span
                      className={`text-[9px] ${
                        isDone
                          ? 'text-white font-medium'
                          : isDark
                          ? 'text-zinc-400'
                          : 'text-zinc-600'
                      }`}
                    >
                      {daySquare.dayOfMonth}
                    </span>
                    {isReminder && !isDone && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-0.5 pointer-events-none" />
                    )}
                    {isReminder && isDone && (
                      <span className="w-1 h-1 rounded-full bg-amber-300 absolute top-0.5 right-0.5 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div
          className={`mt-3 flex items-center justify-between text-xs pt-2 border-t ${
            isDark ? 'text-zinc-400 border-zinc-800' : 'text-zinc-500 border-zinc-100'
          }`}
        >
          <span className="text-[11px]">Showing last 20 weeks • Click square to toggle</span>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Less</span>
            <span
              className={`w-2.5 h-2.5 rounded-[2px] border ${
                isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-[#ebedf0] border-zinc-200'
              }`}
            />
            <span className={`w-2.5 h-2.5 rounded-[2px] ${isDark ? 'bg-[#0e4429]' : 'bg-[#9be9a8]'}`} />
            <span className={`w-2.5 h-2.5 rounded-[2px] ${isDark ? 'bg-[#006d32]' : 'bg-[#40c463]'}`} />
            <span className={`w-2.5 h-2.5 rounded-[2px] ${isDark ? 'bg-[#26a641]' : 'bg-[#30a14e]'}`} />
            <span className={`w-2.5 h-2.5 rounded-[2px] ${isDark ? 'bg-[#39d353]' : 'bg-[#216e39]'}`} />
            <span>More</span>
          </div>
        </div>
      </div>
    );
  }

  // Standard GitHub Horizontal Heatmap (53 columns x 7 rows)
  return (
    <div className="w-full">
      <HeatmapTooltip {...tooltipState} habitName={habitName} />

      <div
        ref={scrollContainerRef}
        className={`w-full overflow-x-auto pb-1 ${
          isDark
            ? 'scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent'
            : 'scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent'
        }`}
      >
        <div className="inline-block min-w-max">
          {/* Month labels row */}
          <div
            className={`flex ml-8 text-[10px] font-medium h-4 mb-1 select-none ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            {weeks.map((week, idx) => (
              <div
                key={`month-${idx}`}
                className="w-[12px] mr-[3px] text-left overflow-visible whitespace-nowrap"
              >
                {week.monthLabel && <span>{week.monthLabel}</span>}
              </div>
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex items-start">
            <div
              className={`flex flex-col justify-between h-[105px] pr-2 text-[9px] select-none font-mono ${
                isDark ? 'text-zinc-500' : 'text-zinc-500'
              }`}
            >
              <span className="h-[12px] leading-[12px]" />
              <span className="h-[12px] leading-[12px]">Mon</span>
              <span className="h-[12px] leading-[12px]" />
              <span className="h-[12px] leading-[12px]">Wed</span>
              <span className="h-[12px] leading-[12px]" />
              <span className="h-[12px] leading-[12px]">Fri</span>
              <span className="h-[12px] leading-[12px]" />
            </div>

            {/* 53 Columns of 7 days */}
            <div className="flex gap-[3px]">
              {weeks.map((week) => (
                <div key={`col-${week.weekIndex}`} className="flex flex-col gap-[3px]">
                  {week.days.map((daySquare, dayOfWeek) => {
                    if (!daySquare) {
                      return (
                        <div
                          key={`empty-${dayOfWeek}`}
                          className="w-[12px] h-[12px] rounded-[2px] bg-transparent"
                        />
                      );
                    }

                    const colorClass = getSquareColor(daySquare.dateKey, daySquare.isFuture, daySquare.dayOfWeek);
                    const isReminder = Boolean(
                      reminderEnabled && reminderDays.includes(daySquare.dayOfWeek) && !daySquare.isFuture
                    );
                    const isDone = Boolean(completions[daySquare.dateKey]);

                    return (
                      <button
                        key={daySquare.dateKey}
                        type="button"
                        onClick={() => handleClick(daySquare.dateKey, daySquare.isFuture)}
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, daySquare.dateKey, daySquare.isToday, daySquare.isFuture, daySquare.dayOfWeek)
                        }
                        onMouseLeave={handleMouseLeave}
                        disabled={daySquare.isFuture}
                        className={`w-[12px] h-[12px] rounded-[2px] border transition-all duration-100 cursor-pointer hover:scale-135 hover:z-20 hover:shadow-md relative flex items-center justify-center active:scale-95 ${colorClass} ${
                          daySquare.isToday
                            ? isDark
                              ? 'ring-1.5 ring-emerald-400 ring-offset-1 ring-offset-[#0d1117]'
                              : 'ring-1.5 ring-emerald-500 ring-offset-0.5'
                            : ''
                        }`}
                        aria-label={`${daySquare.dateKey}: ${isDone ? 'Completed' : 'Not completed'}`}
                      >
                        {isReminder && !isDone && (
                          <span className="w-1 h-1 rounded-full bg-amber-500 pointer-events-none" />
                        )}
                        {isReminder && isDone && (
                          <span className="absolute top-[1px] right-[1px] w-[3px] h-[3px] rounded-full bg-amber-300 pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Hint Footer */}
      <div
        className={`mt-2.5 flex flex-wrap items-center justify-between text-xs select-none gap-2 ${
          isDark ? 'text-zinc-400' : 'text-zinc-500'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <span
              className={`w-2.5 h-2.5 rounded-[2px] border ${
                isDark
                  ? 'border-emerald-400 ring-1 ring-emerald-400/40 bg-[#161b22]'
                  : 'border-emerald-500 ring-1 ring-emerald-500/40 bg-[#ebedf0]'
              }`}
            />
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Today</span>
          </span>

          {reminderEnabled && reminderDays.length > 0 && (
            <>
              <span className="text-zinc-500">•</span>
              <span className="inline-flex items-center gap-1">
                <span
                  className={`w-2.5 h-2.5 rounded-[2px] relative flex items-center justify-center border ${
                    isDark
                      ? 'bg-amber-950/60 border-amber-500/80 ring-1 ring-amber-500/40'
                      : 'bg-amber-50 border-amber-400 ring-1 ring-amber-400/40'
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                </span>
                <span className={isDark ? 'text-amber-400 font-medium' : 'text-zinc-600 font-medium'}>
                  Reminder day
                </span>
              </span>
            </>
          )}

          <span className="text-zinc-500">•</span>
          <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Click square to toggle</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Less</span>
          <span
            className={`w-[11px] h-[11px] rounded-[2px] border ${
              isDark ? 'bg-[#161b22] border-[#30363d]' : 'bg-[#ebedf0] border-zinc-200/80'
            }`}
          />
          {aggregateCounts ? (
            isDark ? (
              <>
                <span className="w-[11px] h-[11px] rounded-[2px] bg-[#0e4429]" />
                <span className="w-[11px] h-[11px] rounded-[2px] bg-[#006d32]" />
                <span className="w-[11px] h-[11px] rounded-[2px] bg-[#26a641]" />
                <span className="w-[11px] h-[11px] rounded-[2px] bg-[#39d353]" />
              </>
            ) : (
              <>
                <span className="w-[11px] h-[11px] rounded-[2px] bg-[#9be9a8]" />
                <span className="w-[11px] h-[11px] rounded-[2px] bg-[#40c463]" />
                <span className="w-[11px] h-[11px] rounded-[2px] bg-[#30a14e]" />
                <span className="w-[11px] h-[11px] rounded-[2px] bg-[#216e39]" />
              </>
            )
          ) : (
            <span
              className={`w-[11px] h-[11px] rounded-[2px] ${
                colorScheme === 'blue'
                  ? 'bg-sky-500'
                  : colorScheme === 'purple'
                  ? 'bg-violet-500'
                  : colorScheme === 'amber'
                  ? 'bg-amber-500'
                  : isDark
                  ? 'bg-[#238636]'
                  : 'bg-[#2ea043]'
              }`}
            />
          )}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
