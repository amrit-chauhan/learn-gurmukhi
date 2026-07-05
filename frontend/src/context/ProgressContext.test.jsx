import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { ProgressProvider, useProgress } from './ProgressContext';
import { preloadAllAudio } from '../utils/audioPreloader';

jest.mock('axios');

jest.mock('../utils/audioPreloader', () => ({
  preloadAllAudio: jest.fn(() => Promise.resolve()),
  getCachedAudio: jest.fn(),
}));

jest.mock('./ProfileContext', () => ({
  useProfile: () => ({ activeProfileId: 'p1' }),
}));

const ALPHABET = [
  { id: 'sa', gurmukhi: 'ਸ', romanization: 'sa' },
  { id: 'ha', gurmukhi: 'ਹ', romanization: 'ha' },
];

const PROGRESS = {
  sa: { history: [true, true, true, true, true] },
};

function mockAxiosByUrl() {
  axios.get.mockImplementation((url) => {
    if (url.endsWith('/alphabet')) return Promise.resolve({ data: ALPHABET });
    if (url.endsWith('/progress')) return Promise.resolve({ data: PROGRESS });
    return Promise.reject(new Error(`unexpected url ${url}`));
  });
}

function Consumer() {
  const ctx = useProgress();
  return (
    <div>
      <span data-testid="alphabet-count">{ctx.alphabet.length}</span>
      <span data-testid="progress-keys">{Object.keys(ctx.progress).join(',')}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="mastery-sa">{ctx.getMastery('sa')}</span>
    </div>
  );
}

function renderProvider() {
  return render(
    <ProgressProvider>
      <Consumer />
    </ProgressProvider>
  );
}

describe('ProgressContext', () => {
  let originalRIC;

  beforeEach(() => {
    jest.clearAllMocks();
    // The jest config may reset mock implementations between tests, so restore
    // the resolved-promise behavior the provider relies on.
    preloadAllAudio.mockImplementation(() => Promise.resolve());
    originalRIC = window.requestIdleCallback;
    window.requestIdleCallback = (cb) => {
      cb({ didTimeout: false, timeRemaining: () => 50 });
      return 1;
    };
    mockAxiosByUrl();
  });

  afterEach(() => {
    window.requestIdleCallback = originalRIC;
  });

  test('fetches the alphabet on mount and exposes it', async () => {
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId('alphabet-count')).toHaveTextContent('2')
    );
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/alphabet'));
  });

  test('fetches progress for the active profile and exposes it', async () => {
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId('progress-keys')).toHaveTextContent('sa')
    );
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/progress'));
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    );
  });

  test('preloads audio with the loaded alphabet, deferred via requestIdleCallback', async () => {
    const ricSpy = jest.fn((cb) => {
      cb({ didTimeout: false, timeRemaining: () => 50 });
      return 1;
    });
    window.requestIdleCallback = ricSpy;

    renderProvider();

    await waitFor(() => expect(preloadAllAudio).toHaveBeenCalled());
    expect(preloadAllAudio).toHaveBeenCalledWith(ALPHABET);
    expect(ricSpy).toHaveBeenCalled();
  });

  test('getMastery returns a value for a letter with history', async () => {
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId('progress-keys')).toHaveTextContent('sa')
    );
    // computeMastery returns some defined string for a letter with history
    expect(screen.getByTestId('mastery-sa').textContent.length).toBeGreaterThan(0);
  });

  test('alphabet loads independently of progress (decoupling)', async () => {
    // Progress request hangs forever; alphabet must still resolve.
    axios.get.mockImplementation((url) => {
      if (url.endsWith('/alphabet')) return Promise.resolve({ data: ALPHABET });
      if (url.endsWith('/progress')) return new Promise(() => {});
      return Promise.reject(new Error(`unexpected url ${url}`));
    });

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId('alphabet-count')).toHaveTextContent('2')
    );
    await waitFor(() => expect(preloadAllAudio).toHaveBeenCalledWith(ALPHABET));
  });
});
