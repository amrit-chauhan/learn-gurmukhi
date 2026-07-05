import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from './useAudioPlayer';

// Note: the cache-miss path fetches and plays a fresh blob URL; it never writes
// back into audioPreloader's module cache (getCachedAudio stays a miss), so
// there is no cross-test cache state to reset here.

let playSpy;

beforeEach(() => {
  playSpy = jest.fn(() => Promise.resolve());

  global.fetch = jest.fn(async () => ({
    ok: true,
    blob: async () => new Blob(),
  }));
  global.URL.createObjectURL = jest.fn(() => 'blob:fake');
  global.URL.revokeObjectURL = jest.fn();
  global.Audio = jest.fn(() => ({ play: playSpy }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useAudioPlayer', () => {
  test('cache miss fetches /api/tts/{id}?type=... then plays', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      await result.current.play('kakka', 'human');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tts/kakka?type=human')
    );
    expect(global.Audio).toHaveBeenCalledWith('blob:fake');
    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  test('default voiceType is "auto" in the request URL', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      await result.current.play('kakka');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tts/kakka?type=auto')
    );
  });

  test('non-ok response plays nothing and does not throw', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, blob: async () => new Blob() }));

    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      await expect(result.current.play('kakka', 'ai')).resolves.toBeUndefined();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.Audio).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
  });

  test('network error is swallowed (no throw, no playback)', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('boom');
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      await expect(result.current.play('kakka', 'human')).resolves.toBeUndefined();
    });

    expect(global.Audio).not.toHaveBeenCalled();
    expect(playSpy).not.toHaveBeenCalled();
  });
});
