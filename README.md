# Twitch Timer

## Description

Ce projet fournit un minuteur configurable destiné à être utilisé comme source navigateur dans des logiciels de streaming (OBS, StreamElements, etc.). Il est initialement conçu pour la chaîne Twitch [http://twitch.tv/swaenlive](http://twitch.tv/swaenlive).

L'objectif principal est de permettre aux viewers ou au streamer de déclencher un minuteur visible à l'écran via des récompenses de points de chaîne ou des commandes chat.

Ce projet est open source. Si vous l'utilisez, n'hésitez pas à le signaler !

## Fonctionnalités Clés

*   Minuteur personnalisable affiché seul via une source navigateur (`/timer`, destiné à OBS).
*   Interface de configuration pour le streamer (`/config`).
*   Authentification du streamer via Twitch pour la configuration (`/config`).
*   Sélection de la récompense de points de chaîne via l'interface après connexion (`/config`).
*   Déclenchement via la récompense de points de chaîne Twitch sélectionnée (visible sur `/timer`).
*   Contrôle via commandes chat (`!timer XX`, `!timerCancel`, affecte `/timer`).
*   Configuration de base via un fichier JavaScript (ex: Client ID).
*   Rafraîchissement automatique lors de l'activation de la scène (si configuré dans le logiciel de streaming pour la source `/timer`).

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

La configuration initiale se fait via le fichier `src/config.js` (ou `src/variables.js`, adaptez si nécessaire) :

*   `channels`: Un tableau contenant le nom de la chaîne Twitch principale sur laquelle le minuteur fonctionnera.
    *   Exemple : `const channels = ['swaenlive'];`
*   **(Optionnel)** `rewardsId`: L'identifiant d'une récompense peut être pré-configuré ici. Cependant, la fonctionnalité principale permet désormais au streamer de se connecter via Twitch et de sélectionner la récompense souhaitée directement depuis l'interface de l'application (accessible via l'URL de la source navigateur).
    *   Pour obtenir un ID de récompense si besoin : [Get Custom Reward](https://dev.twitch.tv/docs/api/reference/#get-custom-reward)
    *   Exemple : `const rewardsId = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';`
*   Autres variables de configuration spécifiques (ex: identifiants client Twitch pour l'authentification) peuvent être nécessaires. Consultez `config.js` ou la documentation technique.

La configuration la plus importante (sélection de la récompense) se fait maintenant **après avoir lancé l'application et s'être connecté via Twitch** dans l'interface de configuration (`/config`).

## Utilisation

### Côté Streamer

1.  **Lancement et Configuration Initiale :**
    *   Lancez l'application en mode développement (`npm start`) ou utilisez une version buildée (`npm run build` servie par un serveur web).
    *   Ouvrez l'URL de configuration (`http://localhost:3000/config` par défaut) dans votre navigateur **personnel** (pas dans OBS).
    *   Connectez-vous avec votre compte Twitch.
    *   Sélectionnez la récompense de points de chaîne que vous souhaitez utiliser pour déclencher le minuteur.
2.  **Intégration dans le logiciel de streaming (OBS, StreamElements, etc.) :**
    *   Ajoutez une source "Source Navigateur" (`Browser Source`).
    *   Entrez l'URL du minuteur (`http://localhost:3000/timer` par défaut si `npm start`). Cette URL n'affiche **que** le minuteur.
    *   Ajustez la taille et la position de la source dans votre scène.
    *   **Important :** Cochez l'option "Rafraîchir le navigateur quand la scène devient active" (`Refresh browser when scene becomes active`). Cela s'appliquera à la source `/timer`.
3.  **Contrôle via Chat :**
    *   Les commandes affecteront le minuteur visible dans OBS via la source `/timer`.
    *   Pour démarrer/modifier le minuteur : `!timerXX` (où XX est le nombre de minutes).
    *   Pour arrêter/cacher le minuteur : `!timerCancel`.
    *   Note : Masquer puis réafficher la source navigateur (`/timer`) réinitialise également le minuteur grâce à l'option de rafraîchissement.

### Côté Viewer

*   Utilisez la récompense de points de chaîne sélectionnée par le streamer en ajoutant le nombre de minutes souhaité comme message/prompt.

## Scripts Disponibles

Dans le dossier du projet, vous pouvez exécuter :

### `npm start` ou `yarn start`

Lance l'application en mode développement.
Ouvrez [`http://localhost:3000/timer`](http://localhost:3000/timer) pour voir le minuteur seul (pour OBS).
Ouvrez [`http://localhost:3000/config`](http://localhost:3000/config) pour configurer l'application (navigateur personnel).
La page se recharge automatiquement lors des modifications.

### `npm run build` ou `yarn build`

Crée une version optimisée de l'application pour la production dans le dossier `build/`.
Pour utiliser un build avec les routes `/timer` et `/config`, vous aurez besoin d'un **serveur statique capable de gérer le routage côté client** (par exemple, en redirigeant toutes les requêtes inconnues vers `index.html`). L'utilisation directe du fichier `build/index.html` comme source navigateur ne fonctionnera que pour la route par défaut et empêchera l'accès à `/config` ou le fonctionnement correct du rafraîchissement de `/timer`.

### `npm test` ou `yarn test`

Lance la suite de tests avec Jest en mode interactif. (Des tests seront ajoutés prochainement dans le cadre de ce plan).

## Documentation

Pour une vue détaillée de l'architecture technique, de la structure du projet et du flux de fonctionnement, veuillez consulter la [Documentation Technique](TECHNICAL_DOCUMENTATION.md).

## Contribuer

(Section à ajouter si besoin, avec des directives sur le style de code, les PRs, etc.)

## Licence

Ce projet est sous licence [MIT](LICENSE).