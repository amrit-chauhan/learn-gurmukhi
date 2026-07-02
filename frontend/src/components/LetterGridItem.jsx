import React from 'react';

const masteryStyles = {
  new:       'bg-white border-stone-200 text-stone-800',
  mastered:  'bg-emerald-50 border-emerald-300 text-emerald-800',
  learning:  'bg-amber-50 border-amber-300 text-amber-800',
  struggling:'bg-red-50 border-red-300 text-red-800',
};

const masteryDot = {
  new: '',
  mastered:  'bg-emerald-500',
  learning:  'bg-amber-500',
  struggling:'bg-red-500',
};

/**
 * LetterGridItem
 *
 * Supports both tap-to-toggle and drag-to-select.
 *
 * Drag protocol:
 *   onDragStart(id, currentlySelected) – called on pointerdown, so parent
 *     can set the drag mode ('select' or 'deselect') before moving.
 *   onDragEnter(id) – called on pointerenter while a pointer button is held;
 *     parent applies the active drag mode to this letter.
 *
 * We call releasePointerCapture immediately so that pointerenter events keep
 * firing on sibling elements as the finger/cursor moves across them.
 */
export default function LetterGridItem({ letter, selected, mastery, onToggle, onDragStart, onDragEnter }) {
  const base = masteryStyles[mastery] || masteryStyles.new;
  const selectedRing = selected
    ? 'ring-2 ring-pink-500 ring-offset-1 border-pink-500 bg-pink-50'
    : 'hover:border-pink-300 hover:bg-pink-50/30';

  const handlePointerDown = (e) => {
    // Release capture immediately so sibling onPointerEnter events fire during drag
    e.currentTarget.releasePointerCapture(e.pointerId);
    onDragStart?.(letter.id, selected);
    onToggle(letter.id);
  };

  const handlePointerEnter = (e) => {
    // e.buttons > 0 means at least one pointer button / touch is active
    if (e.buttons > 0) {
      onDragEnter?.(letter.id);
    }
  };

  return (
    <button
      data-testid={`letter-tile-${letter.id}`}
      data-letter-id={letter.id}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      className={`
        relative aspect-square flex flex-col items-center justify-center rounded-xl border-2
        transition-all duration-100 select-none
        ${base} ${selectedRing}
      `}
      style={{ touchAction: 'none' }}
    >
      {mastery !== 'new' && (
        <span
          className={`absolute top-1 right-1 w-2 h-2 rounded-full ${masteryDot[mastery]}`}
        />
      )}
      <span
        className="text-2xl sm:text-3xl font-semibold leading-none gurmukhi"
        style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif" }}
      >
        {letter.gurmukhi}
      </span>
      <span className="text-[9px] sm:text-[10px] text-stone-500 mt-1 truncate w-full text-center px-0.5 font-medium">
        {letter.romanization.split(' ')[0]}
      </span>
    </button>
  );
}
