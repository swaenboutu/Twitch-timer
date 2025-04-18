import { useMemo, useState, useEffect } from 'react';
// Importer la configuration centralisée
import config from './config';
// Supprimer l'import des anciennes constantes
// import {channels,  rewardsId } from './consts/variables';

var timerDuration = null; // Cette variable globale pourrait être gérée différemment (ex: état React dans App.js)
const tmi = require('tmi.js');

function ReadTwitchMessages({onTimerSet}) {
    const [isConnected, setIsConnected] = useState(false);
    const client = useMemo(() => new tmi.Client({
        // Utiliser les canaux depuis la configuration
        channels: config.twitch.channels,
        // Utiliser les options de connexion depuis la configuration
        connection: config.twitch.connection
    }), []);

    if(isConnected === false)
    {
        client.connect().catch(console.error);
        setIsConnected(true);
    }

    client.on('message', (channel, tags, message, self) => {
        if (self) return;

        // Utiliser l'ID de récompense depuis la configuration
        if(tags["custom-reward-id"] !== undefined && tags["custom-reward-id"] === config.twitch.rewards.customTimer.id) {
            message = cleanMessage(message);
            if(message != null)
            {
                let durationSeconds = parseInt(message, 10) * 60;
                // Appliquer les limites min/max de la configuration
                durationSeconds = Math.min(Math.max(durationSeconds, config.timer.minDuration), config.timer.maxDuration);
                timerDuration = durationSeconds; // Toujours la variable globale
                onTimerSet(timerDuration);
            }
        }
        // Utiliser les canaux depuis la configuration pour vérifier l'auteur et normaliser en minuscules
        else if(tags["username"] !== undefined && config.twitch.channels.includes("#"+tags["username"].toLowerCase()) && message.toLowerCase().startsWith("!timer")) {
            if(message.toLowerCase() === "!timercancel")
            {
                onTimerSet(null);
            }
            else {
                message = cleanMessage(message);
                if(message != null)
                {
                    let durationSeconds = parseInt(message, 10) * 60;
                     // Appliquer les limites min/max de la configuration
                    durationSeconds = Math.min(Math.max(durationSeconds, config.timer.minDuration), config.timer.maxDuration);
                    timerDuration = durationSeconds; // Toujours la variable globale
                    onTimerSet(timerDuration);
                }
            }
        }
    });
    // Ajouter une dépendance au tableau de dépendances de useMemo si nécessaire
    // Si config peut changer, il faudrait le gérer, mais ici on suppose qu'il est constant après le démarrage.

    // Ajout d'une fonction de nettoyage pour le client TMI
    useEffect(() => {
        // La connexion se fait déjà via le if(isConnected === false)
        // Retourne la fonction de nettoyage
        return () => {
            if (client && client.readyState() === "OPEN") {
                client.disconnect().catch(console.error); // Ajout de catch
            }
        };
    }, [client]); // Dépendance au client

    // Un composant React doit retourner un élément renderable ou null
    return null;
}

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

export {ReadTwitchMessages};