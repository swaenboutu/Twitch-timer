// src/twitchConnection.test.js

// Import the function to test and its dependency
import { handleTwitchMessage, cleanMessage } from './twitchConnection';
// Import the config for testing different scenarios
import config from './config';
// Mock the imported function from TwitchAuth
import { getSelectedRewardId } from './TwitchAuth';

// Mock the entire TwitchAuth module
jest.mock('./TwitchAuth', () => ({
    getSelectedRewardId: jest.fn(), // Mock the specific function we need
}));

// Mock the config object (provide necessary values)
const mockConfig = {
    twitch: {
        channels: ['#testuser'],
        rewards: {
            customTimer: { 
                // id: 'old-config-reward-id' // No longer directly used by handleTwitchMessage for checking
            }
        }
    },
    timer: {
        minDuration: 60,   // 1 minute
        maxDuration: 3600, // 1 hour
    },
};

// Mock the config for consistent testing if necessary, or use the real one
// jest.mock('./config', () => ({ /* mock config structure */ }));
// For now, we'll use the actual config imported above.

describe('handleTwitchMessage Function', () => {
  let mockOnTimerSet;
  // Use a copy of the config for tests to avoid potential side effects if needed
  const testConfig = JSON.parse(JSON.stringify(config));
   // Define the streamer username based on the (potentially mocked) config
   // Assumes the first channel in the config is the streamer's channel
   const streamerUsername = testConfig.twitch.channels[0]?.substring(1); // Remove '#'

  beforeEach(() => {
    mockOnTimerSet = jest.fn();
    // No need to mock tmi.js client or React rendering anymore
    // No need to manage process.env variables if config is directly used/mocked
    // Reset the mock implementation for getSelectedRewardId
    getSelectedRewardId.mockReset();
  });

  // --- Tests for handleTwitchMessage ---

  test('should call onTimerSet with duration on valid reward message', () => {
    const tags = { 'custom-reward-id': testConfig.twitch.rewards.customTimer.id, username: 'viewer1' };
    const message = 'Start timer for 10 minutes';
    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);
    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    expect(mockOnTimerSet).toHaveBeenCalledWith(600); // 10 * 60
  });

  test('should call onTimerSet with clamped duration for reward message exceeding max', () => {
    const tags = { 'custom-reward-id': testConfig.twitch.rewards.customTimer.id, username: 'viewer1' };
    // Calculate a duration exceeding max (e.g., maxDuration/60 + 1 minutes)
    const minutes = (testConfig.timer.maxDuration / 60) + 1;
    const message = `Start timer for ${minutes} minutes`;
    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);
    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    expect(mockOnTimerSet).toHaveBeenCalledWith(testConfig.timer.maxDuration);
  });

    test('should call onTimerSet with clamped duration for reward message below min', () => {
    const tags = { 'custom-reward-id': testConfig.twitch.rewards.customTimer.id, username: 'viewer1' };
    // Calculate a duration below min (e.g., minDuration/60 / 2 minutes) ensure it results in some value > 0
    const minutes = (testConfig.timer.minDuration / 60) / 2;
    const message = `Start timer for ${minutes} minutes`; // e.g., 0.25 for min 30s
    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);
    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    // Check against parsed and clamped value
    let expectedDuration = Math.ceil(minutes * 60); // Parse might give float, ensure integer seconds
    expectedDuration = Math.max(expectedDuration, testConfig.timer.minDuration); // Apply min clamp
    expect(mockOnTimerSet).toHaveBeenCalledWith(expectedDuration);
  });

  test('should ignore !timer command from non-streamer', () => {
    const tags = { username: 'viewer1' }; // Not the streamer
    const message = '!timer 10';
    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

   test('should ignore messages without valid reward ID or command prefix', () => {
    const tags = { username: 'viewer1' };
    const message = 'Just a normal chat message';
    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

   test('should ignore messages with reward ID but invalid number', () => {
    const tags = { 'custom-reward-id': testConfig.twitch.rewards.customTimer.id, username: 'viewer1' };
    const message = 'Start timer for ten minutes'; // No digits
    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

   test('should ignore !timer command with invalid number', () => {
     if (!streamerUsername) {
        console.warn("Skipping streamer command test: No streamer username found in config.");
        return;
    }
    const tags = { username: streamerUsername };
    const message = '!timer five'; // No digits
    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

   test('should ignore self messages (reward)', () => {
    const tags = { 'custom-reward-id': testConfig.twitch.rewards.customTimer.id, username: 'viewer1' };
    const message = '5';
    handleTwitchMessage(tags, message, true, mockOnTimerSet, testConfig); // self = true
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

   test('should ignore self messages (command)', () => {
     if (!streamerUsername) {
        console.warn("Skipping streamer command test: No streamer username found in config.");
        return;
    }
    const tags = { username: streamerUsername };
    const message = '!timer 5';
    handleTwitchMessage(tags, message, true, mockOnTimerSet, testConfig); // self = true
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

  test('should set timer when selected reward ID matches and message is valid', () => {
    const testRewardId = 'reward-123';
    getSelectedRewardId.mockReturnValue(testRewardId);
    const tags = { 'custom-reward-id': testRewardId };
    const message = 'Set timer for 10 minutes';
    
    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);
    
    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    // 10 minutes * 60 seconds = 600 seconds
    expect(mockOnTimerSet).toHaveBeenCalledWith(600);
    expect(getSelectedRewardId).toHaveBeenCalledTimes(1);
  });

  test('should NOT set timer if message tag reward ID does not match selected ID', () => {
    const selectedId = 'reward-123';
    const messageTagId = 'reward-456';
    getSelectedRewardId.mockReturnValue(selectedId);
    const tags = { 'custom-reward-id': messageTagId };
    const message = '5 minutes timer';

    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);

    expect(mockOnTimerSet).not.toHaveBeenCalled();
    expect(getSelectedRewardId).toHaveBeenCalledTimes(1);
  });

  test('should NOT set timer if no reward ID is selected (localStorage empty)', () => {
    getSelectedRewardId.mockReturnValue(null);
    const tags = { 'custom-reward-id': 'reward-123' };
    const message = '5 minutes timer';

    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);

    expect(mockOnTimerSet).not.toHaveBeenCalled();
    expect(getSelectedRewardId).toHaveBeenCalledTimes(1);
  });
  
  test('should NOT set timer if reward matches but message contains no number', () => {
    const testRewardId = 'reward-123';
    getSelectedRewardId.mockReturnValue(testRewardId);
    const tags = { 'custom-reward-id': testRewardId };
    const message = 'Use this reward!'; // No number

    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);

    expect(mockOnTimerSet).not.toHaveBeenCalled();
    expect(getSelectedRewardId).toHaveBeenCalledTimes(1);
  });

  test('should set timer using !timer command from authorized user', () => {
    getSelectedRewardId.mockReturnValue('some-other-reward'); // Should still work even if a reward is selected
    const tags = { username: 'testuser' }; // Matches mockConfig.twitch.channels
    const message = '!timer 15';

    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);

    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    // 15 minutes * 60 seconds = 900 seconds
    expect(mockOnTimerSet).toHaveBeenCalledWith(900);
    expect(getSelectedRewardId).toHaveBeenCalledTimes(1); // Always checks reward ID first
  });

  test('should cancel timer using !timercancel command from authorized user', () => {
    getSelectedRewardId.mockReturnValue(null); 
    const tags = { username: 'testuser' };
    const message = '!timercancel';

    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);

    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    expect(mockOnTimerSet).toHaveBeenCalledWith(null);
    expect(getSelectedRewardId).toHaveBeenCalledTimes(1);
  });

  test('should NOT set timer using !timer command from unauthorized user', () => {
    getSelectedRewardId.mockReturnValue(null);
    const tags = { username: 'anotheruser' }; // Does NOT match mockConfig.twitch.channels
    const message = '!timer 5';

    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);

    expect(mockOnTimerSet).not.toHaveBeenCalled();
    expect(getSelectedRewardId).toHaveBeenCalledTimes(1);
  });

  test('should apply min duration limit', () => {
    const testRewardId = 'reward-min';
    getSelectedRewardId.mockReturnValue(testRewardId);
    const tags = { 'custom-reward-id': testRewardId };
    const message = '0.5'; // 0.5 * 60 = 30 seconds (below minDuration)

    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);

    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    expect(mockOnTimerSet).toHaveBeenCalledWith(testConfig.timer.minDuration); // Should be clamped to 60
  });

  test('should apply max duration limit', () => {
    const testRewardId = 'reward-max';
    getSelectedRewardId.mockReturnValue(testRewardId);
    const tags = { 'custom-reward-id': testRewardId };
    const message = '70'; // 70 * 60 = 4200 seconds (above maxDuration)

    handleTwitchMessage(tags, message, false, mockOnTimerSet, testConfig);

    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    expect(mockOnTimerSet).toHaveBeenCalledWith(testConfig.timer.maxDuration); // Should be clamped to 3600
  });

});

// --- Optional: Unit tests for cleanMessage if needed ---
describe('cleanMessage Function', () => {
    test('should extract first number from string', () => {
        expect(cleanMessage("timer 10 minutes")).toBe("10");
        expect(cleanMessage("set 5m timer")).toBe("5");
        expect(cleanMessage("15")).toBe("15");
        expect(cleanMessage("Reward redeemed: 30 seconds")).toBe("30");
         expect(cleanMessage("Test 1 2 3")).toBe("1"); // Only first number
    });

    test('should return null if no number found', () => {
        expect(cleanMessage("timer ten minutes")).toBeNull();
        expect(cleanMessage("cancel timer")).toBeNull();
        expect(cleanMessage("")).toBeNull();
        expect(cleanMessage(null)).toBeNull();
        expect(cleanMessage(undefined)).toBeNull();
    });

     test('should handle decimals correctly (extracts integer part before decimal)', () => {
         // The current regex /\d+/g stops at the first non-digit.
        expect(cleanMessage("timer 5.5 minutes")).toBe("5");
        expect(cleanMessage("0.5m")).toBe("0");
    });
}); 