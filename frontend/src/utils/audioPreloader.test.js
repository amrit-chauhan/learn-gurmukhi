describe('audioPreloader', () => {
  let preloadAllAudio;
  let getCachedAudio;
  let urlCounter;

  beforeEach(() => {
    // Cache is module-level; reset the module so each test starts clean.
    jest.resetModules();

    urlCounter = 0;
    global.URL.createObjectURL = jest.fn(() => `blob:fake-${urlCounter++}`);

    global.fetch = jest.fn(async (url) => ({
      ok: true,
      blob: async () => new Blob(),
    }));

    ({ preloadAllAudio, getCachedAudio } = require('./audioPreloader'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getCachedAudio returns null before any preload', () => {
    expect(getCachedAudio('a', 'ai')).toBeNull();
    expect(getCachedAudio('a', 'human')).toBeNull();
  });

  test('fetches human only when has_human_audio is true, always fetches ai', async () => {
    const alphabet = [
      { id: 'a', has_human_audio: true },
      { id: 'b', has_human_audio: false },
    ];

    await preloadAllAudio(alphabet);

    const urls = global.fetch.mock.calls.map((c) => c[0]);
    expect(urls).toContain('/api/tts/a?type=human');
    expect(urls).toContain('/api/tts/a?type=ai');
    expect(urls).toContain('/api/tts/b?type=ai');
    expect(urls).not.toContain('/api/tts/b?type=human');
    // a -> human + ai, b -> ai only
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('getCachedAudio returns the cached url after preload', async () => {
    const alphabet = [{ id: 'a', has_human_audio: true }];

    await preloadAllAudio(alphabet);

    expect(getCachedAudio('a', 'human')).toMatch(/^blob:fake-/);
    expect(getCachedAudio('a', 'ai')).toMatch(/^blob:fake-/);
    expect(getCachedAudio('missing', 'ai')).toBeNull();
  });

  test('a 404 (ok:false) is silently ignored — no cache entry, no throw', async () => {
    global.fetch = jest.fn(async (url) => {
      if (url.includes('type=human')) {
        return { ok: false, blob: async () => new Blob() };
      }
      return { ok: true, blob: async () => new Blob() };
    });

    const alphabet = [{ id: 'a', has_human_audio: true }];

    await expect(preloadAllAudio(alphabet)).resolves.toBeUndefined();

    expect(getCachedAudio('a', 'human')).toBeNull();
    expect(getCachedAudio('a', 'ai')).toMatch(/^blob:fake-/);
    // createObjectURL only called for the successful (ai) fetch
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  test('a network error is silently ignored', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('network down');
    });

    const alphabet = [{ id: 'a', has_human_audio: true }];

    await expect(preloadAllAudio(alphabet)).resolves.toBeUndefined();
    expect(getCachedAudio('a', 'ai')).toBeNull();
  });

  test('concurrency cap does not drop tasks — all expected fetches happen', async () => {
    // 20 letters, all with human audio => 40 tasks, well above CONCURRENCY (6)
    const alphabet = Array.from({ length: 20 }, (_, i) => ({
      id: `L${i}`,
      has_human_audio: true,
    }));

    await preloadAllAudio(alphabet);

    expect(global.fetch).toHaveBeenCalledTimes(40);
    for (let i = 0; i < 20; i++) {
      expect(getCachedAudio(`L${i}`, 'human')).toMatch(/^blob:fake-/);
      expect(getCachedAudio(`L${i}`, 'ai')).toMatch(/^blob:fake-/);
    }
  });

  test('already-cached entries are not re-fetched', async () => {
    const alphabet = [{ id: 'a', has_human_audio: true }];

    await preloadAllAudio(alphabet);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    global.fetch.mockClear();
    await preloadAllAudio(alphabet);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
