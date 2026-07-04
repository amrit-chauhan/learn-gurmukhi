/**
 * Stats page — tabbed statistics hub
 *
 * Tabs:
 *   Overview  – mastery donut chart + summary counts
 *   Letters   – sortable grid of all letters, click for detail modal
 *   Time      – today / all-time app & practice time
 *   Streak    – current & longest streak
 *
 * Data sources:
 *   - useProgress() → alphabet, getMastery, progress (no extra API calls)
 *   - GET /api/stats → time + streak fields
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Flame, Trophy, Clock, BookOpen, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useProgress } from '../context/ProgressContext';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

// ── Constants ─────────────────────────────────────────────────────────────────

const MASTERY_CONFIG = {
  mastered:   { label: 'Mastered',   color: '#22c55e', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  learning:   { label: 'Learning',   color: '#f59e0b', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-300' },
  struggling: { label: 'Struggling', color: '#ef4444', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-300' },
  new:        { label: 'New',        color: '#a8a29e', bg: 'bg-stone-50',   text: 'text-stone-500',   border: 'border-stone-200' },
};

const MASTERY_SORT_ORDER = { struggling: 0, learning: 1, new: 2, mastered: 3 };

const CATEGORY_ORDER = ['vowel_carrier', 'consonant', 'consonant_nukta', 'vowel', 'matra', 'special'];
const CATEGORY_LABELS = {
  vowel_carrier: 'Vowel Carriers', consonant: 'Consonants',
  consonant_nukta: 'Nukta', vowel: 'Vowels', matra: 'Matras', special: 'Special',
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'letters',  label: 'Letters'  },
  { id: 'calendar', label: 'Calendar' },
  { id: 'time',     label: 'Time'     },
  { id: 'streak',   label: 'Streak'   },
];

// A day counts as "solid study" (green) at 10+ minutes of practice; any
// practice below that is a "light" day (yellow); zero is "no study" (grey).
const STUDY_GREEN_SECONDS = 10 * 60;

const CAL_LEVEL = {
  none:  { fill: '#f0efed', text: '#a8a29e', label: 'No study'    },
  light: { fill: '#f59e0b', text: '#ffffff', label: 'Under 10 min' },
  solid: { fill: '#22c55e', text: '#ffffff', label: '10+ min'      },
};

function dayLevel(practiceSeconds) {
  if (!practiceSeconds || practiceSeconds <= 0) return 'none';
  return practiceSeconds >= STUDY_GREEN_SECONDS ? 'solid' : 'light';
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

/** Local ISO date key (YYYY-MM-DD) built from parts — avoids timezone shifts. */
function isoDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(s) {
  if (!s || s < 60) return s > 0 ? `${s}s` : '0m';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

function formatStreak(d) {
  if (!d) return '—';
  return d === 1 ? '1 day' : `${d} days`;
}

// ── Shared: TimeCard ──────────────────────────────────────────────────────────

function TimeCard({ icon: Icon, label, value, bgClass, iconClass, testId }) {
  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm flex-1 min-w-0">
      <div className={`w-9 h-9 rounded-xl ${bgClass} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <p data-testid={testId} className="text-2xl font-bold text-stone-900 truncate">{value}</p>
      <p className="text-xs text-stone-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function DonutChart({ counts, total }) {
  const data = [
    { name: 'Mastered',   value: counts.mastered   || 0, color: MASTERY_CONFIG.mastered.color   },
    { name: 'Learning',   value: counts.learning   || 0, color: MASTERY_CONFIG.learning.color   },
    { name: 'Struggling', value: counts.struggling || 0, color: MASTERY_CONFIG.struggling.color },
    { name: 'New',        value: counts.new        || 0, color: MASTERY_CONFIG.new.color        },
  ].filter((d) => d.value > 0);

  const allNew = data.length === 0 || (data.length === 1 && data[0].name === 'New');

  const customTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0].payload;
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <div className="bg-white border border-stone-200 rounded-xl px-3 py-2 shadow-md text-xs font-semibold text-stone-700">
        {name}: {value} ({pct}%)
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Donut */}
      <div className="relative w-44 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allNew ? [{ name: 'New', value: total, color: MASTERY_CONFIG.new.color }] : data}
              cx="50%" cy="50%"
              innerRadius={52} outerRadius={76}
              dataKey="value"
              strokeWidth={2}
              stroke="#fafaf9"
              isAnimationActive
            >
              {(allNew
                ? [{ color: MASTERY_CONFIG.new.color }]
                : data
              ).map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-stone-900 leading-none">{total}</span>
          <span className="text-xs text-stone-400 font-medium mt-0.5">letters</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-[220px]">
        {Object.entries(MASTERY_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
            <span className="text-xs text-stone-600 font-medium">{cfg.label}</span>
            <span className="text-xs text-stone-400 ml-auto font-semibold">{counts[key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({ alphabet, getMastery }) {
  const counts = { mastered: 0, learning: 0, struggling: 0, new: 0 };
  alphabet.forEach((l) => { counts[getMastery(l.id)] += 1; });
  const studied = alphabet.length - counts.new;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
        Mastery Distribution
      </p>
      <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm flex justify-center mb-4">
        <DonutChart counts={counts} total={alphabet.length} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm text-center">
          <p data-testid="overview-studied-count" className="text-2xl font-bold text-stone-900">{studied}</p>
          <p className="text-xs text-stone-500 mt-0.5">Studied</p>
        </div>
        <div className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm text-center">
          <p data-testid="overview-mastered-count" className="text-2xl font-bold text-emerald-600">{counts.mastered}</p>
          <p className="text-xs text-stone-500 mt-0.5">Mastered</p>
        </div>
        <div className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-amber-500">{counts.learning}</p>
          <p className="text-xs text-stone-500 mt-0.5">Learning</p>
        </div>
        <div className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-red-500">{counts.struggling}</p>
          <p className="text-xs text-stone-500 mt-0.5">Struggling</p>
        </div>
      </div>
    </div>
  );
}

// ── Letters Tab ───────────────────────────────────────────────────────────────

function LetterDetailModal({ letter, history, mastery, onClose }) {
  const cfg = MASTERY_CONFIG[mastery];
  const total = history.length;
  const correct = history.filter(Boolean).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const last10 = history.slice(-10);
  const last10Correct = last10.filter(Boolean).length;
  const last10Acc = last10.length > 0 ? Math.round((last10Correct / last10.length) * 100) : 0;

  return (
    <motion.div
      data-testid="letter-detail-modal"
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      style={{ backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-t-3xl px-6 pt-5 pb-10 overflow-y-auto"
        style={{ maxHeight: '85vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-16 h-16 rounded-2xl border-2 ${cfg.border} ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
            <span style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif", fontSize: 30, lineHeight: 1 }}>
              {letter.gurmukhi}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-extrabold text-stone-900 leading-tight truncate">{letter.romanization}</p>
            <p className="text-sm text-stone-500 truncate">{letter.name}</p>
          </div>
          <div className={`px-3 py-1 rounded-full ${cfg.bg} ${cfg.text} text-xs font-bold border ${cfg.border} flex-shrink-0`}>
            {cfg.label}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p data-testid="detail-attempts" className="text-xl font-bold text-stone-900">{total}</p>
            <p className="text-xs text-stone-500 mt-0.5">Attempts</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p data-testid="detail-accuracy" className="text-xl font-bold text-emerald-600">{total > 0 ? `${accuracy}%` : '—'}</p>
            <p className="text-xs text-stone-500 mt-0.5">All-time</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-stone-900">{last10.length > 0 ? `${last10Acc}%` : '—'}</p>
            <p className="text-xs text-stone-500 mt-0.5">Last {last10.length || '–'}</p>
          </div>
        </div>

        {/* Last 10 accuracy bar */}
        {last10.length > 0 && (
          <div className="mb-5">
            <div className="flex justify-between mb-1">
              <p className="text-xs text-stone-400 font-medium">Recent accuracy</p>
              <p className="text-xs font-bold text-stone-600">{last10Acc}%</p>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${last10Acc}%`,
                  background: last10Acc >= 80 ? '#22c55e' : last10Acc >= 50 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>
        )}

        {/* History grid */}
        {total > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
              History · oldest → newest
            </p>
            <div className="flex flex-wrap gap-1.5">
              {history.map((c, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    c ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                  }`}
                >
                  {c ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-400 text-center py-6">Not studied yet — start practicing!</p>
        )}
      </motion.div>
    </motion.div>
  );
}

function LetterGridItem({ letter, mastery, history, onClick }) {
  const cfg = MASTERY_CONFIG[mastery];
  const last10 = history.slice(-10);
  return (
    <button
      data-testid={`letter-grid-item-${letter.id}`}
      onClick={onClick}
      className={`rounded-2xl border-2 p-2.5 flex flex-col items-center gap-1 transition-all active:scale-95 hover:shadow-sm ${cfg.border} ${cfg.bg}`}
    >
      <span
        className="leading-none select-none"
        style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif", fontSize: 22 }}
      >
        {letter.gurmukhi}
      </span>
      <span className="text-xs text-stone-500 font-medium truncate w-full text-center leading-tight">
        {letter.romanization}
      </span>
      {last10.length > 0 && (
        <div className="flex gap-0.5 flex-wrap justify-center mt-0.5">
          {last10.map((c, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${c ? 'bg-emerald-400' : 'bg-red-400'}`} />
          ))}
        </div>
      )}
    </button>
  );
}

