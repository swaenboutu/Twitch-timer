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
const REWARD_NAME_TO_FIND = process.env.REACT_APP_TWITCH_REWARD_NAME; // Read the target name

// --- Add console logs to check environment variables ---
console.log("TWITCH_CLIENT_ID:", TWITCH_CLIENT_ID);
console.log("BROADCASTER_ID:", BROADCASTER_ID);
// console.log("REWARD_ID_TO_FETCH:", REWARD_ID_TO_FETCH); // No longer used
console.log("REWARD_NAME_TO_FIND:", REWARD_NAME_TO_FIND); // Log the name

// Construct the Twitch authorization URL
const TWITCH_AUTH_URL = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(TWITCH_SCOPES)}`;

// --- Components ---

/**
 * Renders a button that redirects the user to Twitch for authorization.
 */
export function TwitchLoginButton() {
    const handleLogin = () => {
        // --- Add console log to check the final URL ---
        console.log("Redirecting to Twitch Auth URL:", TWITCH_AUTH_URL);
        window.location.href = TWITCH_AUTH_URL;
    };

    return <button onClick={handleLogin}>Connect with Twitch</button>;
}

/**
 * Handles the redirect back from Twitch, extracts token, fetches rewards, and finds the target one by name.
 */
export function TwitchCallback() {
    const [error, setError] = useState(null);
    const [foundReward, setFoundReward] = useState(null); // State to store the found reward
    const [isLoading, setIsLoading] = useState(true); 
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true; 
        setIsLoading(true); 
        setError(null); 
        // setApiResponse(null); // Renamed state to foundReward
        setFoundReward(null);

        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        const errorParam = params.get('error');
        const errorDesc = params.get('error_description');

        if (token) {
            console.log("Twitch Access Token received.");
            localStorage.setItem('twitchAccessToken', token);

            if (!REWARD_NAME_TO_FIND) {
                if (isMounted) {
                    setError("REACT_APP_TWITCH_REWARD_NAME is not set in .env file.");
                    setIsLoading(false);
                }
                return; // Stop execution if name is not configured
            }

            // --- Call API to fetch ALL rewards --- 
            fetchAllCustomRewards(token, BROADCASTER_ID, TWITCH_CLIENT_ID)
                .then(allRewardsData => {
                    if (isMounted) {
                        console.log("Twitch API Response (All Rewards):", allRewardsData);
                        // --- Find the reward by name ---
                        const reward = allRewardsData.data?.find(r => r.title === REWARD_NAME_TO_FIND);
                        
                        if (reward) {
                            console.log("Found reward by name:", reward);
                            setFoundReward(reward); // Store the found reward object
                        } else {
                            console.warn(`Reward with name "${REWARD_NAME_TO_FIND}" not found.`);
                            setError(`Reward with name "${REWARD_NAME_TO_FIND}" not found. Check the name in .env and on Twitch.`);
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

    // --- Render component --- 
    if (isLoading) {
        return <div>Processing Twitch login and searching for reward "{REWARD_NAME_TO_FIND}"...</div>;
    }

    // Error takes precedence over found reward display
    if (error) {
        return <div>Error: {error} <button onClick={() => navigate('/')}>Go Home</button></div>;
    }

    // Display found reward details
    if (foundReward) {
        return (
             <div>
                 <h3>Successfully authenticated and found reward: {foundReward.title}</h3>
                 <div>
                     <h4>Reward Details:</h4>
                     <pre>{JSON.stringify(foundReward, null, 2)}</pre>
                 </div>
                 <button onClick={() => navigate('/')}>Go to App</button>
             </div>
        );
    }
    
    // If not loading, no error, but reward not found (this case is handled by setting error now, but as a fallback)
    return <div>Reward "{REWARD_NAME_TO_FIND}" could not be found. <button onClick={() => navigate('/')}>Go Home</button></div>;
}

/**
 * Retrieves the stored Twitch access token from localStorage.
 * NOTE: localStorage is simple but not the most secure for tokens.
 */
export function getStoredTwitchToken() {
    return localStorage.getItem('twitchAccessToken');
}

/**
 * Removes the Twitch access token from localStorage (basic logout).
 */
export function clearStoredTwitchToken() {
    localStorage.removeItem('twitchAccessToken');
    // You might want to redirect the user or update application state here
    console.log("Twitch token cleared.");
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