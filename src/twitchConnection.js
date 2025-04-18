import { useMemo, useState, useEffect } from 'react';
// Importer la configuration centralisée
import config from './config';
// Import the function to get the selected reward ID
import { getSelectedRewardId } from './TwitchAuth'; 
// Supprimer l'import des anciennes constantes
// import {channels,  rewardsId } from './consts/variables';
import * as tmi from 'tmi.js';

// var timerDuration = null; // Avoid global variables if possible -> REMOVED as unused

// --- Helper: Process Reward Message ---
function processRewardMessage(tags, message, currentConfig) {
    const selectedRewardId = getSelectedRewardId();
    let durationSeconds = null;
    let timerUpdateNeeded = false;

    if (selectedRewardId && tags["custom-reward-id"] === selectedRewardId) {
        const cleanedMessage = cleanMessage(message);
        if (cleanedMessage != null) {
            durationSeconds = parseInt(cleanedMessage, 10) * 60;
            timerUpdateNeeded = true;
        } else {
            console.warn("[handleTwitchMessage] Reward redeemed, but message did not contain a parseable number.");
        }
    }

    return timerUpdateNeeded ? { durationSeconds, timerUpdateNeeded } : null;
}

// --- Helper: Process Command Message ---
function processCommandMessage(tags, message, currentConfig) {
    let durationSeconds = null;
    let timerUpdateNeeded = false;

    const commandPrefix = "!timer";
    const cancelCommand = "!timercancel";
    const lowerCaseMessage = message.toLowerCase();

    // Check if the message starts with the command prefix and the user is authorized (channel owner)
    if (lowerCaseMessage.startsWith(commandPrefix) && 
        tags["username"] && 
        currentConfig.twitch.channels.some(channel => channel.toLowerCase() === "#" + tags["username"].toLowerCase())) 
    {
        if (lowerCaseMessage === cancelCommand) {
            durationSeconds = null; // Explicitly set to null for cancellation
            timerUpdateNeeded = true;
        } else {
            // Extract potential duration from the command (e.g., "!timer 15")
            const cleanedMessage = cleanMessage(message); // cleanMessage handles extracting the number part
            if (cleanedMessage != null) {
                durationSeconds = parseInt(cleanedMessage, 10) * 60;
                timerUpdateNeeded = true;
            }
            // If command is just "!timer" without a number, ignore it (timerUpdateNeeded remains false)
        }
    }

    return timerUpdateNeeded ? { durationSeconds, timerUpdateNeeded } : null;
}

// --- Main Message Handler (Refactored) ---
function handleTwitchMessage(tags, message, self, onTimerSet, currentConfig) {
    if (self) return;

    let result = null;

    // Try processing as a reward first
    result = processRewardMessage(tags, message, currentConfig);

    // If not processed as a reward, try processing as a command
    if (!result) {
        result = processCommandMessage(tags, message, currentConfig);
    }

    // If either process resulted in a timer update
    if (result && result.timerUpdateNeeded) {
        let finalDuration = result.durationSeconds;
        if (finalDuration !== null) {
            // Apply min/max limits from config
            const min = currentConfig.timer.minDuration;
            const max = currentConfig.timer.maxDuration;
            finalDuration = Math.min(Math.max(finalDuration, min), max);
        }
        onTimerSet(finalDuration); // Call the callback with the final duration
    }
}

// Existing cleanMessage function (remains the same)
function cleanMessage(s) {
    if(s != null){
        var numberPattern = /\d+/g;
        let numbers = s.match(numberPattern);
        if(numbers != null)
        {
            // Retourne la première séquence de chiffres trouvée
            return numbers[0];
        }
        return null;
    }
    return null;
}

// Updated React Component
function ReadTwitchMessages({ onTimerSet }) {
    // const [isConnected, setIsConnected] = useState(false); // State remains for potential UI feedback -> REMOVED as unused
    const client = useMemo(() => new tmi.Client({
        // Utiliser les canaux depuis la configuration
        channels: config.twitch.channels,
        // Utiliser les options de connexion depuis la configuration
        connection: config.twitch.connection
    }), []); // Empty dependency array ensures client is created only once

    // Effect for connection, message handling, and cleanup
    useEffect(() => {
        let isMounted = true; // Flag to prevent operations after unmount

        // --- Removed log for attempting connection ---
        // console.log("Attempting to connect Twitch client...");
        client.connect()
            .then(() => {
                // if (isMounted) setIsConnected(true); // REMOVED as unused
                if (isMounted) { // Keep the check for isMounted
                    // --- Removed log for successful connection ---
                    // console.log("Twitch client connected successfully.");
                }
            })
            .catch(error => {
                // Keep console.error for actual errors
                console.error("Failed to connect Twitch client:", error);
                // Optionally set an error state here if needed for UI feedback
            });

        // Define the message handler using the extracted logic
        const messageHandler = (channel, tags, message, self) => {
            // Pass the current config from the outer scope
            handleTwitchMessage(tags, message, self, onTimerSet, config);
        };

        // Register the message handler
        client.on('message', messageHandler);
        // --- Removed log for listener attached ---
        // console.log("Twitch message listener attached.");

        // Cleanup function: runs on component unmount or before effect re-runs
        return () => {
            isMounted = false; // Mark as unmounted
            // --- Removed log for cleaning up ---
            // console.log("Cleaning up Twitch client connection...");
            // Remove the specific listener to prevent memory leaks
            client.removeListener('message', messageHandler);
            // --- Removed log for listener removed ---
            // console.log("Twitch message listener removed.");

            // Disconnect if the client is currently open
            if (client.readyState() === "OPEN") {
                // --- Removed log for disconnecting ---
                // console.log("Disconnecting Twitch client...");
                client.disconnect()
                    // --- Removed log for successful disconnect ---
                    // .then(() => console.log("Twitch client disconnected successfully."))
                    .catch(error => console.error("Error disconnecting Twitch client:", error)); // Keep error log
            } else {
                // --- Removed log for not disconnecting ---
                // console.log(`Twitch client not disconnected (state: ${client.readyState()}).`);
            }
        };
    }, [client, onTimerSet]); // Dependencies: Re-run effect if client instance or onTimerSet changes

    // This component is non-visual, so it returns null
    return null;
}

export { ReadTwitchMessages, handleTwitchMessage, cleanMessage }; // Keep this one