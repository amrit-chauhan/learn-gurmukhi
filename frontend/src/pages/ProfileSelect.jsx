/**
 * ProfileSelect page
 *
 * Shown on first visit (or after "Switch profile") when no active profile is
 * chosen. Picking a profile persists the choice and returns to Home.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';

export default function ProfileSelect() {
  const navigate = useNavigate();
  const { profiles, loading, selectProfile } = useProfile();

  const handlePick = (id) => {
    selectProfile(id);
    navigate('/', { replace: true });
  };

  return (
    <div
      className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-5 py-12"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Who&apos;s learning?
        </h1>
        <p className="mt-2 text-base text-stone-500 font-medium">
          Pick a profile to track your own progress
        </p>

        {loading ? (
          <p className="mt-10 text-stone-400">Loading profiles…</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <button
                key={p.id}
                data-testid={`profile-option-${p.id}`}
                onClick={() => handlePick(p.id)}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md hover:border-pink-200 active:scale-[0.97] transition-all"
              >
                <span className="text-5xl leading-none" aria-hidden>{p.avatar}</span>
                <span className="text-sm font-bold text-stone-800 truncate w-full">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
