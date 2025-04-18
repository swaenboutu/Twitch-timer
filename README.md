# Twitch Timer

## Description

Ce projet fournit un minuteur configurable destiné à être utilisé comme source navigateur dans des logiciels de streaming (OBS, StreamElements, etc.). Il est initialement conçu pour la chaîne Twitch [http://twitch.tv/swaenlive](http://twitch.tv/swaenlive).

L'objectif principal est de permettre aux viewers ou au streamer de déclencher un minuteur visible à l'écran via des récompenses de points de chaîne ou des commandes chat.

Ce projet est open source. Si vous l'utilisez, n'hésitez pas à le signaler !

## Fonctionnalités Clés

*   Minuteur personnalisable affiché via une source navigateur.
*   Déclenchement via récompense de points de chaîne Twitch.
*   Contrôle via commandes chat (`!timer XX`, `!timerCancel`).
*   Configuration via un fichier JavaScript.
*   Rafraîchissement automatique lors de l'activation de la scène (si configuré dans le logiciel de streaming).

## Prérequis

*   Node.js (version recommandée : 16 ou supérieure)
*   npm ou yarn

## Installation

1.  Clonez le dépôt :
    ```bash
    git clone <url-du-repo>
    ```
2.  Naviguez dans le dossier du projet :
    ```bash
    cd Twitch-timer
    ```
3.  Installez les dépendances :
    ```bash
    npm install
    # ou
    # yarn install
    ```

## Configuration

Avant de lancer ou de builder l'application, vous devez configurer les éléments suivants dans le fichier `src/variables.js` (ce fichier devra peut-être être créé s'il n'existe pas ou adapté s'il a un autre nom) :

*   `channels`: Un tableau contenant les noms des chaînes Twitch sur lesquelles le minuteur doit écouter les commandes et récompenses.
    *   Exemple : `const channels = ['swaenlive'];`
*   `rewardsId`: L'identifiant unique (UUID) de la récompense de points de chaîne personnalisée qui déclenche le minuteur.
    *   Pour obtenir cet ID, vous pouvez utiliser l'API Twitch : [Get Custom Reward](https://dev.twitch.tv/docs/api/reference/#get-custom-reward)
    *   Exemple : `const rewardsId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';`
*   **(Optionnel)** Autres variables de configuration spécifiques à votre application (à documenter ici si elles existent).

## Utilisation

### Côté Streamer

1.  **Intégration dans le logiciel de streaming (OBS, StreamElements, etc.) :**
    *   Lancez l'application en mode développement (`npm start`) ou utilisez une version buildée (`npm run build`).
    *   Ajoutez une source "Source Navigateur" (`Browser Source`).
    *   Entrez l'URL locale (`http://localhost:3000` par défaut si `npm start`) ou le chemin vers le fichier `index.html` du dossier `build/`.
    *   **Important :** Cochez l'option "Rafraîchir le navigateur quand la scène devient active" (`Refresh browser when scene becomes active`).
2.  **Contrôle via Chat :**
    *   Pour démarrer/modifier le minuteur : `!timer XX` (où XX est le nombre de minutes).
    *   Pour arrêter/cacher le minuteur : `!timerCancel`.
    *   Note : Masquer puis réafficher la source navigateur réinitialise également le minuteur grâce à l'option de rafraîchissement.

### Côté Viewer

*   Utilisez la récompense de points de chaîne configurée (voir `rewardsId` dans la configuration) en ajoutant le nombre de minutes souhaité comme message/prompt.

## Scripts Disponibles

Dans le dossier du projet, vous pouvez exécuter :

### `npm start` ou `yarn start`

Lance l'application en mode développement. Ouvrez [http://localhost:3000](http://localhost:3000) pour la voir dans le navigateur. La page se recharge automatiquement lors des modifications.

### `npm run build` ou `yarn build`

Crée une version optimisée de l'application pour la production dans le dossier `build/`. Ces fichiers statiques peuvent être servis par un serveur web ou utilisés directement comme chemin de fichier dans la source navigateur de votre logiciel de streaming.

### `npm test` ou `yarn test`

Lance la suite de tests avec Jest en mode interactif. (Des tests seront ajoutés prochainement dans le cadre de ce plan).

## Contribuer

(Section à ajouter si besoin, avec des directives sur le style de code, les PRs, etc.)

## Licence

Ce projet est sous licence [MIT](LICENSE).