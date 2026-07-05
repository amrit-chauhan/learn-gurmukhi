/**
 * Home page
 *
 * Landing screen: shows summary stats, study-mode cards, mastery legend,
 * and the settings entry point.
 * Uses getMastery from ProgressContext to keep mastery logic in one place.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Settings, BarChart2, Flame, Zap, ChevronRight, PenLine, BookText } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';
import { useSettings } from '../context/SettingsContext';
import { useStats } from '../hooks/useStats';
import SettingsModal from '../components/SettingsModal';
import StatsBar from '../components/home/StatsBar';
import HomeSkeleton from '../components/home/HomeSkeleton';
import MasteryLegend from '../components/home/MasteryLegend';
import SrBadge from '../components/common/SrBadge';
import { STUDY_MODES } from '../constants/modes';

function StreakBanner({ stats }) {
  if (!stats) return null;
  const { current_streak = 0, practiced_today = false } = stats;
  const active = practiced_today;

  return (
    <div className="mt-4 flex justify-center">
      <div
        data-testid="home-streak-banner"
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
          active
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-stone-100 border-stone-200 text-stone-500'
        }`}
      >
        <Flame className={`w-4 h-4 ${active ? 'text-amber-500' : 'text-stone-400'}`} />
        {current_streak > 0 ? (
          <>
            <span data-testid="home-streak-count">{current_streak}</span>
            <span>{current_streak === 1 ? 'day' : 'days'} streak</span>
            {active && <span className="text-amber-400 text-xs font-bold">✓</span>}
          </>
        ) : (
          <span>Start your streak today!</span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { alphabet, getMastery, resetProgress, loading } = useProgress();
  const { activeProfile } = useProfile();
  const { settings } = useSettings();
  const stats = useStats();
  const [showSettings, setShowSettings] = useState(false);

  // Show the structural skeleton until the alphabet + progress have loaded,
  // rather than briefly flashing an empty stat bar with zeroed counts.
  if (loading || alphabet.length === 0) return <HomeSkeleton />;

  // Derived stats – use getMastery so the logic stays in ProgressContext
  const studiedCount      = alphabet.filter((l) => getMastery(l.id) !== 'new').length;
  const masteredCount     = alphabet.filter((l) => getMastery(l.id) === 'mastered').length;
  const strugglingLetters = alphabet.filter((l) => getMastery(l.id) === 'struggling');

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 pt-12 pb-6 text-center relative">
        <button
          data-testid="stats-nav-btn"
          onClick={() => navigate('/stats')}
          className="absolute top-12 left-5 p-2.5 rounded-full hover:bg-stone-200 transition-colors"
        >
          <BarChart2 className="w-5 h-5 text-stone-500" />
        </button>

        <button
          data-testid="settings-btn"
          onClick={() => setShowSettings(true)}
          className="absolute top-12 right-5 p-2.5 rounded-full hover:bg-stone-200 transition-colors"
        >
          <Settings className="w-5 h-5 text-stone-500" />
        </button>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Learn Punjabi
        </h1>
        <p className="mt-2 text-base text-stone-500 font-medium">
          Master the Gurmukhi alphabet
        </p>

        {activeProfile && (
          <button
            data-testid="profile-chip"
            onClick={() => navigate('/settings')}
            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
          >
            <span className="text-lg leading-none" aria-hidden>{activeProfile.avatar}</span>
            <span className="text-sm font-bold text-stone-700">{activeProfile.name}</span>
          </button>
        )}

        <StatsBar
          studiedCount={studiedCount}
          masteredCount={masteredCount}
          totalLetters={alphabet.length}
        />
        <StreakBanner stats={stats} />
      </div>

      {/* ── Mode cards ─────────────────────────────────────────────────── */}
      <div className="flex-1 px-5 pb-8 flex flex-col gap-4 max-w-md mx-auto w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 text-center">
          Choose a study mode
        </p>

        {/* ── Struggling letters shortcut ─────────────────────────── */}
        {strugglingLetters.length > 0 && (
          <button
            data-testid="practice-struggling-btn"
            onClick={() =>
              navigate('/study', {
                state: {
                  mode: 'gurmukhi_to_sound',
                  selectedIds: strugglingLetters.map((l) => l.id),
                },
              })
            }
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 border border-red-200 hover:bg-red-100 active:scale-[0.99] transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4.5 h-4.5 text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-red-700">Practice Struggling Letters</p>
              <p className="text-xs text-red-400 mt-0.5">
                {strugglingLetters.length} letter{strugglingLetters.length !== 1 ? 's' : ''} need{strugglingLetters.length === 1 ? 's' : ''} attention
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0" />
          </button>
        )}

        {STUDY_MODES.map((mode) => (
          <button
            key={mode.id}
            data-testid={`mode-${mode.id}`}
            onClick={() => navigate('/select', { state: { mode: mode.id } })}
            className="w-full rounded-2xl bg-white border border-stone-100 p-6 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl ${mode.lightBg} flex items-center justify-center flex-shrink-0 ${mode.textColor}`}
              >
                <span
                  style={{
                    fontFamily: mode.iconIsGurmukhi
                      ? "'Noto Sans Gurmukhi', sans-serif"
                      : "'Manrope', sans-serif",
                    fontSize: mode.iconIsGurmukhi ? 32 : 28,
                    fontWeight: 800,
                  }}
                >
                  {mode.icon}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-stone-900">{mode.title}</h2>
                  {settings.srEnabled && <SrBadge variant="full" />}
                </div>
                <p className="text-sm text-stone-500 mt-0.5">{mode.desc}</p>
              </div>
            </div>
          </button>
        ))}

        {/* ── Practice Words ──────────────────────────────────────── */}
        <button
          data-testid="mode-words"
          onClick={() => navigate('/words')}
          className="w-full flex items-center gap-4 rounded-2xl bg-white border border-stone-100 p-6 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
        >
          <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center flex-shrink-0 text-pink-600">
            <BookText className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-stone-900">Practice Words</h2>
            <p className="text-sm text-stone-500 mt-0.5">Common words, days of the week &amp; numbers 0–100</p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
        </button>

        {/* ── Writing / tracing mode ──────────────────────────────── */}
        <button
          data-testid="mode-writing"
          onClick={() => navigate('/writing')}
          className="w-full flex items-center gap-4 rounded-2xl bg-white border border-stone-100 p-6 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-700">
            <PenLine className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-stone-900">Writing Practice</h2>
            <p className="text-sm text-stone-500 mt-0.5">Trace or free-draw letters, then reveal the answer</p>
          </div>
        </button>

        <MasteryLegend />

        {/* Reset */}
        <button
          data-testid="reset-progress-btn"
          onClick={async () => {
            if (window.confirm('Reset all progress? This cannot be undone.')) {
              await resetProgress();
            }
          }}
          className="flex items-center justify-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors py-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset all progress
        </button>
      </div>
    </div>
  );
}
