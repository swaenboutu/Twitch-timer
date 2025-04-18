import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockTmiClient } from './__mocks__/tmi.js';
import { ReadTwitchMessages } from './twitchConnection';
import config from './config';

// Jest utilisera automatiquement src/__mocks__/tmi.js
jest.mock('tmi.js');

describe('ReadTwitchMessages Component', () => {
  let mockOnTimerSet;
  let renderResult; // Pour stocker le résultat de render et utiliser unmount

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnTimerSet = jest.fn();
    process.env.REACT_APP_TWITCH_CHANNELS = 'teststreamer';
    process.env.REACT_APP_TWITCH_REWARD_ID = 'test-reward-id';
  });

  afterEach(() => {
    // Utilise unmount retourné par render
    if (renderResult) {
        renderResult.unmount();
    }
    delete process.env.REACT_APP_TWITCH_CHANNELS;
    delete process.env.REACT_APP_TWITCH_REWARD_ID;
  });

  test('should connect and register message listener on mount', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    expect(mockTmiClient.connect).toHaveBeenCalledTimes(1);
    // Vérifie que le listener est bien enregistré sur l'instance mockée
    expect(mockTmiClient.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  test('should call onTimerSet with duration on valid reward message', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    const tags = { 'custom-reward-id': 'test-reward-id', username: 'viewer1' };
    const message = 'Start timer for 10 minutes';
    // Utilise la fonction helper du mock pour émettre le message
    mockTmiClient.__emitMessage('#teststreamer', tags, message, false);
    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    expect(mockOnTimerSet).toHaveBeenCalledWith(600); // 10 minutes * 60 seconds
  });

  test('should call onTimerSet with duration on valid !timer command from streamer', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    const tags = { username: 'teststreamer' };
    const message = '!timer 5';
    mockTmiClient.__emitMessage('#teststreamer', tags, message, false);
    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    expect(mockOnTimerSet).toHaveBeenCalledWith(300); // 5 minutes * 60 seconds
  });

  test('should call onTimerSet with null on !timerCancel command from streamer', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    const tags = { username: 'teststreamer' };
    const message = '!timerCancel';
    mockTmiClient.__emitMessage('#teststreamer', tags, message, false);
    expect(mockOnTimerSet).toHaveBeenCalledTimes(1);
    expect(mockOnTimerSet).toHaveBeenCalledWith(null);
  });

  test('should ignore commands from non-streamers', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    const tags = { username: 'viewer1' };
    const message = '!timer 10';
    mockTmiClient.__emitMessage('#teststreamer', tags, message, false);
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

   test('should ignore messages without reward ID or command', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    const tags = { username: 'viewer1' };
    const message = 'Just a normal chat message';
    mockTmiClient.__emitMessage('#teststreamer', tags, message, false);
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

   test('should ignore self messages', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    const tags = { 'custom-reward-id': 'test-reward-id', username: 'botname' };
    const message = '5';
    mockTmiClient.__emitMessage('#teststreamer', tags, message, true); // self = true
    expect(mockOnTimerSet).not.toHaveBeenCalled();
  });

  test('should clamp duration based on config min/max values', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    const tags = { username: 'teststreamer' };

    // Test max duration
    let message = '!timer 90'; // 90 minutes
    mockTmiClient.__emitMessage('#teststreamer', tags, message, false);
    expect(mockOnTimerSet).toHaveBeenCalledWith(config.timer.maxDuration); // 3600

    mockOnTimerSet.mockClear(); // Clear previous calls

    // Test min duration
    message = '!timer 0.5'; // 0.5 minutes
    mockTmiClient.__emitMessage('#teststreamer', tags, message, false);
    expect(mockOnTimerSet).toHaveBeenCalledWith(config.timer.minDuration); // 60

    mockOnTimerSet.mockClear();

    // Test avec récompense (max)
    const rewardTags = { 'custom-reward-id': 'test-reward-id', username: 'viewer1' };
    message = '120 minutes'; // 120 minutes
    mockTmiClient.__emitMessage('#teststreamer', rewardTags, message, false);
    expect(mockOnTimerSet).toHaveBeenCalledWith(config.timer.maxDuration); // 3600
  });

  test('should disconnect client on unmount', () => {
    renderResult = render(<ReadTwitchMessages onTimerSet={mockOnTimerSet} />);
    expect(mockTmiClient.disconnect).not.toHaveBeenCalled();
    // Utilise unmount retourné par render
    renderResult.unmount();
    expect(mockTmiClient.disconnect).toHaveBeenCalledTimes(1);
  });
}); 