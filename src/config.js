// src/config.js

// Charger les variables d'environnement.
// Assurez-vous que dotenv est configuré ou que les variables sont
// définies par votre processus de build (Create React App le fait).
const config = {
  twitch: {
    // Récupérer les canaux depuis les variables d'environnement,
    // ou utiliser des valeurs par défaut si non définies.
    channels: (process.env.REACT_APP_TWITCH_CHANNELS || "swaenlive,redswaen").split(','),
    rewards: {
      customTimer: {
        // Récupérer l'ID de récompense depuis les variables d'environnement.
        // Il est crucial de définir cette variable.
        id: process.env.REACT_APP_TWITCH_REWARD_ID || '',
      }
    },
    connection: {
      // Options de connexion par défaut pour tmi.js
      reconnect: true,
      secure: true
    }
  },
  timer: {
    // Durées par défaut et limites pour le timer (en secondes)
    defaultDuration: 300, // 5 minutes
    maxDuration: 3600,    // 1 heure
    minDuration: 60       // 1 minute
  },
  sounds: {
    // Configuration des sons
    volume: 0.5,
    enabled: true
  }
};

// Validation simple pour s'assurer que l'ID de récompense est défini
if (!config.twitch.rewards.customTimer.id) {
  console.warn("Attention : REACT_APP_TWITCH_REWARD_ID n'est pas défini dans votre environnement. La fonctionnalité de récompense personnalisée pourrait ne pas fonctionner.");
}

export default config; 