/**
 * Settings page (/settings)
 *
 * Profile management: edit the active profile's name and avatar, reset this
 * profile's progress/stats, or switch to a different profile.
 * (Study-behaviour settings remain in the SettingsModal opened from Home.)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, RotateCcw, Users } from 'lucide-react';
import { useProfile, AVATAR_OPTIONS } from '../context/ProfileContext';
import { useProgress } from '../context/ProgressContext';

export default function Settings() {
  const navigate = useNavigate();
  const { activeProfile, updateProfile, resetProfile, clearActiveProfile } = useProfile();
  const { resetProgress } = useProgress();

  const [name, setName] = useState(activeProfile?.name || '');
  const [avatar, setAvatar] = useState(activeProfile?.avatar || AVATAR_OPTIONS[0]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!activeProfile) {
    navigate('/profiles', { replace: true });
    return null;
  }

  const dirty = name !== activeProfile.name || avatar !== activeProfile.avatar;

  const handleSave = async () => {
    if (!dirty || !name.trim()) return;
    setSaving(true);
    try {
      await updateProfile(activeProfile.id, { name: name.trim(), avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset all progress and stats for ${activeProfile.name}? This cannot be undone.`)) return;
    await resetProfile(activeProfile.id);
    // Reflect the wipe in the in-memory progress state too.
    await resetProgress();
  };

  const handleSwitch = () => {
    clearActiveProfile();
    navigate('/profiles', { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 max-w-md mx-auto w-full">
        <button
          data-testid="settings-back-btn"
          onClick={() => navigate('/')}
          className="p-2.5 rounded-full hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-500" />
        </button>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Profile Settings</h1>
      </div>

      <div className="flex-1 px-5 pb-10 flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* Current profile preview */}
        <div className="flex flex-col items-center gap-2 pt-4">
          <span className="text-6xl leading-none" aria-hidden>{avatar}</span>
          <span className="text-sm text-stone-400">Editing this profile</span>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Name
          </label>
          <input
            data-testid="profile-name-input"
            type="text"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Avatar picker */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Avatar
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {AVATAR_OPTIONS.map((a) => (
              <button
                key={a}
                data-testid={`avatar-option-${a}`}
                onClick={() => setAvatar(a)}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center border transition-all ${
                  avatar === a
                    ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-200'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          data-testid="profile-save-btn"
          onClick={handleSave}
          disabled={!dirty || !name.trim() || saving}
          className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {saved ? (<><Check className="w-4 h-4" /> Saved</>) : 'Save changes'}
        </button>

        <div className="h-px bg-stone-200" />

        {/* Switch profile */}
        <button
          data-testid="switch-profile-btn"
          onClick={handleSwitch}
          className="w-full py-3 rounded-2xl bg-white border border-stone-200 text-stone-700 font-semibold hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          Switch profile
        </button>

        {/* Reset this profile */}
        <button
          data-testid="reset-profile-btn"
          onClick={handleReset}
          className="flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors py-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset this profile&apos;s progress &amp; stats
        </button>
      </div>
    </div>
  );
}
