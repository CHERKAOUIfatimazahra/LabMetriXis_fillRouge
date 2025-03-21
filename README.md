# LabMetriXis - Système de Gestion de Laboratoire

## À propos du projet

LabMetriXis est un Système de Gestion de Laboratoire (SGL) moderne conçu pour relever les défis auxquels font face les laboratoires contemporains. Cette plateforme web full-stack sécurisée vise à optimiser la gestion des échantillons, des projets et des ressources tout en facilitant une collaboration fluide entre les membres de l'équipe.

### Problématique

Les laboratoires modernes rencontrent plusieurs obstacles qui réduisent leur productivité et la fiabilité de leurs résultats:
- Difficulté à suivre et tracer efficacement les échantillons
- Gestion chronophage et sujette aux erreurs humaines
- Absence de collaboration centralisée entre chercheurs et techniciens

### Solution

LabMetriXis offre une plateforme centralisée permettant:
- Une gestion optimisée des échantillons, projets et ressources
- La traçabilité complète du cycle de vie des échantillons
- Une collaboration fluide entre les différents acteurs du laboratoire
- La génération automatique de rapports et d'analyses statistiques

## Fonctionnalités principales

### Gestion des utilisateurs
- Authentification sécurisée (JWT)
- Gestion des rôles (Chercheurs, Techniciens)
- Profils personnalisés

### Gestion des échantillons
- Saisie et enregistrement avec métadonnées détaillées
- Suivi et traçabilité des statuts (Pending, In Analysis, Analyzed)
- Outils avancés de recherche et filtrage

### Gestion des projets
- Création et suivi des projets de recherche
- Attribution et gestion des ressources
- Suivi des protocoles scientifiques
- Tableaux de bord de progression

### Fonctionnalités additionnelles
- Génération automatique de rapports
- Système de notifications
- Tableaux de bord analytiques

## Rôles utilisateurs

### Chercheur
- Création et gestion des projets
- Suivi des échantillons liés aux projets
- Génération de rapports d'analyse et rapports finaux

### Technicien
- Gestion du statut des échantillons
- Consultation des protocoles d'analyse
- Saisie et suivi des résultats d'analyse

## Technologies utilisées

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios pour les requêtes API
- React Router pour la navigation
- JWT pour l'authentification côté client

### Backend
- Node.js
- Express.js
- MongoDB avec Mongoose
- JWT pour l'authentification
- Bcrypt pour le hachage des mots de passe
- Multer pour la gestion des fichiers

### Infrastructure
- Docker et Docker Compose pour la conteneurisation
- GitHub Actions pour CI/CD
- MongoDB pour la base de données

## Installation et démarrage

### Prérequis
- Docker et Docker Compose
- Node.js (v20 ou plus récent)
- Git

### Installation

1. Clonez le dépôt
```bash
git clone https://github.com/CHERKAOUIfatimazahra/LabMetriXis_fillRouge.git
cd LabMetriXis_fillRouge
```

2. Lancez l'application avec Docker Compose
```bash
docker-compose up -d
```

L'application sera accessible aux adresses suivantes:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- MongoDB: mongodb://localhost:27017

### Développement local

Pour le développement du frontend:
```bash
cd frontend
npm install
npm run dev
```

Pour le développement du backend:
```bash
cd backend
npm install
npm start
```

## Tests

Exécutez les tests du backend:
```bash
cd backend
npm run test
```

## Pipelines CI/CD

Ce projet utilise GitHub Actions pour l'intégration et le déploiement continus. Le pipeline effectue:
- La vérification du code
- L'exécution des tests backend
- La construction et le déploiement des images Docker
