/**
 * WordStudy page
 *
 * Practice-word flashcard session. Reuses the same session engine as the
 * letter Study page (useStudySession) but with the word list as the card pool
 * and a word-tuned flashcard. Front shows the Gurmukhi word; the answer side
 * shows how to say it (romanization) + the English translation + audio.
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { useStudySession } from '../hooks/useStudySession';
import { useWords } from '../hooks/useWords';
import { useWordAudio } from '../hooks/useWordAudio';
import { useKeyboardStudy } from '../hooks/useKeyboardStudy';
import { usePracticeTimeTracker } from '../hooks/usePracticeTimeTracker';
import { useStreakCheckin } from '../hooks/useStreakCheckin';
import WordFlashcard from '../components/WordFlashcard';
import SessionScore from '../components/study/SessionScore';
import ResultsScreen from '../components/study/ResultsScreen';

export default function WordStudy() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { selectedIds, title } = state || {};
  const { words, loading } = useWords();
  const { play: playAudio } = useWordAudio();

  const {
    cards, currentIndex, currentCard,
    revealed, reveal,
    sessionResults, done,
    handleAnswer, restart, endEarly,
    correctCount, wrongCount, progress,
  } = useStudySession('word', selectedIds, null, words);

  useKeyboardStudy({
    revealed,
    done,
    onReveal: reveal,
    onCorrect: () => handleAnswer(true),
    onWrong: () => handleAnswer(false),
  });

  usePracticeTimeTracker(done);
  useStreakCheckin();

  if (done) {
    return (
      <ResultsScreen
        sessionResults={sessionResults}
        correctCount={correctCount}
        mode="word"
        onStudyAgain={restart}
        onChangeSelection={() => navigate('/words')}
      />
    );
  }

  if (loading && cards.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50 text-stone-400">
        Loading words…
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div
      className="h-screen overflow-hidden bg-stone-50 flex flex-col"
      style={{ fontFamily: "'Manrope', sans-serif", height: '100dvh' }}
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-2 flex items-center gap-3">
        <button
          data-testid="word-study-back"
          onClick={() => navigate('/words')}
          className="p-2 -ml-2 rounded-full hover:bg-stone-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-500" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-bold text-stone-800">{title || 'Practice Words'}</p>
          <div className="mt-1.5 h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-orange-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-semibold text-stone-400 tabular-nums">
          {Math.min(currentIndex + 1, cards.length)}/{cards.length}
        </span>
      </div>

      <SessionScore correctCount={correctCount} wrongCount={wrongCount} />

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-5 py-4">
        <WordFlashcard
          key={currentCard.id}
          word={currentCard}
          revealed={revealed}
          onReveal={reveal}
          onCorrect={() => handleAnswer(true)}
          onWrong={() => handleAnswer(false)}
          onPlayAudio={playAudio}
        />

        <div
          className="flex items-center justify-between w-full max-w-[340px] mt-3 px-1 select-none"
          data-testid="word-swipe-hint-bar"
        >
          <button
            type="button"
            data-testid="word-answer-wrong"
            onClick={() => handleAnswer(false)}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-500 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Didn't know</span>
          </button>
          <button
            type="button"
            data-testid="word-answer-correct"
            onClick={() => handleAnswer(true)}
            className="flex items-center gap-1.5 text-emerald-500 hover:text-emerald-600 active:scale-95 transition-all"
          >
            <span className="text-xs font-semibold">Knew it</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button
          data-testid="word-end-session-btn"
          onClick={endEarly}
          className="mt-3 text-xs text-stone-400 hover:text-stone-600 transition-colors underline-offset-2 hover:underline"
        >
          End session early
        </button>
      </div>
    </div>
  );
}
