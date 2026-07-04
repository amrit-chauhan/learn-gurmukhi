import React from 'react';

const masteryStyles = {
  new:        'bg-white border-stone-200',
  mastered:   'bg-emerald-50 border-emerald-300',
  learning:   'bg-amber-50 border-amber-300',
  struggling: 'bg-red-50 border-red-300',
};

const masteryDot = {
  new: '',
  mastered:   'bg-emerald-500',
  learning:   'bg-amber-500',
  struggling: 'bg-red-500',
};

/**
 * WordGridItem
 *
 * Selectable word tile for the word-selection grid. Shows the Gurmukhi word
 * with its romanization, colour-coded by mastery. Supports tap-to-toggle and
 * drag-to-select, same protocol as LetterGridItem.
 */
export default function WordGridItem({ word, selected, mastery, onToggle, onDragStart, onDragEnter }) {
  const base = masteryStyles[mastery] || masteryStyles.new;
  const selectedRing = selected
    ? 'ring-2 ring-pink-500 ring-offset-1 border-pink-500 bg-pink-50'
    : 'hover:border-pink-300 hover:bg-pink-50/30';

  const handlePointerDown = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    onDragStart?.(word.id, selected);
    onToggle(word.id);
  };
  const handlePointerEnter = (e) => {
    if (e.buttons > 0) onDragEnter?.(word.id);
  };

  return (
    <button
      data-testid={`word-tile-${word.id}`}
      data-word-id={word.id}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 px-2 py-3 min-h-[72px]
        transition-all duration-100 select-none ${base} ${selectedRing}`}
      style={{ touchAction: 'none' }}
    >
      {mastery !== 'new' && (
        <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${masteryDot[mastery]}`} />
      )}
      <span
        className="text-xl leading-tight font-semibold text-stone-900 text-center"
        style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif" }}
      >
        {word.gurmukhi}
      </span>
      <span className="text-[10px] text-stone-500 mt-1 truncate w-full text-center font-medium">
        {word.romanization}
      </span>
    </button>
  );
}
