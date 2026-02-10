# Antigravity Scrollytelling Experience

Cette landing page utilise une séquence d'images pour créer une expérience de "scrollytelling" immersive.

## Installation

1. Assurez-vous d'avoir Node.js installé.
2. Installez les dépendances :
   ```bash
   npm install
   ```

## Lancement

Pour lancer le serveur de développement :
```bash
npm run dev
```

Ouvrez ensuite le lien affiché dans votre terminal (généralement `http://localhost:5173`).

## Structure

- `public/frames/` : Contient la séquence d'images (240 frames).
- `src/main.js` : Gère le chargement des images, le canvas et la logique de scroll.
- `src/style.css` : Contient les styles "Glassmorphism" et le thème sombre premium.
