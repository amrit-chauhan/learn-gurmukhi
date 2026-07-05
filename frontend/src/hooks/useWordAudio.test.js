import { renderHook, act } from '@testing-library/react';
import { useWordAudio } from './useWordAudio';

// The hook keeps a module-level blob-URL cache and in-flight map that persist
// across tests. Rather than resetModules (which would give the hook a different
// React instance than testing-library and break the hooks dispatcher), each
// test uses its own unique word ids so cached entries never cross-contaminate.

let playSpy;

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  playSpy = jest.fn(() => Promise.resolve());

  global.fetch = jest.fn(async () => ({
    ok: true,
    blob: async () => new Blob(),
  }));
  global.URL.createObjectURL = jest.fn(() => 'blob:fake');
  global.Audio = jest.fn(() => ({ play: playSpy }));

  // Run idle callbacks synchronously so preload() executes inside act().
  window.requestIdleCallback = (cb) => cb({ didTimeout: false, timeRemaining: () => 50 });
});

afterEach(() => {
  jest.clearAllMocks();
  delete window.requestIdleCallback;
});

describe('useWordAudio', () => {
  test('play() fetches /api/words/tts/{id} then plays', async () => {
    const { result } = renderHook(() => useWordAudio());

    await act(async () => {
      await result.current.play('w_play');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/words/tts/w_play')
    );
    expect(global.Audio).toHaveBeenCalledWith('blob:fake');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  test('second play() of the same id does not fetch again (module cache)', async () => {
    const { result } = renderHook(() => useWordAudio());

    await act(async () => {
      await result.current.play('w_cache');
    });
    await act(async () => {
      await result.current.play('w_cache');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(playSpy).toHaveBeenCalledTimes(2);
  });

  test('non-ok response plays nothing and does not throw', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, blob: async () => new Blob() }));

    const { result } = renderHook(() => useWordAudio());

    await act(async () => {
      await expect(result.current.play('w_nonok')).resolves.toBeUndefined();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(playSpy).not.toHaveBeenCalled();
  });

  test('preload() fetches only the given ids, deduped (not the whole library)', async () => {
    const { result } = renderHook(() => useWordAudio());

    await act(async () => {
      result.current.preload(['pa', 'pb', 'pa', 'pc']);
      await flush();
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    const fetched = global.fetch.mock.calls.map((c) => c[0]);
    expect(fetched.some((u) => u.includes('/api/words/tts/pa'))).toBe(true);
    expect(fetched.some((u) => u.includes('/api/words/tts/pb'))).toBe(true);
    expect(fetched.some((u) => u.includes('/api/words/tts/pc'))).toBe(true);
  });

  test('preload() skips already-cached ids; play() of a preloaded id does not re-fetch', async () => {
    const { result } = renderHook(() => useWordAudio());

    await act(async () => {
      result.current.preload(['px', 'py']);
      await flush();
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);

    global.fetch.mockClear();

    // Preloading again + playing a warmed id triggers no new fetches.
    await act(async () => {
      result.current.preload(['px', 'py']);
      await flush();
      await result.current.play('px');
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  test('preload() ignores non-array input', async () => {
    const { result } = renderHook(() => useWordAudio());

    await act(async () => {
      result.current.preload(undefined);
      result.current.preload(null);
      await flush();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('concurrent play() + preload() of the same id fetch only once (in-flight dedupe)', async () => {
    const { result } = renderHook(() => useWordAudio());

    await act(async () => {
      const p1 = result.current.play('wdup');
      result.current.preload(['wdup']);
      await p1;
      await flush();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
