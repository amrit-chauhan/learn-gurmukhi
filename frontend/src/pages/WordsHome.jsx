/**
 * WordsHome page  (/words)
 *
 * Landing for the "Practice Words" feature. Shows the three word sections —
 * Common Words, Days of the Week, Numbers (0–100) — each as a card that starts
 * a flashcard session over every word in that section.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageSquareText, CalendarDays, Hash } from 'lucide-react';
import { useWords, WORD_CATEGORIES } from '../hooks/useWords';

const CATEGORY_ICON = {
  common: MessageSquareText,
  days: CalendarDays,
  numbers: Hash,
};

const CATEGORY_STYLE = {
  common: { bg: 'bg-pink-50', text: 'text-pink-600' },
  days: { bg: 'bg-violet-50', text: 'text-violet-600' },
  numbers: { bg: 'bg-orange-50', text: 'text-orange-600' },
};

export default function WordsHome() {
  const navigate = useNavigate();
  const { byCategory, loading } = useWords();

  const startSession = (categoryId, label) => {
    const ids = byCategory(categoryId).map((w) => w.id);
    if (ids.length === 0) return;
    navigate('/word-study', { state: { selectedIds: ids, title: label } });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6 relative">
        <button
          data-testid="words-back-btn"
          onClick={() => navigate('/')}
          className="absolute top-12 left-5 p-2.5 rounded-full hover:bg-stone-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-500" />
        </button>
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Practice Words
          </h1>
          <p className="mt-2 text-base text-stone-500 font-medium">
            Read the Gurmukhi, then reveal how to say it &amp; what it means
          </p>
        </div>
      </div>

      {/* Section cards */}
      <div className="flex-1 px-5 pb-8 flex flex-col gap-4 max-w-md mx-auto w-full">
        {WORD_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICON[cat.id] || MessageSquareText;
          const style = CATEGORY_STYLE[cat.id] || CATEGORY_STYLE.common;
          const count = byCategory(cat.id).length;
          return (
            <button
              key={cat.id}
              data-testid={`word-section-${cat.id}`}
              disabled={loading || count === 0}
              onClick={() => startSession(cat.id, cat.label)}
              className="w-full flex items-center gap-4 rounded-2xl bg-white border border-stone-100 p-6 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:active:scale-100"
            >
              <div className={`w-14 h-14 rounded-2xl ${style.bg} flex items-center justify-center flex-shrink-0 ${style.text}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-stone-900">{cat.label}</h2>
                <p className="text-sm text-stone-500 mt-0.5">
                  {cat.desc}
                  {count > 0 && <span className="text-stone-400"> · {count} words</span>}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300 flex-shrink-0" />
            </button>
          );
        })}

        {loading && (
          <p className="text-center text-sm text-stone-400 mt-2">Loading words…</p>
        )}
      </div>
    </div>
  );
}
