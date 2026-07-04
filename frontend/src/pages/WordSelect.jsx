/**
 * WordSelect page  (/word-select)
 *
 * Grid of every word in one section (Common / Days / Numbers / Songs) with
 * mastery colour-coding. The user can select a subset, then:
 *   - Practice Random  → shuffled practice of the selected words (or all if
 *     none selected) — the primary, larger button.
 *   - Practice in Order → walks through EVERY word in the section once, in
 *     order (numbers 0→100), resuming where you left off last time.
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Square, Shuffle, ListOrdered, Bookmark, Check } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useProfile } from '../context/ProfileContext';
import { useWords, WORD_CATEGORIES } from '../hooks/useWords';
import { useLetterSelection } from '../hooks/useLetterSelection';
import { useSavedSelections } from '../hooks/useSavedSelections';
import { computeWordMastery } from '../utils/wordMastery';
import WordGridItem from '../components/WordGridItem';

const MASTERY_LEGEND = [
  { key: 'mastered',   label: 'Mastered',   dot: 'bg-emerald-500' },
  { key: 'learning',   label: 'Learning',   dot: 'bg-amber-500' },
  { key: 'struggling', label: 'Struggling', dot: 'bg-red-500' },
  { key: 'new',        label: 'New',        dot: 'bg-stone-300' },
];

export default function WordSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { byCategory, loading } = useWords();
  const { progress } = useProgress();
  const { activeProfileId } = useProfile();

  const category = state?.category ?? 'common';
  const meta = WORD_CATEGORIES.find((c) => c.id === category) || { label: 'Practice Words' };

  const words = useMemo(() => byCategory(category), [byCategory, category]);
  const { selectedIds, toggle, applyDrag, selectAll, deselectAll, isAllSelected } = useLetterSelection();
  const { save: saveSelection } = useSavedSelections();
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveSelection = () => {
    if (selectedIds.size === 0) return;
    const suggested = `${meta.label} · ${selectedIds.size}`;
    const name = window.prompt('Name this selection:', suggested);
    if (name === null) return; // cancelled
    saveSelection(name, Array.from(selectedIds), category);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const getWordMastery = (id) => computeWordMastery(progress[id]?.history);

  // ── Drag-to-select ────────────────────────────────────────────────────
  const dragMode = useRef(null);
  const handleDragStart = (id, currentlySelected) => {
    dragMode.current = currentlySelected ? 'deselect' : 'select';
  };
  const handleDragEnter = (id) => { if (dragMode.current) applyDrag(id, dragMode.current); };
  useEffect(() => {
    const end = () => { dragMode.current = null; };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, []);

  // ── In-order resume position (for the button hint) ────────────────────
  const [resumePos, setResumePos] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`wordOrder:${activeProfileId || 'default'}:${category}`);
      const n = parseInt(raw || '0', 10);
      setResumePos(Number.isFinite(n) && n > 0 && n < words.length ? n : 0);
    } catch { setResumePos(0); }
  }, [activeProfileId, category, words.length]);

  const allSelected = isAllSelected(words);

  const startRandom = () => {
    const ids = selectedIds.size > 0 ? Array.from(selectedIds) : words.map((w) => w.id);
    if (ids.length === 0) return;
    navigate('/word-study', { state: { selectedIds: ids, title: meta.label, category, ordered: false } });
  };

  const startInOrder = () => {
    const ids = words.map((w) => w.id); // whole section, in order
    if (ids.length === 0) return;
    navigate('/word-study', { state: { selectedIds: ids, title: meta.label, category, ordered: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-400 text-lg">
        Loading words…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-stone-50/90 backdrop-blur-sm border-b border-stone-100 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            data-testid="word-select-back"
            onClick={() => navigate('/words')}
            className="p-2 rounded-full hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-stone-900">{meta.label}</h1>
            <p className="text-xs text-stone-500">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${words.length} words`}
            </p>
          </div>
          <button
            data-testid="word-select-all"
            onClick={() => (allSelected ? deselectAll(words) : selectAll(words))}
            className="flex items-center gap-1.5 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
          >
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {allSelected ? 'Deselect' : 'Select all'}
          </button>
        </div>

        {/* Mastery legend */}
        <div className="mt-2 max-w-2xl mx-auto flex flex-wrap gap-x-4 gap-y-1">
          {MASTERY_LEGEND.map((m) => (
            <span key={m.key} className="inline-flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
              <span className={`w-2 h-2 rounded-full ${m.dot}`} />
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Word grid */}
      <div className="flex-1 px-4 pt-4 pb-36 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {words.map((word) => (
            <WordGridItem
              key={word.id}
              word={word}
              selected={selectedIds.has(word.id)}
              mastery={getWordMastery(word.id)}
              onToggle={toggle}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
            />
          ))}
        </div>
        {words.length === 0 && (
          <p className="text-center text-stone-400 mt-8">No words in this section yet</p>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 px-5 pt-3 pb-5">
        <div className="max-w-md mx-auto space-y-2.5">
          {selectedIds.size > 0 && (
            <button
              data-testid="save-selection-btn"
              onClick={handleSaveSelection}
              className="w-full py-2 rounded-xl font-semibold text-sm bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {justSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
              {justSaved ? 'Saved!' : `Save selection (${selectedIds.size})`}
            </button>
          )}
          <button
            data-testid="practice-random-btn"
            onClick={startRandom}
            className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-pink-600 to-orange-500 text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Shuffle className="w-5 h-5" />
            Practice Random
            <span className="font-medium opacity-90">
              · {selectedIds.size > 0 ? selectedIds.size : words.length}
            </span>
          </button>
          <button
            data-testid="practice-in-order-btn"
            onClick={startInOrder}
            className="w-full py-3 rounded-2xl font-semibold text-sm bg-white border border-stone-200 text-stone-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ListOrdered className="w-4 h-4" />
            {resumePos > 0 ? `Resume in order · #${resumePos + 1}` : 'Practice in Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
