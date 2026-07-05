import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { SettingsProvider } from './context/SettingsContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { useAppTimeTracker } from './hooks/useAppTimeTracker';
import Home from './pages/Home';
import LetterSelect from './pages/LetterSelect';
import Study from './pages/Study';
import WordsHome from './pages/WordsHome';
import WordSelect from './pages/WordSelect';
import ProfileSelect from './pages/ProfileSelect';
import Settings from './pages/Settings';
import HomeSkeleton from './components/home/HomeSkeleton';
import './App.css';

// Split the heaviest / least-used screens out of the initial bundle so the
// first paint ships less JavaScript. Stats alone pulls in ~97 kB (gzip) of the
// `recharts` charting library — used nowhere else — so keeping it out of the
// main bundle is the single biggest win. The `webpackPrefetch` hint tells the
// browser to quietly download each chunk in the background once the main page
// is loaded and idle, so by the time the user navigates the code is already
// cached and the screen opens instantly.
const Stats = lazy(() => import(/* webpackPrefetch: true */ './pages/Stats'));
const Tracing = lazy(() => import(/* webpackPrefetch: true */ './pages/Tracing'));
const WordStudy = lazy(() => import(/* webpackPrefetch: true */ './pages/WordStudy'));

/**
 * Thin component whose only purpose is to call the app-time tracker hook.
 * Only mounted once a profile is active so tracked time is attributed correctly.
 */
function AppTimeTracker() {
  useAppTimeTracker();
  return null;
}

/**
 * Redirects to the profile-selection screen when no profile is active.
 */
function RequireProfile({ children }) {
  const { activeProfile } = useProfile();
  if (!activeProfile) return <Navigate to="/profiles" replace />;
  return children;
}

function AppRoutes() {
  const { activeProfile, loading } = useProfile();

  // Wait for the profile list before deciding where to route. Show the Home
  // skeleton (rather than a blank screen) so the first paint has real shape.
  if (loading) return <HomeSkeleton />;

  return (
    <>
      {activeProfile && <AppTimeTracker />}
      {/* Suspense covers the brief moment a lazy chunk is fetched on first
          navigation (near-instant once prefetched); the skeleton stands in. */}
      <Suspense fallback={<HomeSkeleton />}>
        <Routes>
          <Route path="/profiles" element={<ProfileSelect />} />
          <Route path="/" element={<RequireProfile><Home /></RequireProfile>} />
          <Route path="/select" element={<RequireProfile><LetterSelect /></RequireProfile>} />
          <Route path="/study" element={<RequireProfile><Study /></RequireProfile>} />
          <Route path="/words" element={<RequireProfile><WordsHome /></RequireProfile>} />
          <Route path="/word-select" element={<RequireProfile><WordSelect /></RequireProfile>} />
          <Route path="/word-study" element={<RequireProfile><WordStudy /></RequireProfile>} />
          <Route path="/writing" element={<RequireProfile><Tracing /></RequireProfile>} />
          <Route path="/stats" element={<RequireProfile><Stats /></RequireProfile>} />
          <Route path="/settings" element={<RequireProfile><Settings /></RequireProfile>} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ProfileProvider>
        <ProgressProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ProgressProvider>
      </ProfileProvider>
    </SettingsProvider>
  );
}

export default App;
