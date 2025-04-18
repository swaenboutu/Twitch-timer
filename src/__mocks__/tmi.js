// src/__mocks__/tmi.js

const mockTmiClient = {
  connect: jest.fn(() => Promise.resolve()), // Assure que connect retourne une promesse
  disconnect: jest.fn(() => Promise.resolve()),
  on: jest.fn(),
  readyState: jest.fn(() => 'OPEN'),
  // Helper pour simuler l'émission d'un message dans les tests
  __emitMessage: function(channel, tags, message, self) {
    const messageCallback = this.on.mock.calls.find(call => call[0] === 'message')?.[1];
    if (messageCallback) {
      messageCallback(channel, tags, message, self);
    }
  }
};

// Simule ce que `require('tmi.js')` retournerait
// C'est un objet avec une propriété Client (qui est une classe ou fonction constructeur)
const tmiMock = {
  Client: jest.fn().mockImplementation(() => mockTmiClient)
};

// Exporte ce mock pour que Jest le trouve
module.exports = tmiMock; 