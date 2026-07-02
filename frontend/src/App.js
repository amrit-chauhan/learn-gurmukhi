import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { SettingsProvider } from './context/SettingsContext';
import { useAppTimeTracker } from './hooks/useAppTimeTracker';
import Home from './pages/Home';
import LetterSelect from './pages/LetterSelect';
import Study from './pages/Study';
import Stats from './pages/Stats';
import './App.css';

/**
 * Thin component whose only purpose is to call the app-time tracker hook.
 * Rendered outside <Routes> so it is always mounted regardless of the current page.
 */
function AppTimeTracker() {
  useAppTimeTracker();
  return null;
}

function App() {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <BrowserRouter>
          <AppTimeTracker />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/select" element={<LetterSelect />} />
            <Route path="/study" element={<Study />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </SettingsProvider>
  );
}

export default App;
