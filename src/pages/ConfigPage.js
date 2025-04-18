import React, { useState, useEffect } from 'react';
import { TwitchLoginButton, getStoredTwitchToken } from '../TwitchAuth'; // Importez ce qui est nécessaire
// Importez ici la logique de sélection des récompenses quand elle sera créée

export default function ConfigPage({ isTwitchLoggedIn, handleTwitchLogout }) {
    // TODO: Implémenter la logique de récupération et sélection des récompenses
    const [rewards, setRewards] = useState([]);
    const [selectedRewardId, setSelectedRewardId] = useState(localStorage.getItem('selectedRewardId') || '');

    useEffect(() => {
        // Si l'utilisateur est connecté, récupérer les récompenses personnalisées
        if (isTwitchLoggedIn) {
            // Mettez ici la logique pour appeler l'API Twitch et récupérer les récompenses
            console.log("Fetching custom rewards...");
            // Exemple: fetchRewards().then(setRewards);
        }
    }, [isTwitchLoggedIn]);

    const handleRewardSelection = (event) => {
        const rewardId = event.target.value;
        setSelectedRewardId(rewardId);
        localStorage.setItem('selectedRewardId', rewardId);
        // Vous devrez peut-être stocker cet ID ailleurs (contexte, état global) pour que twitchConnection puisse l'utiliser
        console.log("Selected reward ID:", rewardId);
    };

    return (
        <div>
            <h2>Configuration</h2>
            {!isTwitchLoggedIn ? (
                <TwitchLoginButton />
            ) : (
                <div>
                    <p>Connecté à Twitch!</p>
                    <button onClick={handleTwitchLogout} style={{ marginBottom: '20px' }}>Logout</button>

                    <h3>Sélectionner la récompense</h3>
                    {/* Remplacez ceci par la vraie logique de sélection */}
                    {rewards.length > 0 ? (
                        <select value={selectedRewardId} onChange={handleRewardSelection}>
                            <option value="">-- Choisir une récompense --</option>
                            {/* Mapper les récompenses récupérées ici */}
                            {/* <option value="reward_id_1">Nom Récompense 1</option> */}
                        </select>
                    ) : (
                        <p>Chargement des récompenses ou aucune récompense personnalisée trouvée...</p>
                    )}
                    {/* Afficher l'ID sélectionné pour confirmation/debug */}
                    {selectedRewardId && <p>ID Sélectionné : {selectedRewardId}</p>}
                </div>
            )}
        </div>
    );
}

// Fonction placeholder pour la récupération des récompenses (à implémenter)
// async function fetchRewards() {
//     // Utiliser l'API Twitch pour récupérer les récompenses
//     return [];
// } 