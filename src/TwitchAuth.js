import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Assuming you use react-router-dom

// --- Configuration (Replace with your actual values) ---
// Get this from your Twitch Developer Console: https://dev.twitch.tv/console/apps
// const TWITCH_CLIENT_ID = 'YOUR_TWITCH_CLIENT_ID_HERE'; 
const TWITCH_CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
// Must match the Redirect URI configured in your Twitch App settings exactly
const REDIRECT_URI = 'http://localhost:3000/twitch/callback'; // Adjust port if needed
// Scopes determine what permissions your app requests
// 'channel:read:redemptions' is needed for GetCustomReward
const TWITCH_SCOPES = 'channel:read:redemptions'; 
// Read broadcaster and reward ID from environment variables
const BROADCASTER_ID = process.env.REACT_APP_TWITCH_BROADCASTER_ID;
// const REWARD_ID_TO_FETCH = process.env.REACT_APP_TWITCH_REWARD_ID; // No longer fetching by ID
// const REWARD_NAME_TO_FIND = process.env.REACT_APP_TWITCH_REWARD_NAME; // No longer searching by name

// --- Add console logs to check environment variables ---
console.log("TWITCH_CLIENT_ID:", TWITCH_CLIENT_ID);
console.log("BROADCASTER_ID:", BROADCASTER_ID);
// console.log("REWARD_ID_TO_FETCH:", REWARD_ID_TO_FETCH); // No longer used
// console.log("REWARD_NAME_TO_FIND:", REWARD_NAME_TO_FIND);

