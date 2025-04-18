import { useMemo, useState, useEffect } from 'react';
// Importer la configuration centralisée
import config from './config';
// Import the function to get the selected reward ID
import { getSelectedRewardId } from './TwitchAuth'; 
// Supprimer l'import des anciennes constantes
// import {channels,  rewardsId } from './consts/variables';
import * as tmi from 'tmi.js';

var timerDuration = null; // Cette variable globale pourrait être gérée différemment (ex: état React dans App.js)

// Extracted message handling logic
function handleTwitchMessage(tags, message, self, onTimerSet, currentConfig) {
    if (self) return;

    // Get the currently selected reward ID from localStorage
    const selectedRewardId = getSelectedRewardId();
    // console.log("Checking message against selected reward ID:", selectedRewardId); // Optional: Debug log

    let durationSeconds = null;
    let timerUpdateNeeded = false;

    // Reward Check: Use the dynamically selected ID
    // Check if a reward is selected AND if the message tag matches it
    if (selectedRewardId && tags["custom-reward-id"] === selectedRewardId) {
        console.log(`[handleTwitchMessage] Received matching reward redemption: ${selectedRewardId}`);
        const cleanedMessage = cleanMessage(message);
        if (cleanedMessage != null) {
            durationSeconds = parseInt(cleanedMessage, 10) * 60;
            console.log(`[handleTwitchMessage] Parsed duration: ${durationSeconds / 60} minutes`);
            timerUpdateNeeded = true;
        } else {
            // Handle rewards that might not require user input? 
            // Or log that the message format was wrong for the timer reward.
            console.warn("[handleTwitchMessage] Reward redeemed, but message did not contain a parseable number.");
            // Maybe set a default duration? Or ignore? For now, ignore.
        }
    }
    // Command Check (!timer or !timerCancel)
    // Keep this logic if commands should still work independently
    else if (message.toLowerCase().startsWith("!timer") && 
             tags["username"] && 
             currentConfig.twitch.channels.some(channel => channel.toLowerCase() === "#" + tags["username"].toLowerCase())) {
        console.log(`[handleTwitchMessage] Received command: ${message}`);
        if (message.toLowerCase() === "!timercancel") {
            durationSeconds = null; // Explicitly set to null for cancellation
            timerUpdateNeeded = true;
        } else {
            const cleanedMessage = cleanMessage(message);
            if (cleanedMessage != null) {
                durationSeconds = parseInt(cleanedMessage, 10) * 60;
                 console.log(`[handleTwitchMessage] Parsed duration from command: ${durationSeconds / 60} minutes`);
                timerUpdateNeeded = true;
            }
        }
    }

    // If a timer update is triggered, process and call onTimerSet
    if (timerUpdateNeeded) {
        if (durationSeconds !== null) {
            // Apply min/max limits from config
            const min = currentConfig.timer.minDuration;
            const max = currentConfig.timer.maxDuration;
            durationSeconds = Math.min(Math.max(durationSeconds, min), max);
             console.log(`[handleTwitchMessage] Applying limits (${min}-${max}s). Final duration: ${durationSeconds}s`);
        }
        onTimerSet(durationSeconds);
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
    const [isConnected, setIsConnected] = useState(false); // State remains for potential UI feedback
    const client = useMemo(() => new tmi.Client({
        // Utiliser les canaux depuis la configuration
        channels: config.twitch.channels,
        // Utiliser les options de connexion depuis la configuration
        connection: config.twitch.connection
    }), []); // Empty dependency array ensures client is created only once

    // Effect for connection, message handling, and cleanup
    useEffect(() => {
        let isMounted = true; // Flag to prevent operations after unmount

        console.log("Attempting to connect Twitch client...");
        client.connect()
            .then(() => {
                if (isMounted) setIsConnected(true);
                console.log("Twitch client connected successfully.");
            })
            .catch(error => {
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
        console.log("Twitch message listener attached.");

        // Cleanup function: runs on component unmount or before effect re-runs
        return () => {
            isMounted = false; // Mark as unmounted
            console.log("Cleaning up Twitch client connection...");
            // Remove the specific listener to prevent memory leaks
            client.removeListener('message', messageHandler);
            console.log("Twitch message listener removed.");

            // Disconnect if the client is currently open
            if (client.readyState() === "OPEN") {
                console.log("Disconnecting Twitch client...");
                client.disconnect()
                    .then(() => console.log("Twitch client disconnected successfully."))
                    .catch(error => console.error("Error disconnecting Twitch client:", error));
            } else {
                console.log(`Twitch client not disconnected (state: ${client.readyState()}).`);
            }
        };
    }, [client, onTimerSet]); // Dependencies: Re-run effect if client instance or onTimerSet changes

    // This component is non-visual, so it returns null
    return null;
}

export { ReadTwitchMessages, handleTwitchMessage, cleanMessage }; // Export new functions