function LettersTab({ alphabet, getMastery, progress }) {
  const [sortBy, setSortBy] = useState('mastery');
  const [selectedLetter, setSelectedLetter] = useState(null);

  const grouped = (() => {
    if (sortBy === 'mastery') {
      const sorted = [...alphabet].sort(
        (a, b) => MASTERY_SORT_ORDER[getMastery(a.id)] - MASTERY_SORT_ORDER[getMastery(b.id)]
      );
      return [{ label: null, letters: sorted }];
    }
    // Group by category in canonical order
    const byCategory = {};
    alphabet.forEach((l) => {
      if (!byCategory[l.category]) byCategory[l.category] = [];
      byCategory[l.category].push(l);
    });
    return CATEGORY_ORDER
      .filter((cat) => byCategory[cat]?.length)
      .map((cat) => ({ label: CATEGORY_LABELS[cat] || cat, letters: byCategory[cat] }));
  })();

  return (
    <div>
      {/* Sort toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          {alphabet.length} Letters
        </p>
        <div className="flex gap-0.5 bg-stone-100 p-0.5 rounded-lg">
          {[['mastery', 'Mastery'], ['category', 'Category']].map(([v, lbl]) => (
            <button
              key={v}
              data-testid={`sort-${v}`}
              onClick={() => setSortBy(v)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                sortBy === v ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped grid */}
      {grouped.map(({ label, letters }, gi) => (
        <div key={gi} className="mb-4">
          {label && (
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              {label}
            </p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {letters.map((letter) => (
              <LetterGridItem
                key={letter.id}
                letter={letter}
                mastery={getMastery(letter.id)}
                history={progress[letter.id]?.history || []}
                onClick={() => setSelectedLetter(letter)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Detail modal */}
      <AnimatePresence>
        {selectedLetter && (
          <LetterDetailModal
            key="detail"
            letter={selectedLetter}
            history={progress[selectedLetter.id]?.history || []}
            mastery={getMastery(selectedLetter.id)}
            onClose={() => setSelectedLetter(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Time Tab ──────────────────────────────────────────────────────────────────

function TimeTab({ stats }) {
  if (!stats) return (
    <div className="flex justify-center py-16">
      <RefreshCw className="w-5 h-5 text-stone-300 animate-spin" />
    </div>
  );
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Today</p>
        <div className="flex gap-3">
          <TimeCard icon={Clock}    label="App time"      value={formatTime(stats.today_app_seconds)}      bgClass="bg-amber-100"   iconClass="text-amber-600"   testId="stats-today-app-time" />
          <TimeCard icon={BookOpen} label="Practice time" value={formatTime(stats.today_practice_seconds)} bgClass="bg-emerald-100" iconClass="text-emerald-600" testId="stats-today-practice-time" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">All Time</p>
        <div className="flex gap-3">
          <TimeCard icon={Clock}    label="App time"      value={formatTime(stats.total_app_seconds)}      bgClass="bg-amber-100"   iconClass="text-amber-600"   testId="stats-total-app-time" />
          <TimeCard icon={BookOpen} label="Practice time" value={formatTime(stats.total_practice_seconds)} bgClass="bg-emerald-100" iconClass="text-emerald-600" testId="stats-total-practice-time" />
        </div>
      </div>
      <p className="text-xs text-stone-400 text-center leading-relaxed">
        App time tracks when this tab is active.
        <br />Practice time counts your study sessions.
      </p>
    </div>
  );
}

// ── Streak Tab ────────────────────────────────────────────────────────────────

function StreakTab({ stats }) {
  if (!stats) return (
    <div className="flex justify-center py-16">
      <RefreshCw className="w-5 h-5 text-stone-300 animate-spin" />
    </div>
  );
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Streak</p>
      <div className="flex gap-3 mb-3">
        <TimeCard
          icon={Flame}
          label="Current streak"
          value={formatStreak(stats.current_streak)}
          bgClass={stats.practiced_today ? 'bg-amber-100' : 'bg-stone-100'}
          iconClass={stats.practiced_today ? 'text-amber-500' : 'text-stone-400'}
          testId="stats-current-streak"
        />
        <TimeCard
          icon={Trophy}
          label="Best streak"
          value={formatStreak(stats.longest_streak)}
          bgClass="bg-violet-100"
          iconClass="text-violet-600"
          testId="stats-longest-streak"
        />
      </div>
      {stats.practiced_today ? (
        <p className="text-xs text-amber-600 font-medium text-center">Streak active — practiced today!</p>
      ) : (stats.current_streak ?? 0) > 0 ? (
        <p className="text-xs text-stone-400 text-center">Practice today to keep your streak alive!</p>
      ) : null}
      <p className="text-xs text-stone-400 text-center mt-3 leading-relaxed">
        Starting any session counts as practiced.
        <br />1 grace day per week before streak resets.
      </p>
    </div>
  );
}

// ── Calendar Tab ──────────────────────────────────────────────────────────────

function CalendarTab({ daily }) {
  const today = new Date();
  const todayKey = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  // View starts on the current month; user can page backward/forward.
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  // Map ISO date → practice seconds for O(1) lookup.
  const byDate = React.useMemo(() => {
    const map = {};
    (daily || []).forEach((d) => { map[d.date] = d.practice_seconds || 0; });
    return map;
  }, [daily]);

  if (!daily) return (
    <div className="flex justify-center py-16">
      <RefreshCw className="w-5 h-5 text-stone-300 animate-spin" />
    </div>
  );

  const firstWeekday = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const isCurrentMonth = view.y === today.getFullYear() && view.m === today.getMonth();

  // Build the grid: leading blanks to align the 1st, then each day.
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const goNext = () => { if (!isCurrentMonth) setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 })); };

  // Days this month with any study, for a quick summary line.
  let studied = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (dayLevel(byDate[isoDate(view.y, view.m, d)]) !== 'none') studied += 1;
  }

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          data-testid="calendar-prev"
          onClick={goPrev}
          className="p-2 rounded-full hover:bg-stone-200 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600" />
        </button>
        <p className="text-sm font-bold text-stone-800">{MONTH_LABELS[view.m]} {view.y}</p>
        <button
          data-testid="calendar-next"
          onClick={goNext}
          disabled={isCurrentMonth}
          className="p-2 rounded-full hover:bg-stone-200 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAY_LABELS.map((w, i) => (
            <div key={i} className="text-center text-[10px] font-bold uppercase tracking-wide text-stone-400">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (d === null) return <div key={`b${i}`} />;
            const key = isoDate(view.y, view.m, d);
            const isFuture = key > todayKey;
            const isToday = key === todayKey;
            const level = dayLevel(byDate[key]);
            const cfg = CAL_LEVEL[level];
            return (
              <div
                key={key}
                data-testid={`calendar-day-${key}`}
                data-level={isFuture ? 'future' : level}
                title={isFuture ? '' : `${key} · ${formatTime(byDate[key] || 0)} practice`}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                  isToday ? 'ring-2 ring-pink-500 ring-offset-1' : ''
                }`}
                style={{
                  background: isFuture ? 'transparent' : cfg.fill,
                  color: isFuture ? '#d6d3d1' : cfg.text,
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary + legend */}
      <p className="text-xs text-stone-500 text-center mt-3">
        {studied === 0
          ? 'No study days this month yet.'
          : `Studied on ${studied} ${studied === 1 ? 'day' : 'days'} this month.`}
      </p>
      <div className="flex items-center justify-center gap-4 mt-4">
        {['none', 'light', 'solid'].map((lvl) => (
          <div key={lvl} className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded" style={{ background: CAL_LEVEL[lvl].fill }} />
            <span className="text-xs text-stone-600 font-medium">{CAL_LEVEL[lvl].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Stats Page ───────────────────────────────────────────────────────────

export default function Stats() {
  const navigate = useNavigate();
  const { alphabet, getMastery, progress } = useProgress();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats]         = useState(null);
  const [daily, setDaily]         = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [statsRes, dailyRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/stats/daily`),
      ]);
      setStats(statsRes.data);
      setDaily(dailyRes.data);
    } catch (e) {
      console.error('Failed to load stats', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div
      data-testid="stats-page"
      className="min-h-screen bg-stone-50 flex flex-col"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          data-testid="stats-back-btn"
          onClick={() => navigate('/')}
          className="p-2.5 rounded-full hover:bg-stone-200 transition-colors -ml-1"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Statistics</h1>
        <button
          data-testid="stats-refresh-btn"
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="ml-auto p-2.5 rounded-full hover:bg-stone-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-stone-500 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex gap-0.5 bg-stone-100 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <div className="flex-1 px-5 pb-10 max-w-md mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab alphabet={alphabet} getMastery={getMastery} />
            )}
            {activeTab === 'letters' && (
              <LettersTab alphabet={alphabet} getMastery={getMastery} progress={progress} />
            )}
            {activeTab === 'calendar' && <CalendarTab daily={daily} />}
            {activeTab === 'time' && <TimeTab stats={stats} />}
            {activeTab === 'streak' && <StreakTab stats={stats} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
