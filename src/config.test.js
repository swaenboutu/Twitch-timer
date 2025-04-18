describe('Config Module', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    // Réinitialise les mocks et process.env avant chaque test
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV }; // Copie l'environnement original
    delete process.env.REACT_APP_TWITCH_CHANNELS;
    delete process.env.REACT_APP_TWITCH_REWARD_ID;
  });

  afterAll(() => {
    // Restaure l'environnement original après tous les tests
    process.env = ORIGINAL_ENV;
  });

  test('should load default values when environment variables are not set', () => {
    // Importe config APRÈS avoir potentiellement modifié process.env
    const config = require('./config').default;

    expect(config.twitch.channels).toEqual(['swaenlive', 'redswaen']);
    expect(config.twitch.rewards.customTimer.id).toBe('');
    expect(config.timer.defaultDuration).toBe(300);
    expect(config.sounds.volume).toBe(0.5);
  });

  test('should load channels from REACT_APP_TWITCH_CHANNELS environment variable', () => {
    process.env.REACT_APP_TWITCH_CHANNELS = 'channel1,channel2,channel3';
    const config = require('./config').default;

    expect(config.twitch.channels).toEqual(['channel1', 'channel2', 'channel3']);
  });

  test('should load reward ID from REACT_APP_TWITCH_REWARD_ID environment variable', () => {
    const testRewardId = 'test-reward-uuid-12345';
    process.env.REACT_APP_TWITCH_REWARD_ID = testRewardId;
    const config = require('./config').default;

    expect(config.twitch.rewards.customTimer.id).toBe(testRewardId);
  });

  test('should have the correct structure', () => {
    const config = require('./config').default;

    expect(config).toHaveProperty('twitch');
    expect(config.twitch).toHaveProperty('channels');
    expect(config.twitch).toHaveProperty('rewards.customTimer.id');
    expect(config.twitch).toHaveProperty('connection');
    expect(config).toHaveProperty('timer');
    expect(config.timer).toHaveProperty('defaultDuration');
    expect(config.timer).toHaveProperty('maxDuration');
    expect(config.timer).toHaveProperty('minDuration');
    expect(config).toHaveProperty('sounds');
    expect(config.sounds).toHaveProperty('volume');
    expect(config.sounds).toHaveProperty('enabled');
  });

  test('should warn if REACT_APP_TWITCH_REWARD_ID is not set', () => {
    // Espionne console.warn
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Importe le module config (qui exécute la validation)
    require('./config');

    // Vérifie que console.warn a été appelé
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('REACT_APP_TWITCH_REWARD_ID n\'est pas défini')
    );

    // Restaure le spy
    warnSpy.mockRestore();
  });

   test('should not warn if REACT_APP_TWITCH_REWARD_ID is set', () => {
    process.env.REACT_APP_TWITCH_REWARD_ID = 'some-id';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    require('./config');

    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

}); 