// Construct the Twitch authorization URL
const TWITCH_AUTH_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(TWITCH_SCOPES)}`;

// --- Constants for localStorage keys ---
const LOCALSTORAGE_KEYS = {
    TWITCH_ACCESS_TOKEN: 'twitchAccessToken',
    SELECTED_REWARD_ID: 'selectedRewardId',
    SELECTED_REWARD_TITLE: 'selectedRewardTitle' // Store title for display
};

// --- Components ---

/**
 * Renders a button that redirects the user to Twitch for authorization.
 */
export function TwitchLoginButton() {
    const handleLogin = () => {
        // --- Add console log to check the final URL ---
        console.log("Redirecting to Twitch Auth URL:", TWITCH_AUTH_URL);
        // Clear previous selection when initiating login
        localStorage.removeItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_ID);
        localStorage.removeItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_TITLE);
        window.location.href = TWITCH_AUTH_URL;
    };

    return <button onClick={handleLogin}>Connect with Twitch & Select Reward</button>;
}

/**
 * Handles redirect, fetches all rewards, and allows user selection.
 */
export function TwitchCallback() {
    const [error, setError] = useState(null);
    const [allRewards, setAllRewards] = useState([]); // State to store the list of rewards
    const [isLoading, setIsLoading] = useState(true); 
    const [selectedId, setSelectedId] = useState(null); // Track selection confirmation
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true; 
        setIsLoading(true); 
        setError(null); 
        setAllRewards([]);
        setSelectedId(null);

        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const errorParam = params.get('error');
        const errorDesc = params.get('error_description');

        if (token) {
            console.log("Twitch Access Token received.");
            localStorage.setItem(LOCALSTORAGE_KEYS.TWITCH_ACCESS_TOKEN, token);

            // --- Call API to fetch ALL rewards --- 
            fetchAllCustomRewards(token, BROADCASTER_ID, TWITCH_CLIENT_ID)
                .then(allRewardsData => {
                    if (isMounted) {
                        console.log("Twitch API Response (All Rewards):", allRewardsData);
                        if (allRewardsData.data && allRewardsData.data.length > 0) {
                             // Filter for enabled rewards only, could be optional
                            const enabledRewards = allRewardsData.data.filter(r => r.is_enabled);
                            console.log("Enabled rewards:", enabledRewards);
                            setAllRewards(enabledRewards);
                        } else {
                            setError("No custom rewards found for this channel or API error.");
                        }
                        setIsLoading(false); 
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        console.error("Error fetching Twitch rewards:", err);
                        setError(err.message || "Failed to fetch reward info."); 
                        setIsLoading(false); 
                    }
                });

        } else if (errorParam) {
            console.error("Twitch OAuth Error:", errorParam, errorDesc);
            setError(`Twitch Auth Error: ${errorDesc || errorParam}`);
            setIsLoading(false); // Auth failed, stop loading
        } else {
            console.warn("Twitch callback accessed without token or error.");
            setError("Invalid Twitch callback state.");
            setIsLoading(false); // Invalid state, stop loading
        }

        return () => {
            isMounted = false;
        };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    // --- Handle Reward Selection ---
    const handleSelectReward = (reward) => {
        if (!reward) return;
        console.log("Reward selected:", reward);
        localStorage.setItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_ID, reward.id);
        localStorage.setItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_TITLE, reward.title);
        setSelectedId(reward.id); // Set state to confirm selection
        // Navigate back to home page after a short delay
        setTimeout(() => navigate('/'), 1000); 
    };

    // --- Render component --- 
    if (isLoading) {
        return <div>Processing Twitch login and fetching rewards list...</div>;
    }

    // Error takes precedence over found reward display
    if (error) {
        return <div>Error: {error} <button onClick={() => navigate('/')}>Go Home</button></div>;
    }

    if (selectedId) {
        const selectedTitle = localStorage.getItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_TITLE);
        return <div>Reward "{selectedTitle || selectedId}" selected! Redirecting...</div>;
    }

    // Display the list of rewards for selection
    if (allRewards.length > 0) {
        return (
             <div>
                 <h3>Select the Reward to use for the Timer:</h3>
                 <ul style={{ listStyle: 'none', padding: 0 }}>
                    {allRewards.map(reward => (
                        <li key={reward.id} style={{ border: '1px solid #ccc', margin: '5px', padding: '10px', display: 'flex', alignItems: 'center' }}>
                           <img src={reward.image?.url_1x || reward.default_image.url_1x} alt={reward.title} style={{ width: '28px', height: '28px', marginRight: '10px' }} />
                           <span style={{ flexGrow: 1 }}>{reward.title} ({reward.cost} points)</span>
                           <button onClick={() => handleSelectReward(reward)}>
                               Select
                           </button>
                        </li>
                    ))}
                 </ul>
             </div>
        );
    }
    
    // If not loading, no error, but reward not found (this case is handled by setting error now, but as a fallback)
    return <div>No enabled custom rewards found to select. <button onClick={() => navigate('/')}>Go Home</button></div>;
}

/**
 * Retrieves the stored Twitch access token from localStorage.
 * NOTE: localStorage is simple but not the most secure for tokens.
 */
export function getStoredTwitchToken() {
    return localStorage.getItem(LOCALSTORAGE_KEYS.TWITCH_ACCESS_TOKEN);
}

/**
 * Removes the Twitch access token from localStorage (basic logout).
 */
export function clearStoredTwitchToken() {
    localStorage.removeItem(LOCALSTORAGE_KEYS.TWITCH_ACCESS_TOKEN);
    localStorage.removeItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_ID); // Clear selection on logout
    localStorage.removeItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_TITLE);
    console.log("Twitch token and selected reward cleared.");
}

// --- API Call Function ---
/**
 * Fetches ALL custom rewards from the Twitch API for a broadcaster.
 * @param {string} accessToken - The OAuth access token.
 * @param {string} broadcasterId - The numeric ID of the broadcaster.
 * @param {string} clientId - The client ID of the application.
 * @returns {Promise<object>} - A promise that resolves with the API response data containing all rewards.
 */
async function fetchAllCustomRewards(accessToken, broadcasterId, clientId) {
    if (!accessToken || !broadcasterId || !clientId) {
        throw new Error("Missing required parameters for fetchAllCustomRewards (token, broadcasterId, clientId).");
    }
    
    // Construct the URL for GetCustomReward WITHOUT the ID parameter to get all rewards
    let apiUrl = `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`;

    // Note: Twitch API might paginate results for channels with many rewards.
    // This basic implementation only fetches the first page.
    // For production, you might need to handle pagination using the 'after' cursor if necessary.

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': clientId,
    };

    console.log(`Fetching ALL Twitch Rewards from API: ${apiUrl}`);

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: response.statusText };
        }
        console.error("Twitch API Error:", response.status, errorData);
        throw new Error(`Twitch API request failed fetching all rewards: ${response.status} ${errorData.message || ''}`);
    }

    const data = await response.json();
    return data; // Returns the object containing the 'data' array of rewards
}

// --- Utility function to get selected reward ID --- 
export function getSelectedRewardId() {
    return localStorage.getItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_ID);
}

export function getSelectedRewardTitle() {
    return localStorage.getItem(LOCALSTORAGE_KEYS.SELECTED_REWARD_TITLE);
} 