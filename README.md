# Habit Tracker with Visual Streak Heatmap

A frontend habit tracking web application featuring interactive GitHub-style 365-day contribution heatmaps, streak analytics, celebratory milestone badges, and scheduled daily reminders. Built with React, TypeScript, and Tailwind CSS with local storage persistence and zero third-party chart dependencies.

---

## Features

### 1. GitHub-Style Contribution Heatmap
- **Custom-Engineered 53-Week Grid**: Built from scratch without external charting or calendar libraries, rendering 53 columns by 7 weekday rows.
- **Dual View Modes**: Switch seamlessly between the 52-week horizontal contribution graph and a 20-week vertical calendar view.
- **Interactive Inspection**: Hover over any day for precise date status or click directly on any past or present square to retroactively toggle check-ins.
- **Custom Color Palettes**: Customize each habit with color accents including GitHub Green, Sky Blue, Violet, and Amber.

### 2. Habit Management & Daily Check-In
- **Independent Tracking**: Track multiple habits simultaneously with isolated completion histories and metrics.
- **One-Click Check-In**: Mark habits done for today with animated checkmark feedback and Web Audio chime effects.
- **Inline Editing & Safety Barriers**: Rename habits directly in place or delete them with confirmation protection.
- **Quick Preset Starter Pills**: Instant one-click suggestions for common routines (e.g., Morning Meditation, Read 20 Pages, Drink 2L Water).

### 3. Streak & Performance Analytics
- **Live Streak Engine**: Automatically computes:
  - **Current Streak**: Active unbroken daily chain (with active/inactive indicators).
  - **Best Streak**: All-time longest continuous streak record.
  - **30-Day Completion Rate**: Rolling percentage of consistency over the last 30 days.
  - **Total Logged Days**: Cumulative lifetime check-in count.

### 4. Milestone Badges & Celebrations
- **Streak Achievement Thresholds**: Automated unlock system for reaching 3, 7, 14, 21, 30, 60, 100, and 365-day streaks.
- **Celebratory Celebration Overlay**: Fullscreen celebration modal featuring metallic badge medallions, milestone tier progression (Bronze, Silver, Gold, Platinum, Diamond, Legendary), and multi-burst physics-based confetti powered by `canvas-confetti`.
- **Audio Fanfare**: Built-in harmonic four-tone victory chime synthesizer utilizing the native Web Audio API.
- **Milestone Showcase Gallery**: Dedicated gallery section displaying earned badges, completion dates, and progress bars toward upcoming milestones.

### 5. Scheduled Daily Reminders
- **Target Weekday Indicators**: Highlight scheduled days of the week on the heatmap with custom indicator rings and dots.
- **Schedule Presets**: Quick configuration for Daily, Weekdays (Mon–Fri), or Weekends (Sat–Sun).
- **Interactive Daily Hub**: Live checklist banner with progress bar displaying pending vs. completed habits for today.
- **Custom Alert Times & Audio Chimes**: Configurable notification time with automated checking and a manual test sound trigger.

### 6. Overall Consistency Matrix
- **Aggregated Heatmap**: Overlay heatmap combining check-ins across all habits with 4-level color intensity scaling.
- **Global Health Metrics**: High-level counters for today's overall completion progress, active streaks, and total aggregate check-ins.

### 7. Themes & Data Portability
- **Theme Modes**: High-contrast **Dark** and clean **Light** themes.
- **Local Persistence**: Automatic synchronization to browser `localStorage`.
- **Data Export & Import**: Backup your entire habit history and unlocked milestone records to a formatted JSON file or restore anytime.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Particles**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio Engine**: Native Browser [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (no external sound assets required)

---

## Project Structure

```text
├── index.html                    # Application entry HTML
├── metadata.json                 # Project configuration and capabilities
├── package.json                  # Dependencies and build scripts
├── src/
│   ├── App.tsx                   # Main dashboard view, global state, & notifications
│   ├── main.tsx                  # React DOM mount point
│   ├── index.css                 # Tailwind CSS entry stylesheet
│   ├── types.ts                  # Shared TypeScript interfaces & types
│   ├── components/
│   │   ├── AddHabitForm.tsx      # Habit creation input & color selection
│   │   ├── DailyReminderBanner.tsx # Daily reminder center & live progress checklist
│   │   ├── HabitCard.tsx         # Habit card with statistics & actions
│   │   ├── HeatmapGrid.tsx       # 53-week GitHub contribution heatmap engine
│   │   ├── HeatmapTooltip.tsx    # Floating coordinate-aware date tooltip
│   │   ├── MilestoneCelebrationModal.tsx # Fullscreen achievement celebration & confetti
│   │   ├── MilestoneShowcase.tsx # Badges gallery & progress tracking
│   │   └── OverallHeatmap.tsx    # Multi-habit aggregate consistency matrix
│   └── utils/
│       ├── audio.ts              # Web Audio API chime & fanfare synthesizer
│       ├── dateUtils.ts          # Manual date calculations, week grids, & streak math
│       ├── milestones.ts         # Milestone thresholds & confetti engine
│       └── storage.ts            # LocalStorage persistence & sample dataset
```

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18 or later) installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Tayyabhussain1234/habit-tracker.git
   cd habit-tracker
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

### Development

To run the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build

To build the static production assets:

```bash
npm run build
```

The compiled files will be generated in the `dist/` directory, ready to be served by any static web hosting provider (e.g., Vercel, Netlify, GitHub Pages, or Cloud Run).

To preview the production build locally:

```bash
npm run preview
```

### Code Verification & Linting

Run TypeScript verification without emitting files:

```bash
npm run lint
```

---

## Data Model

All user data is stored locally in the browser's `localStorage` under the key `habit_tracker_data`:

```typescript
interface HabitTrackerData {
  version: number;
  habits: Habit[];
  theme?: 'dark' | 'light';
  dailyReminderEnabled?: boolean;
  dailyReminderTime?: string; // "HH:MM"
  unlockedMilestones?: UnlockedMilestone[];
}
```

Habit check-ins are indexed as ISO date strings (`YYYY-MM-DD`):

```typescript
completions: {
  "2026-09-14": true,
  "2026-09-13": true
}
```

---

## License

This project is licensed under the MIT License. Feel free to customize, extend, and adapt it for your personal or production workflows.
