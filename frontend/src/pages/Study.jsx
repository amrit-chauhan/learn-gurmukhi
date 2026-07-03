/**
 * Study page
 *
 * Pure renderer – all state and logic lives in hooks.
 * Composes: useStudySession · useAudioPlayer · useKeyboardStudy
 *         + StudyHeader · SessionScore · Flashcard · AnswerButtons · ResultsScreen
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useStudySession } from '../hooks/useStudySession';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useKeyboardStudy } from '../hooks/useKeyboardStudy';
import { usePracticeTimeTracker } from '../hooks/usePracticeTimeTracker';
import { useStreakCheckin } from '../hooks/useStreakCheckin';
import Flashcard from '../components/Flashcard';
import StudyHeader from '../components/study/StudyHeader';
import SessionScore from '../components/study/SessionScore';
import AnswerButtons from '../components/study/AnswerButtons';
import ResultsScreen from '../components/study/ResultsScreen';

export default function Study() {
  const { state } = useLocation();
  const { mode, selectedIds, sessionLength } = state || {};
  const { settings } = useSettings();
  const { play: playAudio } = useAudioPlayer();

  const {
    cards, currentIndex, currentCard,
    revealed, reveal,
    sessionResults, done,
    handleAnswer, restart, endEarly,
    correctCount, wrongCount, progress,
  } = useStudySession(mode, selectedIds, sessionLength);

  useKeyboardStudy({
    revealed,
    done,
    onReveal: reveal,
    onCorrect: () => handleAnswer(true),
    onWrong: () => handleAnswer(false),
  });

  // Track active practice time; flushes to backend when done or unmounted
  usePracticeTimeTracker(done);
  // Mark today as practiced (fires on mount – "just starting" counts)
  useStreakCheckin();

  if (done) {
    return (
      <ResultsScreen
        sessionResults={sessionResults}
        correctCount={correctCount}
        mode={mode}
        onStudyAgain={restart}
      />
    );
  }

  if (!currentCard) return null;

  return (
    <div
      className="h-screen overflow-hidden bg-stone-50 flex flex-col"
      style={{ fontFamily: "'Manrope', sans-serif", height: '100dvh' }}
    >
      <StudyHeader
        mode={mode}
        selectedIds={selectedIds}
        cards={cards}
        currentIndex={currentIndex}
        progress={progress}
        srEnabled={settings.srEnabled}
      />

      <SessionScore correctCount={correctCount} wrongCount={wrongCount} />

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-5 py-4">
        <Flashcard
          key={currentCard.id}
          letter={currentCard}
          mode={mode}
          revealed={revealed}
          onReveal={reveal}
          onCorrect={() => handleAnswer(true)}
          onWrong={() => handleAnswer(false)}
          onPlayAudio={playAudio}
        />

        {/* Permanent swipe-direction hint — always visible below the card */}
        <div
          className="flex items-center justify-between w-full max-w-[340px] mt-3 px-1 select-none pointer-events-none"
          data-testid="swipe-hint-bar"
        >
          <div className="flex items-center gap-1.5 text-red-400">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Wrong</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <span className="text-xs font-semibold">Correct</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* End session early */}
        <button
          data-testid="end-session-btn"
          onClick={endEarly}
          className="mt-3 text-xs text-stone-400 hover:text-stone-600 transition-colors underline-offset-2 hover:underline"
        >
          End session early
        </button>
      </div>

      {revealed && (
        <AnswerButtons
          onCorrect={() => handleAnswer(true)}
          onWrong={() => handleAnswer(false)}
        />
      )}
    </div>
  );
}
