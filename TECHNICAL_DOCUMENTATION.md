# Documentation Technique - Twitch Timer

## 1. Vue d'ensemble

Ce document détaille l'architecture technique et les composants du projet "Twitch Timer". L'application est une source navigateur conçue pour OBS, StreamElements et autres logiciels de streaming, permettant d'afficher un minuteur personnalisable déclenché par les récompenses de points de chaîne Twitch ou des commandes chat.

## 2. Pile Technologique

- **Frontend:** React.js (via Create React App)
- **Communication Twitch:** tmi.js (pour la connexion au chat et la réception des messages/récompenses)
- **Gestion des dépendances:** npm / yarn
- **Bundler:** Webpack (géré par `react-scripts`)
- **Tests:** Jest (via `react-scripts`, tests à implémenter)
- **Styling:** CSS (potentiellement via des modules CSS ou une autre approche gérée par React)

## 3. Structure du Projet

```
Twitch-timer/
├── public/             # Fichiers statiques (index.html, favicon, etc.)
│   └── index.html      # Point d'entrée HTML
├── src/
│   ├── assets/         # Ressources (sons, images...)
│   ├── components/     # Composants React réutilisables (ex: TimerDisplay - peut-être renommer en Timer)
│   ├── pages/          # Composants de page (TimerPage, ConfigPage)
│   │   ├── TimerPage.js
│   │   └── ConfigPage.js
│   ├── hooks/          # Hooks React personnalisés
│   ├── services/       # Logique de service (ex: twitchService.js)
│   ├── styles/         # Fichiers CSS globaux ou spécifiques
│   ├── App.js          # Composant React principal (routage, layout global)
│   ├── index.js        # Point d'entrée JavaScript/React (avec BrowserRouter)
│   ├── timer.js        # Logique/Composant du minuteur (si séparé de TimerPage)
│   ├── TwitchAuth.js   # Logique d'authentification Twitch
│   ├── twitchConnection.js # Logique de connexion TMI
│   └── config.js       # Fichier de configuration (ex: Client ID)
├── node_modules/       # Dépendances du projet
├── .env                # Variables d'environnement (potentiellement pour les clés API sensibles)
├── .gitignore          # Fichiers et dossiers ignorés par Git
├── package.json        # Métadonnées du projet, dépendances et scripts npm
├── package-lock.json   # Verrouillage des versions des dépendances
├── README.md           # Documentation générale utilisateur
└── TECHNICAL_DOCUMENTATION.md # Ce fichier
```
*(Note: La structure exacte de `src/` peut varier en fonction de l'organisation choisie.)*

## 4. Flux de Fonctionnement

1.  **Initialisation:**
    *   Le navigateur charge `public/index.html`.
    *   React (`src/index.js`) initialise l'application avec `BrowserRouter` et monte le composant `App.js`.
    *   `App.js` définit les routes `/timer`, `/config`, et `/twitch/callback`.
    *   Selon l'URL, le composant `TimerPage` ou `ConfigPage` est rendu.
    *   Le fichier de configuration (`src/config.js`) est lu pour des éléments comme le Client ID.
2.  **Page de Configuration (`/config`):**
    *   Si l'utilisateur n'est pas connecté, un bouton de connexion Twitch est affiché (`TwitchLoginButton`).
    *   Après connexion (via `/twitch/callback` qui redirige vers `/config`), l'interface permet de sélectionner la récompense de points de chaîne.
    *   L'ID de la récompense sélectionnée est sauvegardé (ex: `localStorage`).
3.  **Page du Minuteur (`/timer`):**
    *   Le composant `TimerPage` est rendu.
    *   Un service (`twitchConnection.js`) utilise `tmi.js` pour se connecter aux chats Twitch.
    *   Il écoute les messages (`message` event) et les récompenses (`redeem` event - la méthode dépendra de l'implémentation de `twitchConnection`).
    *   Il utilise l'ID de récompense sauvegardé (depuis `/config`) pour identifier le bon déclencheur de récompense.
4.  **Déclenchement du Minuteur:**
    *   **Commande Chat:** Sur la page `/timer`, si un message correspond à `!timer XX`, la durée est mise à jour dans l'état de `TimerPage`.
    *   **Récompense Points de Chaîne:** Sur la page `/timer`, si une récompense correspond à l'ID sauvegardé, la durée est extraite et mise à jour dans l'état de `TimerPage`.
    *   **Annulation:** La commande `!timerCancel` réinitialise/masque le minuteur sur `/timer`.
5.  **Affichage (`/timer`):**
    *   Le composant `Timer` (dans `TimerPage`) affiche le temps restant.
6.  **Rafraîchissement (OBS):**
    *   Lorsque la source navigateur pointant vers `/timer` est activée dans OBS, la page `/timer` est rechargée, réinitialisant son état.

## 5. Configuration Requise

- Voir la section "Configuration" du `README.md`. Le fichier `src/variables.js` est crucial et doit contenir :
    - `channels`: Tableau des noms de chaînes Twitch.
    - `rewardsId`: ID de la récompense de points de chaîne.
- Potentiellement des variables d'environnement dans `.env` si une authentification Twitch (OAuth) est nécessaire pour certaines fonctionnalités (comme PubSub pour les récompenses).

## 6. Points Techniques Clés

- **Gestion de l'état:** L'état de React (`useState`, `useReducer`) est utilisé pour gérer la durée actuelle du minuteur, son état (actif/inactif), etc.
- **Effets de Bord:** Le hook `useEffect` est utilisé pour :
    - Établir et fermer la connexion `tmi.js`.
    - Gérer l'intervalle du minuteur (`setInterval`, `clearInterval`).
- **Interaction API Twitch:** Se fait principalement via `tmi.js` pour le chat. L'obtention du `rewardsId` nécessite un appel manuel à l'API Twitch (documenté dans le `README.md`). Si les récompenses sont gérées via PubSub, une authentification OAuth sera nécessaire.
- **Déploiement/Utilisation:**
    - `npm start`: Pour le développement local (ex: `http://localhost:3000/timer`, `http://localhost:3000/config`).
    - `npm run build`: Pour créer des fichiers statiques. Nécessite un serveur web capable de gérer le routage côté client pour accéder aux différentes routes (ex: `/timer`, `/config`).

## 7. Tests

- Des tests unitaires et d'intégration devraient être ajoutés en utilisant Jest et React Testing Library pour couvrir :
    - Le parsing des commandes chat.
    - La logique de déclenchement par récompense.
    - Le fonctionnement du composant minuteur.
    - La connexion et la déconnexion du service Twitch.

## 8. Améliorations Possibles

- Implémenter la récupération et la sélection des récompenses dans `ConfigPage`.
- Passer l'ID de récompense sélectionné de `ConfigPage` à `twitchConnection` (via `localStorage` ou Context API).
- Gestion plus fine des permissions pour les commandes chat.
- Interface de configuration graphique au lieu de modifier `variables.js`.
- Support de plusieurs minuteurs simultanés ou en file d'attente.
- Plus d'options de personnalisation visuelle.
- Utilisation de PubSub pour une détection plus fiable des récompenses (nécessite OAuth).
- Ajout de sons ou d'alertes visuelles.
- Tests automatisés complets. 