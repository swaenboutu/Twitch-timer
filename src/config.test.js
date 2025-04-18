import config from './config';

describe('Configuration Loading', () => {
  // Garder une copie des variables d'environnement originales
  const originalEnv = process.env;

  beforeEach(() => {
    // Réinitialiser process.env pour isoler les tests
    jest.resetModules(); // Réinitialise le cache des modules pour recharger config.js
    process.env = { ...originalEnv }; // Restaurer les variables d'environnement
  });

  afterAll(() => {
    // Restaurer les variables d'environnement originales après tous les tests
    process.env = originalEnv;
  });

  test('should load default channels if env var is not set', () => {
    delete process.env.REACT_APP_TWITCH_CHANNELS;
    // Recharger config après modification de process.env
    const reloadedConfig = require('./config').default;
    // Note: Default channels are removed from config.js, so it should be empty
    // expect(reloadedConfig.twitch.channels).toEqual(['swaenlive', 'redswaen']);
    expect(reloadedConfig.twitch.channels).toEqual([]); 
  });

  test('should load channels from env var', () => {
    const testChannels = 'channel1,channel2';
    process.env.REACT_APP_TWITCH_CHANNELS = testChannels;
    const reloadedConfig = require('./config').default;
    expect(reloadedConfig.twitch.channels).toEqual(['channel1', 'channel2']);
  });

  // --- Tests obsolètes supprimés ---
  // test('should have an empty reward ID if env var is not set', () => {
  //   delete process.env.REACT_APP_TWITCH_REWARD_ID;
  //   const reloadedConfig = require('./config').default;
  //   expect(reloadedConfig.twitch.rewards.customTimer.id).toBe('');
  // });
  // 
  // test('should load reward ID from env var', () => {
  //   const testRewardId = 'test-reward-123';
  //   process.env.REACT_APP_TWITCH_REWARD_ID = testRewardId;
  //   const reloadedConfig = require('./config').default;
  //   expect(reloadedConfig.twitch.rewards.customTimer.id).toBe(testRewardId);
  // });
  // --- Fin des tests obsolètes ---

  test('should load default timer durations if env vars are not set', () => {
    delete process.env.REACT_APP_TIMER_MIN_DURATION_SECONDS;
    delete process.env.REACT_APP_TIMER_MAX_DURATION_SECONDS;
    const reloadedConfig = require('./config').default;
    expect(reloadedConfig.timer.minDuration).toBe(30); // Default min is now 30
    expect(reloadedConfig.timer.maxDuration).toBe(3600);
  });

  test('should load timer durations from env vars', () => {
    process.env.REACT_APP_TIMER_MIN_DURATION_SECONDS = '60';
    process.env.REACT_APP_TIMER_MAX_DURATION_SECONDS = '1800';
    const reloadedConfig = require('./config').default;
    expect(reloadedConfig.timer.minDuration).toBe(60);
    expect(reloadedConfig.timer.maxDuration).toBe(1800);
  });

  test('should handle invalid timer duration env vars and use defaults', () => {
    process.env.REACT_APP_TIMER_MIN_DURATION_SECONDS = 'abc';
    process.env.REACT_APP_TIMER_MAX_DURATION_SECONDS = '-100';
    const reloadedConfig = require('./config').default;
    expect(reloadedConfig.timer.minDuration).toBe(30); // Default because abc is NaN
    expect(reloadedConfig.timer.maxDuration).toBe(3600); // Default because -100 <= 0
  });

}); 