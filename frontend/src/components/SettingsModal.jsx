import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, RotateCcw, Volume2 } from 'lucide-react';
import { useSettings, DEFAULT_SETTINGS } from '../context/SettingsContext';

const MASTERY_ROWS = [
  { key: 'struggling', dot: 'bg-red-500',     label: 'Struggling', desc: '>3 wrong in last 10' },
  { key: 'learning',   dot: 'bg-amber-500',   label: 'Learning',   desc: 'In progress' },
  { key: 'new',        dot: 'bg-stone-400',   label: 'New',        desc: 'Never attempted' },
  { key: 'mastered',   dot: 'bg-emerald-500', label: 'Mastered',   desc: '10/10 in last 10' },
];

const MULTIPLIERS = [1, 1.5, 2, 3, 5];

function Toggle({ on, onToggle, testId }) {
  return (
    <button
      data-testid={testId}
      onClick={onToggle}
      className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
        on ? 'bg-pink-600' : 'bg-stone-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          on ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function WeightSlider({ masteryKey, dot, label, desc, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
          <span className="text-sm font-semibold text-stone-800">{label}</span>
          <span className="text-xs text-stone-400 hidden sm:inline">{desc}</span>
        </div>
        <span className="text-sm font-bold text-pink-600 tabular-nums w-8 text-right">
          {value % 1 === 0 ? value : value.toFixed(1)}×
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-300 w-10 flex-shrink-0">Rarely</span>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-pink-600"
          data-testid={`weight-slider-${masteryKey}`}
          style={{ accentColor: '#DB2777' }}
        />
        <span className="text-xs text-stone-300 w-14 flex-shrink-0 text-right">Very often</span>
      </div>
    </div>
  );
}

export default function SettingsModal({ open, onClose }) {
  const { settings, updateSettings, resetSettings } = useSettings();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 text-pink-600" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Study Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            data-testid="settings-close-btn"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6" style={{ maxHeight: '70vh' }}>

          {/* ── Voice Preference ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-stone-900">Voice</p>
                <p className="text-xs text-stone-400 leading-snug">
                  56 letters have real human recordings. Others use AI.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                data-testid="voice-human-btn"
                onClick={() => updateSettings({ voicePreference: 'human' })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  settings.voicePreference !== 'ai'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-400/30 border border-emerald-500 inline-flex items-center justify-center text-[8px] font-bold text-emerald-700">H</span>
                  Human
                </span>
              </button>
              <button
                data-testid="voice-ai-btn"
                onClick={() => updateSettings({ voicePreference: 'ai' })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  settings.voicePreference === 'ai'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-400/30 border border-blue-500 inline-flex items-center justify-center text-[8px] font-bold text-blue-700">AI</span>
                  AI Voice
                </span>
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-2">
              {settings.voicePreference === 'ai'
                ? 'All letters use AI-generated pronunciation.'
                : 'Human recordings play first. AI handles the rest.'}
            </p>
          </div>

          <div className="h-px bg-stone-100" />

          {/* ── Smart Review Toggle ── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-bold text-stone-900">Smart Review</p>
              <p className="text-sm text-stone-500 mt-0.5 leading-snug">
                Struggling letters appear more often. Mastered letters appear less.
                {!settings.srEnabled && (
                  <span className="block mt-1 text-stone-400 italic">Currently: random order, each letter once.</span>
                )}
              </p>
            </div>
            <Toggle on={settings.srEnabled} onToggle={() => updateSettings({ srEnabled: !settings.srEnabled })} testId="sr-toggle" />
          </div>

          {/* ── SR Config (animated) ── */}
          <AnimatePresence>
            {settings.srEnabled && (
              <motion.div
                key="sr-config"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-6 pt-2">
                  {/* Frequency Weights */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
                      Frequency Weights
                    </p>
                    <p className="text-xs text-stone-400 mb-4">
                      Relative frequency each mastery level appears in your session.
                    </p>
                    <div className="space-y-4">
                      {MASTERY_ROWS.map(({ key, dot, label, desc }) => (
                        <WeightSlider
                          key={key}
                          masteryKey={key}
                          dot={dot}
                          label={label}
                          desc={desc}
                          value={settings.weights[key]}
                          onChange={val => updateSettings({ weights: { [key]: val } })}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Session Length Multiplier */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
                      Session Length
                    </p>
                    <p className="text-xs text-stone-400 mb-3">
                      Total cards = selected letters × multiplier
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {MULTIPLIERS.map(m => (
                        <button
                          key={m}
                          data-testid={`multiplier-${m}`}
                          onClick={() => updateSettings({ sessionMultiplier: m })}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                            settings.sessionMultiplier === m
                              ? 'bg-pink-600 text-white shadow-sm'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {m}×
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avoid back-to-back */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Avoid back-to-back</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Don&apos;t show the same letter twice in a row
                      </p>
                    </div>
                    <Toggle
                      on={settings.avoidImmediateRepeat}
                      onToggle={() => updateSettings({ avoidImmediateRepeat: !settings.avoidImmediateRepeat })}
                      testId="avoid-repeat-toggle"
                    />
                  </div>

                  {/* Reset */}
                  <button
                    data-testid="reset-settings-btn"
                    onClick={resetSettings}
                    className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to defaults
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl active:scale-[0.98] transition-all"
            data-testid="settings-done-btn"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
