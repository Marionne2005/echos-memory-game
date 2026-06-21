# Échos

Jeu de mémoire (memory matching) développé en React, dans le cadre du Devoir 3 — SEG3525 (Conception Centrée sur l'Usager), Université d'Ottawa.

## Le jeu

Le joueur retourne des cartes deux par deux pour retrouver des paires identiques. Le jeu propose :

- **2 niveaux** : Débutant (6 paires) et Avancé (10 paires)
- **3 thèmes configurables** : Animaux, Nature, Espace
- Suivi du nombre de coups et du temps écoulé
- Feedback visuel distinct pour les paires trouvées et les erreurs

## Conception

Le design final combine les besoins de deux personas définis lors de la phase de scénarimage :

- **Léa** (8 ans, ludique, recherche la compétition) → a inspiré la configuration par thème et le feedback de victoire
- **M. Adisa Koffi** (67 ans, pratique sans pression de temps) → a inspiré la palette sobre, la typographie lisible, et l'absence de minuteur visible/stressant

Principes de Gestalt appliqués : similarité (dos de carte uniforme), proximité (espacement de la grille), fermeture (carte qui se complète visuellement une fois retournée), figure-fond (carte active vs. plateau).

## Crédits

Photos d'arrière-plan : Parinaz Mirhosseini, via Unsplash.

## Lancer le projet en local

```bash
npm install
npm run dev
```

## Stack

React + Vite, CSS pur (pas de framework UI).
