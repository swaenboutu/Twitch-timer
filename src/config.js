// src/config.js

// Charger les variables d'environnement.
// Assurez-vous que dotenv est configuré ou que les variables sont
// définies par votre processus de build (Create React App le fait).
const config = {
  twitch: {
    // Récupérer les canaux depuis les variables d'environnement,
    // ou utiliser des valeurs par défaut si non définies.
    channels: process.env.REACT_APP_TWITCH_CHANNELS?.split(',').map(c => c.trim()) || [],
    connection: {
      options: { debug: true }, // Or read from env if needed
      identity: { // Optional: for sending messages (not strictly needed for reading)
        // username: process.env.REACT_APP_TWITCH_USERNAME,
        // password: process.env.REACT_APP_TWITCH_PASSWORD, // OAuth token (e.g., "oauth:...")
      },
      reconnect: true,
      secure: true
    },
    rewards: {
      customTimer: {
        // id: process.env.REACT_APP_TWITCH_REWARD_ID || '' // Removed: ID is now selected dynamically
        // We can keep this structure if other reward-specific configs are needed later
      }
    }
  },
  timer: {
    // Durées par défaut et limites pour le timer (en secondes)
    defaultDuration: 300, // 5 minutes
    maxDuration: parseInt(process.env.REACT_APP_TIMER_MAX_DURATION_SECONDS || '3600', 10),    // 1 heure
    minDuration: parseInt(process.env.REACT_APP_TIMER_MIN_DURATION_SECONDS || '30', 10)       // 1 minute
  },
  sounds: {
    // Configuration des sons
    volume: 0.5,
    enabled: true
  }
};

// --- Validations (Optional but Recommended) ---

// Validate essential configurations
if (!config.twitch.channels || config.twitch.channels.length === 0) {
  console.error("Configuration Error: REACT_APP_TWITCH_CHANNELS environment variable is missing or empty.");
  // Potentially throw an error or set a default state
}

// Validate timer durations
if (isNaN(config.timer.minDuration) || config.timer.minDuration < 0) {
  console.warn(`Invalid minDuration (${process.env.REACT_APP_TIMER_MIN_DURATION_SECONDS}), defaulting to 30 seconds.`);
  config.timer.minDuration = 30;
}
if (isNaN(config.timer.maxDuration) || config.timer.maxDuration <= 0) {
  console.warn(`Invalid maxDuration (${process.env.REACT_APP_TIMER_MAX_DURATION_SECONDS}), defaulting to 3600 seconds.`);
  config.timer.maxDuration = 3600;
}
if (config.timer.minDuration > config.timer.maxDuration) {
  console.warn(`minDuration (${config.timer.minDuration}s) is greater than maxDuration (${config.timer.maxDuration}s). Setting minDuration to maxDuration.`);
  config.timer.minDuration = config.timer.maxDuration;
}

// Removed the validation for the specific reward ID as it's no longer statically configured here
// // Validation simple pour s'assurer que l'ID de récompense est défini
// if (!config.twitch.rewards.customTimer.id) {
//   console.warn("Attention : REACT_APP_TWITCH_REWARD_ID n'est pas défini dans votre environnement. La fonctionnalité de récompense personnalisée pourrait ne pas fonctionner.");
// }

export default config; 