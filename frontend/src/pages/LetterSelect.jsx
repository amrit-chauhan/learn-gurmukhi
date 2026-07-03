/**
 * LetterSelect page
 *
 * Grid of all Gurmukhi letters with mastery colour-coding.
 * User selects a subset, then starts a study session.
 *
 * Selection state lives in useLetterSelection.
 * Category filter tabs use the CATEGORIES constant; the grid itself is rendered
 * as ordered, labelled sections driven by LETTER_GROUPS + each letter's `group`.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckSquare, Square } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { useLetterSelection } from '../hooks/useLetterSelection';
import { estimateDeckSize } from '../utils/srAlgorithm';
import LetterGridItem from '../components/LetterGridItem';
import SrBadge from '../components/common/SrBadge';
import { CATEGORIES, LETTER_GROUPS } from '../constants/categories';
import { MODE_LABELS } from '../constants/modes';

export default function LetterSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { alphabet, getMastery, loading } = useProgress();
  const { settings } = useSettings();

  const mode = state?.mode ?? 'gurmukhi_to_sound';
  const { selectedIds, toggle, applyDrag, selectAll, deselectAll, isAllSelected } = useLetterSelection();

  const [activeCategory, setActiveCategory] = React.useState('all');
  const [sessionLength, setSessionLength] = React.useState(null); // null = All

  // ── Drag-to-select state ──────────────────────────────────────────────
  // dragMode: 'select' | 'deselect' | null
  const dragMode = useRef(null);

  // Start a drag: note whether we're painting selections or deselections.
  const handleDragStart = (id, currentlySelected) => {
    dragMode.current = currentlySelected ? 'deselect' : 'select';
  };

  // Apply the active drag mode to whichever letter the pointer just entered.
  const handleDragEnter = (id) => {
    if (dragMode.current) applyDrag(id, dragMode.current);
  };

  // End drag when any pointer is released anywhere on the page.
  useEffect(() => {
    const end = () => { dragMode.current = null; };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, []);

  // Ordered, labelled sections for the pedagogical layout. Each section pulls
  // its letters by `group`; when a category filter is active we keep only the
  // groups belonging to that category so the filter tabs still work. Empty
  // sections are dropped.
  const sections = useMemo(() => {
    const byGroup = new Map();
    for (const letter of alphabet) {
      const key = letter.group ?? letter.category;
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key).push(letter);
    }
    return LETTER_GROUPS
      .filter((g) => activeCategory === 'all' || g.category === activeCategory)
      .map((g) => ({ ...g, letters: byGroup.get(g.id) ?? [] }))
      .filter((s) => s.letters.length > 0);
  }, [alphabet, activeCategory]);

  // Flat list of the currently-visible letters (drives select-all / counts).
  const filtered = useMemo(() => sections.flatMap((s) => s.letters), [sections]);

  const allSelected = isAllSelected(filtered);
  const estimatedCards = estimateDeckSize(selectedIds.size, settings);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-lg">Loading alphabet…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-stone-50/90 backdrop-blur-sm border-b border-stone-100 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            data-testid="back-btn"
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900">Select Letters</h1>
              {settings.srEnabled && <SrBadge variant="medium" />}
            </div>
            <p className="text-xs text-stone-500">{MODE_LABELS[mode] ?? mode}</p>
          </div>

          <button
            data-testid="select-all-btn"
            onClick={() => (allSelected ? deselectAll(filtered) : selectAll(filtered))}
            className="flex items-center gap-1.5 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
          >
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {allSelected ? 'Deselect' : 'Select all'}
          </button>
        </div>

        {/* Category filter */}
        <div className="mt-2 max-w-2xl mx-auto flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              data-testid={`filter-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Letter grid (grouped into pedagogical sections) ─────────────── */}
      <div className="flex-1 px-4 pt-4 pb-32 max-w-2xl mx-auto w-full">
        {sections.map((section) => (
          <section
            key={section.id}
            data-testid={`section-${section.id}`}
            className={
              section.divider
                ? 'mt-8 pt-6 border-t border-stone-200'
                : 'mt-6 first:mt-0'
            }
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 px-0.5">
              {section.label}
            </h2>
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 gap-2.5">
              {section.letters.map((letter) => (
                <LetterGridItem
                  key={letter.id}
                  letter={letter}
                  selected={selectedIds.has(letter.id)}
                  mastery={getMastery(letter.id)}
                  onToggle={toggle}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                />
              ))}
            </div>
          </section>
        ))}
        {sections.length === 0 && (
          <p className="text-center text-stone-400 mt-8">No letters in this category</p>
        )}
      </div>

      {/* ── Bottom start bar ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 px-5 pt-3 pb-5">
        <div className="max-w-md mx-auto">

          {/* Session length picker */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-stone-500 font-medium">Cards per session</span>
              <div className="flex gap-1.5">
                {[10, 20, 30, null].map((n) => {
                  const label = n === null ? 'All' : String(n);
                  return (
                    <button
                      key={label}
                      data-testid={`session-length-${label.toLowerCase()}`}
                      onClick={() => setSessionLength(n)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        sessionLength === n
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            data-testid="start-study-btn"
            disabled={selectedIds.size === 0}
            onClick={() =>
              navigate('/study', {
                state: { mode, selectedIds: Array.from(selectedIds), sessionLength },
              })
            }
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              selectedIds.size > 0
                ? 'bg-gradient-to-r from-pink-600 to-orange-500 text-white shadow-lg active:scale-[0.98]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {selectedIds.size > 0
              ? settings.srEnabled
                ? `Start Smart Review · ~${sessionLength !== null ? sessionLength : estimatedCards} cards`
                : `Start Study · ${selectedIds.size} letters · ${
                    sessionLength !== null ? sessionLength : estimatedCards
                  } cards`
              : 'Select at least 1 letter'}
          </button>
        </div>
      </div>
    </div>
  );
}
