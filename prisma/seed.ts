import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type SubjectData = {
  title: string;
  volumeHoraire: number;
  periode: string;
  avecMentor: boolean;
  contenu: string;
  sortOrder: number;
};

type CategoryData = {
  slug: string;
  label: string;
  level: string;
  year: number;
  specialization?: string;
  sortOrder: number;
  title: string;
  introduction: string;
  subjects: SubjectData[];
};

const categorySeedData: CategoryData[] = [
  {
    slug: "bachelor-1",
    label: "Bachelor 1",
    level: "bachelor",
    year: 1,
    sortOrder: 1,
    title: "Bachelor 1 - Première année",
    introduction:
      "Bienvenue dans le questionnaire pour les interventions en Bachelor 1. Cette promotion est composée d'étudiants débutant leur parcours en informatique. Les modules couvrent les fondamentaux du développement web, de l'algorithmie, des réseaux et de la programmation.",
    subjects: [
      {
        title: "HTML/CSS",
        volumeHoraire: 8,
        periode: "Octobre",
        avecMentor: true,
        contenu: `• Comprendre l'usage professionnel du HTML/CSS : standards web (W3C), bonnes pratiques, accessibilité (WCAG)
• Structurer une page HTML sémantique avec les balises appropriées (header, nav, main, section, article, footer)
• Les bases du référencement naturel (SEO)
• Mettre en pages avec flexbox et grid
• Utiliser les sélecteurs et pseudo-classes CSS
• Implémenter un design responsive avec les media queries et les unités relatives
• Créer des interfaces mobile first
• Réaliser votre premier site vitrine`,
        sortOrder: 1,
      },
      {
        title: "JavaScript & DOM",
        volumeHoraire: 16,
        periode: "Janvier / février",
        avecMentor: true,
        contenu: `• Maîtriser la syntaxe JavaScript : variables, fonctions, boucles, conditions, types
• Implémenter des algorithmes complexes en JavaScript (tri, recherche, manipulation de structures)
• Manipuler le DOM en JavaScript : sélectionner, créer, modifier et supprimer des éléments HTML dynamiquement
• Appliquer les principes de la POO en JavaScript (classes, héritage, encapsulation)
• Créer une application interactive complexe s'exécutant entièrement dans le navigateur`,
        sortOrder: 2,
      },
      {
        title: "Développement Web & Consommation d'API",
        volumeHoraire: 12,
        periode: "Novembre / décembre",
        avecMentor: true,
        contenu: `• Consommer une API REST externe en Go avec gestion appropriée des erreurs HTTP (404, 500, timeout)
• Parser et structurer des données JSON provenant de multiples endpoints API
• Implémenter des filtres complexes sur les données (géolocalisation, dates, relations entre entités)
• Créer des visualisations web interactives (cartes, graphiques) avec les données API
• Appliquer la séparation frontend/backend dans une application Go
• Utiliser les templates Go pour générer des pages HTML dynamiques à partir de données`,
        sortOrder: 3,
      },
      {
        title: "Algorithmie",
        volumeHoraire: 16,
        periode: "Novembre",
        avecMentor: true,
        contenu: `• Analyser la complexité algorithmique d'une solution en utilisant la notation Big-O
• Concevoir un algorithme de tri optimisé pour résoudre Push-Swap avec un minimum d'opérations
• Comparer différentes stratégies algorithmiques et justifier le choix de l'approche retenue
• Implémenter un algorithme complexe en Go en garantissant sa robustesse (gestion d'erreurs, edge cases)
• Optimiser itérativement : partir du brute-force puis améliorer vers une solution optimale
• Documenter son approche algorithmique et expliquer ses choix d'implémentation`,
        sortOrder: 4,
      },
      {
        title: "Application CLI & Parsing en Go",
        volumeHoraire: 12,
        periode: "Octobre",
        avecMentor: true,
        contenu: `• Concevoir l'architecture d'une application CLI en Go avec séparation des responsabilités (main, utilitaires)
• Implémenter un parser robuste pour traiter des chaînes de caractères selon des règles définies
• Gérer la lecture et l'écriture de fichiers en Go de manière sécurisée
• Gérer les erreurs de manière professionnelle avec des messages clairs et appropriés
• Tester manuellement son application avec des fichiers de test et vérifier les sorties attendues
• Documenter son projet avec un README complet (description, installation, utilisation)`,
        sortOrder: 5,
      },
      {
        title: "Virtualisation & Administration Poste Client",
        volumeHoraire: 20,
        periode: "Janvier",
        avecMentor: false,
        contenu: `• Comprendre les principes de la virtualisation : différencier les types d'hyperviseurs (type 1 / type 2), savoir lequel choisir selon le contexte
• Installer et configurer une machine virtuelle Windows 11 (allocation des ressources, snapshots, gestion du cycle de vie de la VM)
• Configurer le réseau d'une VM selon le besoin (NAT, Bridged, Host-only) et garantir son accès à Internet via la machine hôte
• Installer et configurer un poste de travail professionnel sous Windows
• Gérer les comptes utilisateurs, les permissions et les politiques de sécurité (UAC, groupes locaux, stratégies de mot de passe)
• Diagnostiquer et résoudre les problèmes courants : matériel, logiciel, connectivité réseau
• Appliquer les bonnes pratiques de sécurité du poste client Windows (Windows Update, BitLocker, Windows Defender)`,
        sortOrder: 6,
      },
      {
        title: "Fonctionnement des réseaux",
        volumeHoraire: 40,
        periode: "Décembre",
        avecMentor: false,
        contenu: `• Expliquer les modèles OSI et TCP/IP et le rôle de chaque couche dans la transmission des données
• Maîtriser les protocoles réseau essentiels : IP, TCP, UDP, DHCP, DNS et leur rôle
• Comprendre l'interaction client-serveur et le fonctionnement d'une requête web de bout en bout
• Identifier le rôle des dispositifs réseau : routeurs, commutateurs, points d'accès sans fil
• Comparer les technologies réseau filaires et sans fil : avantages, inconvénients, cas d'usage`,
        sortOrder: 7,
      },
      {
        title: "Linux Fondamentaux",
        volumeHoraire: 40,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Maîtriser les commandes essentielles de navigation, manipulation de fichiers, recherche et gestion des processus en ligne de commande
• Éditer des fichiers de configuration directement en terminal avec nano ou vim
• Comprendre l'arborescence du système de fichiers Linux et son rôle (/etc, /var, /home, /usr...)
• Gérer finement les permissions et la propriété des fichiers (chmod, chown, chgrp, ACL)
• Installer, mettre à jour et désinstaller des paquets avec les gestionnaires des principales distributions (apt, yum/dnf)
• Installer et configurer une distribution Linux complète
• Écrire des scripts Bash pour automatiser des tâches récurrentes (sauvegardes, déploiements, jobs cron)
• Gérer les utilisateurs, groupes et privilèges (useradd, usermod, sudo)
• Sécuriser un système Linux : configuration du pare-feu (iptables, ufw), durcissement des services exposés
• Configurer des services serveur de base : serveur web, partage de fichiers, réseau`,
        sortOrder: 8,
      },
      {
        title: "POO & Python",
        volumeHoraire: 36,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Comprendre et appliquer les 4 piliers de la POO : encapsulation, héritage, polymorphisme, abstraction
• Concevoir et implémenter des classes en Python avec attributs, méthodes et constructeurs
• Utiliser l'héritage pour créer des hiérarchies de classes et le polymorphisme pour des comportements adaptés
• Comprendre le principe d'abstraction et la puissance des interfaces en POO
• Comparer la programmation procédurale (Go) et orientée objet (Python) sur un même problème
• Appliquer la POO dans un projet concret en Python avec des classes modulaires et réutilisables`,
        sortOrder: 9,
      },
      {
        title: "Outils IA",
        volumeHoraire: 12,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Expliquer le fonctionnement d'un Large Language Model et identifier ses limites (hallucinations, biais)
• Formuler des prompts efficaces et structurés pour obtenir des résultats pertinents
• Utiliser GitHub Copilot, Cursor ou Claude pour accélérer le développement sur des projets réels
• Évaluer de manière critique le code généré par l'IA et le corriger si nécessaire
• Identifier les situations où l'IA est un atout et celles où elle ne doit pas être utilisée
• Argumenter sur les enjeux éthiques et de propriété intellectuelle liés à l'utilisation de l'IA`,
        sortOrder: 10,
      },
      {
        title: "Langage Compilé vs Interprété",
        volumeHoraire: 20,
        periode: "Juin",
        avecMentor: false,
        contenu: `• Distinguer les deux modèles d'exécution :compilation et interprétation, en comprenant le cycle de vie complet du code source dans chaque cas, de Go à Python
• Mesurer et interpréter des benchmarks concrets entre Go et Python : temps d'exécution, consommation mémoire et charge CPU sur un même algorithme
• Comprendre le pipeline d'exécution réel de JavaScript dans V8 : tokenisation, construction de l'AST, génération de bytecode par Ignition et compilation JIT par TurboFan
• Choisir un langage de manière argumentée selon le contexte projet : performance, rapidité de développement, portabilité, environnement d'exécution et écosystème`,
        sortOrder: 11,
      },
    ],
  },
  {
    slug: "bachelor-2-informatique",
    label: "Bachelor 2 - Informatique",
    level: "bachelor",
    year: 2,
    specialization: "informatique",
    sortOrder: 2,
    title: "Bachelor 2 - Spécialisation Informatique",
    introduction:
      "Cette promotion approfondit le développement web, les bases de données, la cybersécurité et le DevOps. Les étudiants ont déjà des bases en algorithmique et développement web.",
    subjects: [
      {
        title: "React.js & TypeScript",
        volumeHoraire: 16,
        periode: "Septembre à novembre",
        avecMentor: true,
        contenu: `• Typer du code JavaScript avec TypeScript (types primitifs, interfaces, génériques, union types)
• Configurer un projet TypeScript avec tsconfig.json et comprendre les options de compilation
• Créer des composants React fonctionnels avec JSX et les typer avec TypeScript
• Gérer l'état local et les effets avec les Hooks useState, useEffect, useContext, useReducer
• Créer des formulaires contrôlés avec validation côté client
• Naviguer entre les pages avec React Router v6 (routes, paramètres, navigation programmatique)
• Partager l'état global avec Context API et useReducer
• Composer des composants réutilisables avec des props typées et des children
• Configurer un projet avec Vite (dev server, build optimisé, HMR)
• Styler une application avec Tailwind CSS (utility-first, responsive, dark mode)
• Consommer une API REST avec fetch et gérer les états de chargement/erreur
• Gérer les appels asynchrones dans React (loading states, error boundaries)
• Créer des hooks personnalisés pour réutiliser la logique métier`,
        sortOrder: 1,
      },
      {
        title: "Python Backend & FastAPI",
        volumeHoraire: 20,
        periode: "Septembre à novembre",
        avecMentor: true,
        contenu: `• Révision rapide de la POO Python : classes, héritage, polymorphisme appliqués au backend
• Créer des APIs REST complètes avec FastAPI (routing, modèles Pydantic, validation automatique)
• Implémenter l'authentification JWT pour sécuriser les endpoints d'une API
• Générer automatiquement la documentation OpenAPI/Swagger de ses APIs
• Utiliser async/await pour créer des APIs performantes capables de gérer des requêtes concurrentes
• Gérer proprement les erreurs HTTP avec des codes de statut appropriés et des réponses structurées
• Connecter une API FastAPI à une base de données PostgreSQL
• Écrire des scripts Python pour automatiser des tâches courantes (parsing de logs, manipulation de fichiers, appels API)
• Interagir avec des APIs tierces via la librairie requests (GET, POST, authentification)
• Créer des CLI  avec argparse pour industrialiser ses scripts
• Structurer un projet backend Python avec séparation des responsabilités (routes, services, modèles)
• Débugger efficacement du code Python backend (breakpoints, logging)`,
        sortOrder: 2,
      },
      {
        title: "Travail collaboratif & documentation technique",
        volumeHoraire: 12,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Pratiquer la code review structurée : commentaires constructifs sur les PR (lisibilité, performance, sécurité)
• Utiliser les conventions GitHub (Approved, Request Changes, Comment) et faire converger vers un merge de qualité
• Rédiger un README complet et professionnel (installation, usage, architecture, contribution)
• Rédiger des ADR (Architecture Decision Records) justifiant les choix techniques majeurs d'un projet
• Formaliser la circulation de l'information dans un projet : qui produit, qui review, où stocker (Git, Wiki)
• Rédiger des issues claires (contexte, comportement attendu/observé, steps to reproduce)
• Structurer une PR description avec contexte, changements, et impact
• Communiquer un blocage technique de manière concise et actionnable`,
        sortOrder: 3,
      },
      {
        title: "SQL avancé",
        volumeHoraire: 12,
        periode: "Octobre",
        avecMentor: true,
        contenu: `• Comprendre le rôle du DCL et la notion de privilèges dans une base de données
• Créer et gérer des utilisateurs et des rôles avec GRANT et REVOKE
• Créer des vues et comprendre leur utilité pour l'abstraction et la sécurité
• Comprendre le fonctionnement des index et savoir quand les utiliser pour optimiser une requête
• Écrire des fonctions et des procédures stockées
• Créer des triggers et comprendre leur déclenchement (BEFORE, AFTER, INSERT, UPDATE, DELETE)
• Identifier dans un projet réel quand utiliser ces outils plutôt que de gérer la logique côté applicatif`,
        sortOrder: 4,
      },
      {
        title: "Réseaux",
        volumeHoraire: 36,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Installer et configurer un serveur DHCP sous Linux pour l'attribution automatique d'adresses IP
• Configurer un serveur DNS (bind9) pour la résolution de noms interne et externe
• Déployer un serveur web HTTP/HTTPS (Apache ou Nginx) avec certificats SSL/TLS
• Configurer un serveur FTP sécurisé et un accès SSH avec authentification par clé
• Mettre en place des règles de pare-feu (iptables/nftables) pour filtrer le trafic réseau
• Configurer un VPN basique pour sécuriser les communications entre sites
• Surveiller les services réseaux avec des outils de monitoring (nagios, netstat, ss)
• Diagnostiquer et résoudre des problèmes réseau courants (DNS, routage, connectivité)
• Sécuriser les services réseaux selon les bonnes pratiques (principe du moindre privilège, logs)`,
        sortOrder: 5,
      },
      {
        title: "Windows Server",
        volumeHoraire: 28,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Installer et configurer Windows Server 2022 (rôles, fonctionnalités, paramètres réseau)
• Déployer un domaine Active Directory Domain Services (AD DS)
• Créer et gérer des utilisateurs, groupes et Organizational Units (OU)
• Configurer des Group Policy Objects (GPO) pour appliquer des politiques de sécurité et de configuration
• Intégrer le DNS dans Active Directory pour la résolution de noms du domaine
• Configurer le DHCP pour attribuer automatiquement les adresses IP aux postes clients
• Déployer des services de fichiers (partages réseau) et d'impression
• Gérer l'accès aux ressources avec des permissions NTFS (héritage, refus explicite)
• Administrer Windows Server avec PowerShell (cmdlets, scripts d'automatisation)
• Joindre des postes clients au domaine Active Directory et vérifier l'application des GPO`,
        sortOrder: 6,
      },
      {
        title: "Accessibilité Web & SEO",
        volumeHoraire: 16,
        periode: "Décembre",
        avecMentor: false,
        contenu: `Accessibilité
• Appliquer les principes WCAG 2.1 niveau AA sur un projet web existant
• Structurer une page accessible avec le HTML sémantique dans des composants React
• Implémenter les attributs ARIA sur les composants interactifs (modales, menus, accordéons, tabs)
• Garantir une navigation complète au clavier : focus visible, tab order logique, focus trap
• Respecter les contrastes de couleurs conformes WCAG (ratio 4.5:1 texte, 3:1 grands éléments)
• Comprendre les enjeux légaux et business de l'accessibilité

SEO
• Comprendre le fonctionnement d'un moteur de recherche : crawl, indexation, ranking
• Effectuer une recherche de mots-clés et analyser l'intention de recherche
• Optimiser les éléments on-page : title, meta description, URLs, hiérarchie des titres, maillage interne
• Maîtriser les fondamentaux du SEO technique : robots.txt, sitemap XML, balises canoniques, duplicate content
• Mesurer et améliorer les Core Web Vitals avec Lighthouse et Google Search Console
• Comprendre les spécificités SEO des SPA React (SSR, SSG, meta tags dynamiques)
• Appréhender les bases du SEA et sa complémentarité avec le SEO`,
        sortOrder: 7,
      },
      {
        title: "Data Engineering Python",
        volumeHoraire: 12,
        periode: "Janvier",
        avecMentor: true,
        contenu: `• Manipuler des données avec Pandas (DataFrames, Series, indexing)
• Lire et écrire différents formats (CSV, Excel, JSON, Parquet)
• Nettoyer des données (gérer NaN, supprimer doublons, détecter outliers)
• Transformer des données (group by, aggregations, merge, join, pivot tables)
• Créer des graphiques avec Matplotlib (line, bar, scatter, histogram)
• Créer des visualisations statistiques avec Seaborn (distributions, correlations)
• Construire un dashboard interactif avec Streamlit
• Extraire des données d'une API REST avec requests
• Transformer des données selon des règles métier
• Charger des données dans une base SQL avec SQLAlchemy
• Automatiser un pipeline ETL complet (extraction, transformation, chargement)`,
        sortOrder: 8,
      },
      {
        title: "Sensibilisation à la cybersécurité",
        volumeHoraire: 16,
        periode: "Janvier",
        avecMentor: false,
        contenu: `• Identifier les menaces courantes (phishing, ransomware, malware, DDoS) et leurs vecteurs d'attaque
• Reconnaître les techniques d'ingénierie sociale et s'en protéger
• Créer et gérer des mots de passe robustes (longueur, complexité, gestionnaire de mots de passe)
• Configurer l'authentification multi-facteurs (2FA/MFA) sur ses comptes
• Appliquer le principe du moindre privilège (permissions minimales nécessaires)
• Identifier ce qu'est une donnée personnelle selon le RGPD et les obligations associées
• Respecter les droits des utilisateurs (accès, rectification, suppression, portabilité)
• Implémenter la privacy by design dans la conception d'applications
• Comprendre les obligations légales et les sanctions RGPD
• Sensibiliser ses pairs aux bonnes pratiques de sécurité`,
        sortOrder: 9,
      },
      {
        title: "Conception POO & Design Patterns",
        volumeHoraire: 28,
        periode: "Février",
        avecMentor: false,
        contenu: `• Appliquer les 5 principes SOLID dans la conception de classes et justifier chaque principe sur un exemple concret
• Reconnaître et implémenter les patterns créationnels : Singleton, Factory Method, Abstract Factory, Builder
• Reconnaître et implémenter les patterns structurels : Adapter, Decorator, Facade, Composite
• Reconnaître et implémenter les patterns comportementaux : Observer, Strategy, Command, State
• Concevoir des diagrammes UML de classes pour modéliser l'architecture d'une application
• Refactorer du code existant en appliquant les patterns appropriés (identifier le code smell, choisir le pattern, implémenter)
• Justifier ses choix de conception face à un pair ou un formateur
• Implémenter un mini-projet architecturé combinant au moins 3 design patterns"`,
        sortOrder: 10,
      },
      {
        title: "Tests automatisés",
        volumeHoraire: 16,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Comprendre pourquoi les tests sont indispensables dans un projet professionnel
• Situer les tests dans le cycle de développement logiciel
• Distinguer les niveaux de tests : unitaires, intégration, système (E2E) et tests utilisateurs
• Identifier les approches boîte noire, boîte blanche et boîte grise
• Être exposé à la philosophie TDD et comprendre l'intention derrière "tester d'abord"
• Structurer un test avec le pattern AAA (Arrange, Act, Assert)
• Rédiger une fiche de test pour une fonctionnalité donnée
• Lancer une suite de tests simple et lire son résultat`,
        sortOrder: 11,
      },
      {
        title: "Introduction aux bases du Cloud",
        volumeHoraire: 16,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Expliquer les modèles de service Cloud (IaaS, PaaS, SaaS) et identifier le modèle adapté à un besoin
• Distinguer les types de déploiement (public, privé, hybride) et leurs cas d'usage
• Créer et configurer des ressources Cloud basiques (VM, stockage, réseau) sur une plateforme majeure
• Appliquer les bonnes pratiques de sécurité Cloud (IAM, chiffrement, principe du moindre privilège)
• Comprendre les enjeux de souveraineté des données et les cadres réglementaires applicables
• Estimer le coût d'une infrastructure Cloud simple (calculateur de prix)`,
        sortOrder: 12,
      },
      {
        title: "SPE INFO Introduction DevOps & Culture CI/CD",
        volumeHoraire: 32,
        periode: "Avril",
        avecMentor: false,
        contenu: `• Expliquer les principes DevOps (culture, automatisation, mesure, partage) et leur valeur en entreprise
• Configurer un pipeline CI basique avec GitHub Actions (build, test, lint à chaque push)
• Configurer un pipeline CD qui construit une image Docker et la déploie automatiquement
• Écrire un workflow GitHub Actions complet avec stages : build → test → security scan → deploy
• Appliquer une stratégie de branching (GitFlow ou trunk-based) et gérer les merge requests avec code review
• Automatiser les tests dans le pipeline (pytest, go test, Jest) et bloquer le merge en cas d'échec
• Monitorer basiquement une application déployée (health checks, logs centralisés)
• Comprendre les concepts d'Infrastructure as Code (IaC) et leur intérêt pour la reproductibilité
• Documenter un pipeline CI/CD (README, diagramme de flux, runbook de déploiement)
• Mettre en place un environnement de staging distinct de la production`,
        sortOrder: 13,
      },
      {
        title: "Conteneurisation",
        volumeHoraire: 12,
        periode: "Avril",
        avecMentor: true,
        contenu: `• Écrire des Dockerfiles optimisés avec multi-stage builds (réduire une image de 1Go à <200Mo)
• Comprendre le système de layers Docker et utiliser le cache efficacement
• Créer des images Docker légères (Alpine, slim variants) adaptées au contexte
• Gérer des volumes Docker pour persister les données entre redémarrages
• Configurer des networks Docker pour la communication entre containers
• Utiliser des variables d'environnement pour configurer les containers (12-factor app)
• Écrire des fichiers docker-compose.yml multi-containers (frontend + backend + db)
• Débugger des containers (docker logs, docker exec, docker inspect)
• Pusher et puller des images sur DockerHub (registry publique/privée)
• Containeriser une application fullstack complète (React + FastAPI + PostgreSQL)
• Déployer une stack complète avec docker-compose up en un seul commande`,
        sortOrder: 14,
      },
      {
        title: "SPE INFO Introduction IoT & Automation",
        volumeHoraire: 32,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Programmer un ESP32 en MicroPython pour interagir avec le monde physique
• Connecter des capteurs (PIR, DHT22, photorésistance) et lire leurs données
• Contrôler des actionneurs (servomoteurs, relais, LEDs) via le microcontrôleur
• Utiliser le protocole MQTT pour la communication entre objets connectés
• Créer une interface web simple de contrôle et de monitoring des capteurs
• Comprendre les enjeux IoT en entreprise : latence, consommation, sécurité, architecture edge/cloud
• Débugger un système embarqué (serial monitor, logs, multimètre)`,
        sortOrder: 15,
      },
      {
        title: "SPE INFO Scripting & Automatisation Système",
        volumeHoraire: 28,
        periode: "Juin",
        avecMentor: false,
        contenu: `• Écrire des scripts Bash robustes avec gestion d'erreurs (set -euo pipefail), logging, et paramétrage
• Automatiser des tâches système courantes : sauvegarde BDD, rotation de logs, monitoring de services
• Écrire des scripts idempotents (exécutables plusieurs fois sans effet de bord)
• Automatiser la gestion des utilisateurs et des permissions sous Linux
• Manipuler des fichiers en masse avec Python (CSV, JSON, XML) : parsing, validation, conversion
• Créer des outils CLI Python réutilisables avec argparse
• Configurer des tâches planifiées avec cron pour l'exécution automatique de scripts
• Interagir avec des APIs système et des services distants depuis des scripts
• Documenter ses scripts avec des runbooks (procédure d'exécution, prérequis, rollback)
• Versionner ses scripts dans Git et les maintenir comme du code de production`,
        sortOrder: 16,
      },
      {
        title: "Mise en Production & Hébergement",
        volumeHoraire: 8,
        periode: "Février",
        avecMentor: true,
        contenu: `• Distinguer les environnements de développement, staging et production et comprendre leur rôle
• Gérer les variables d'environnement et protéger les secrets d'une application
• Comprendre le fonctionnement des noms de domaine et des DNS (A record, CNAME)
• Comprendre ce qu'est le HTTPS et pourquoi un certificat SSL est obligatoire en production
• Appréhender les enjeux d'une mise à jour en production (downtime, rollback, versioning)
• Déployer une application frontend et une API backend sur une plateforme d'hébergement moderne
• Connecter une base de données managée à une application déployée
• Mettre en place un déploiement continu depuis GitHub
• Savoir lire les logs d'une application pour diagnostiquer un problème basique
• Comprendre ce que sont la CI/CD, le monitoring et le logging et à quoi ils servent`,
        sortOrder: 17,
      },
    ],
  },
  {
    slug: "bachelor-2-ia-data",
    label: "Bachelor 2 - IA & Data",
    level: "bachelor",
    year: 2,
    specialization: "ia_data",
    sortOrder: 3,
    title: "Bachelor 2 - Spécialisation IA & Data",
    introduction:
      "Cette promo aborde la data engineering, la business intelligence et l'analyse de données. Les étudiants maîtrisent Python et souhaitent se spécialiser dans la data science.",
    subjects: [
      {
        title: "React.js & TypeScript",
        volumeHoraire: 16,
        periode: "Septembre à novembre",
        avecMentor: true,
        contenu: `• Typer du code JavaScript avec TypeScript (types primitifs, interfaces, génériques, union types)
• Configurer un projet TypeScript avec tsconfig.json et comprendre les options de compilation
• Créer des composants React fonctionnels avec JSX et les typer avec TypeScript
• Gérer l'état local et les effets avec les Hooks useState, useEffect, useContext, useReducer
• Créer des formulaires contrôlés avec validation côté client
• Naviguer entre les pages avec React Router v6 (routes, paramètres, navigation programmatique)
• Partager l'état global avec Context API et useReducer
• Composer des composants réutilisables avec des props typées et des children
• Configurer un projet avec Vite (dev server, build optimisé, HMR)
• Styler une application avec Tailwind CSS (utility-first, responsive, dark mode)
• Consommer une API REST avec fetch et gérer les états de chargement/erreur
• Gérer les appels asynchrones dans React (loading states, error boundaries)
• Créer des hooks personnalisés pour réutiliser la logique métier`,
        sortOrder: 1,
      },
      {
        title: "Python Backend & FastAPI",
        volumeHoraire: 20,
        periode: "Septembre à novembre",
        avecMentor: true,
        contenu: `• Révision rapide de la POO Python : classes, héritage, polymorphisme appliqués au backend
• Créer des APIs REST complètes avec FastAPI (routing, modèles Pydantic, validation automatique)
• Implémenter l'authentification JWT pour sécuriser les endpoints d'une API
• Générer automatiquement la documentation OpenAPI/Swagger de ses APIs
• Utiliser async/await pour créer des APIs performantes capables de gérer des requêtes concurrentes
• Gérer proprement les erreurs HTTP avec des codes de statut appropriés et des réponses structurées
• Connecter une API FastAPI à une base de données PostgreSQL
• Écrire des scripts Python pour automatiser des tâches courantes (parsing de logs, manipulation de fichiers, appels API)
• Interagir avec des APIs tierces via la librairie requests (GET, POST, authentification)
• Créer des CLI  avec argparse pour industrialiser ses scripts
• Structurer un projet backend Python avec séparation des responsabilités (routes, services, modèles)
• Débugger efficacement du code Python backend (breakpoints, logging)`,
        sortOrder: 2,
      },
      {
        title: "Travail collaboratif & documentation technique",
        volumeHoraire: 12,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Pratiquer la code review structurée : commentaires constructifs sur les PR (lisibilité, performance, sécurité)
• Utiliser les conventions GitHub (Approved, Request Changes, Comment) et faire converger vers un merge de qualité
• Rédiger un README complet et professionnel (installation, usage, architecture, contribution)
• Rédiger des ADR (Architecture Decision Records) justifiant les choix techniques majeurs d'un projet
• Formaliser la circulation de l'information dans un projet : qui produit, qui review, où stocker (Git, Wiki)
• Rédiger des issues claires (contexte, comportement attendu/observé, steps to reproduce)
• Structurer une PR description avec contexte, changements, et impact
• Communiquer un blocage technique de manière concise et actionnable`,
        sortOrder: 3,
      },
      {
        title: "SQL avancé",
        volumeHoraire: 12,
        periode: "Octobre",
        avecMentor: true,
        contenu: `• Comprendre le rôle du DCL et la notion de privilèges dans une base de données
• Créer et gérer des utilisateurs et des rôles avec GRANT et REVOKE
• Créer des vues et comprendre leur utilité pour l'abstraction et la sécurité
• Comprendre le fonctionnement des index et savoir quand les utiliser pour optimiser une requête
• Écrire des fonctions et des procédures stockées
• Créer des triggers et comprendre leur déclenchement (BEFORE, AFTER, INSERT, UPDATE, DELETE)
• Identifier dans un projet réel quand utiliser ces outils plutôt que de gérer la logique côté applicatif`,
        sortOrder: 4,
      },
      {
        title: "Réseaux",
        volumeHoraire: 36,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Installer et configurer un serveur DHCP sous Linux pour l'attribution automatique d'adresses IP
• Configurer un serveur DNS (bind9) pour la résolution de noms interne et externe
• Déployer un serveur web HTTP/HTTPS (Apache ou Nginx) avec certificats SSL/TLS
• Configurer un serveur FTP sécurisé et un accès SSH avec authentification par clé
• Mettre en place des règles de pare-feu (iptables/nftables) pour filtrer le trafic réseau
• Configurer un VPN basique pour sécuriser les communications entre sites
• Surveiller les services réseaux avec des outils de monitoring (nagios, netstat, ss)
• Diagnostiquer et résoudre des problèmes réseau courants (DNS, routage, connectivité)
• Sécuriser les services réseaux selon les bonnes pratiques (principe du moindre privilège, logs)`,
        sortOrder: 5,
      },
      {
        title: "Windows Server",
        volumeHoraire: 28,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Installer et configurer Windows Server 2022 (rôles, fonctionnalités, paramètres réseau)
• Déployer un domaine Active Directory Domain Services (AD DS)
• Créer et gérer des utilisateurs, groupes et Organizational Units (OU)
• Configurer des Group Policy Objects (GPO) pour appliquer des politiques de sécurité et de configuration
• Intégrer le DNS dans Active Directory pour la résolution de noms du domaine
• Configurer le DHCP pour attribuer automatiquement les adresses IP aux postes clients
• Déployer des services de fichiers (partages réseau) et d'impression
• Gérer l'accès aux ressources avec des permissions NTFS (héritage, refus explicite)
• Administrer Windows Server avec PowerShell (cmdlets, scripts d'automatisation)
• Joindre des postes clients au domaine Active Directory et vérifier l'application des GPO`,
        sortOrder: 6,
      },
      {
        title: "Accessibilité Web & SEO",
        volumeHoraire: 16,
        periode: "Décembre",
        avecMentor: false,
        contenu: `Accessibilité
• Appliquer les principes WCAG 2.1 niveau AA sur un projet web existant
• Structurer une page accessible avec le HTML sémantique dans des composants React
• Implémenter les attributs ARIA sur les composants interactifs (modales, menus, accordéons, tabs)
• Garantir une navigation complète au clavier : focus visible, tab order logique, focus trap
• Respecter les contrastes de couleurs conformes WCAG (ratio 4.5:1 texte, 3:1 grands éléments)
• Comprendre les enjeux légaux et business de l'accessibilité

SEO
• Comprendre le fonctionnement d'un moteur de recherche : crawl, indexation, ranking
• Effectuer une recherche de mots-clés et analyser l'intention de recherche
• Optimiser les éléments on-page : title, meta description, URLs, hiérarchie des titres, maillage interne
• Maîtriser les fondamentaux du SEO technique : robots.txt, sitemap XML, balises canoniques, duplicate content
• Mesurer et améliorer les Core Web Vitals avec Lighthouse et Google Search Console
• Comprendre les spécificités SEO des SPA React (SSR, SSG, meta tags dynamiques)
• Appréhender les bases du SEA et sa complémentarité avec le SEO`,
        sortOrder: 7,
      },
      {
        title: "Data Engineering Python",
        volumeHoraire: 12,
        periode: "Janvier",
        avecMentor: true,
        contenu: `• Manipuler des données avec Pandas (DataFrames, Series, indexing)
• Lire et écrire différents formats (CSV, Excel, JSON, Parquet)
• Nettoyer des données (gérer NaN, supprimer doublons, détecter outliers)
• Transformer des données (group by, aggregations, merge, join, pivot tables)
• Créer des graphiques avec Matplotlib (line, bar, scatter, histogram)
• Créer des visualisations statistiques avec Seaborn (distributions, correlations)
• Construire un dashboard interactif avec Streamlit
• Extraire des données d'une API REST avec requests
• Transformer des données selon des règles métier
• Charger des données dans une base SQL avec SQLAlchemy
• Automatiser un pipeline ETL complet (extraction, transformation, chargement)`,
        sortOrder: 8,
      },
      {
        title: "Sensibilisation à la cybersécurité",
        volumeHoraire: 16,
        periode: "Janvier",
        avecMentor: false,
        contenu: `• Identifier les menaces courantes (phishing, ransomware, malware, DDoS) et leurs vecteurs d'attaque
• Reconnaître les techniques d'ingénierie sociale et s'en protéger
• Créer et gérer des mots de passe robustes (longueur, complexité, gestionnaire de mots de passe)
• Configurer l'authentification multi-facteurs (2FA/MFA) sur ses comptes
• Appliquer le principe du moindre privilège (permissions minimales nécessaires)
• Identifier ce qu'est une donnée personnelle selon le RGPD et les obligations associées
• Respecter les droits des utilisateurs (accès, rectification, suppression, portabilité)
• Implémenter la privacy by design dans la conception d'applications
• Comprendre les obligations légales et les sanctions RGPD
• Sensibiliser ses pairs aux bonnes pratiques de sécurité`,
        sortOrder: 9,
      },
      {
        title: "Conception POO & Design Patterns",
        volumeHoraire: 28,
        periode: "Février",
        avecMentor: false,
        contenu: `• Appliquer les 5 principes SOLID dans la conception de classes et justifier chaque principe sur un exemple concret
• Reconnaître et implémenter les patterns créationnels : Singleton, Factory Method, Abstract Factory, Builder
• Reconnaître et implémenter les patterns structurels : Adapter, Decorator, Facade, Composite
• Reconnaître et implémenter les patterns comportementaux : Observer, Strategy, Command, State
• Concevoir des diagrammes UML de classes pour modéliser l'architecture d'une application
• Refactorer du code existant en appliquant les patterns appropriés (identifier le code smell, choisir le pattern, implémenter)
• Justifier ses choix de conception face à un pair ou un formateur
• Implémenter un mini-projet architecturé combinant au moins 3 design patterns"`,
        sortOrder: 10,
      },
      {
        title: "Tests automatisés",
        volumeHoraire: 16,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Comprendre pourquoi les tests sont indispensables dans un projet professionnel
• Situer les tests dans le cycle de développement logiciel
• Distinguer les niveaux de tests : unitaires, intégration, système (E2E) et tests utilisateurs
• Identifier les approches boîte noire, boîte blanche et boîte grise
• Être exposé à la philosophie TDD et comprendre l'intention derrière "tester d'abord"
• Structurer un test avec le pattern AAA (Arrange, Act, Assert)
• Rédiger une fiche de test pour une fonctionnalité donnée
• Lancer une suite de tests simple et lire son résultat`,
        sortOrder: 11,
      },
      {
        title: "Introduction aux bases du Cloud",
        volumeHoraire: 16,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Expliquer les modèles de service Cloud (IaaS, PaaS, SaaS) et identifier le modèle adapté à un besoin
• Distinguer les types de déploiement (public, privé, hybride) et leurs cas d'usage
• Créer et configurer des ressources Cloud basiques (VM, stockage, réseau) sur une plateforme majeure
• Appliquer les bonnes pratiques de sécurité Cloud (IAM, chiffrement, principe du moindre privilège)
• Comprendre les enjeux de souveraineté des données et les cadres réglementaires applicables
• Estimer le coût d'une infrastructure Cloud simple (calculateur de prix)`,
        sortOrder: 12,
      },
      {
        title: "Conteneurisation",
        volumeHoraire: 12,
        periode: "Avril",
        avecMentor: true,
        contenu: `• Écrire des Dockerfiles optimisés avec multi-stage builds (réduire une image de 1Go à <200Mo)
• Comprendre le système de layers Docker et utiliser le cache efficacement
• Créer des images Docker légères (Alpine, slim variants) adaptées au contexte
• Gérer des volumes Docker pour persister les données entre redémarrages
• Configurer des networks Docker pour la communication entre containers
• Utiliser des variables d'environnement pour configurer les containers (12-factor app)
• Écrire des fichiers docker-compose.yml multi-containers (frontend + backend + db)
• Débugger des containers (docker logs, docker exec, docker inspect)
• Pusher et puller des images sur DockerHub (registry publique/privée)
• Containeriser une application fullstack complète (React + FastAPI + PostgreSQL)
• Déployer une stack complète avec docker-compose up en un seul commande`,
        sortOrder: 13,
      },
      {
        title: "Mise en Production & Hébergement",
        volumeHoraire: 8,
        periode: "Février",
        avecMentor: true,
        contenu: `• Distinguer les environnements de développement, staging et production et comprendre leur rôle
• Gérer les variables d'environnement et protéger les secrets d'une application
• Comprendre le fonctionnement des noms de domaine et des DNS (A record, CNAME)
• Comprendre ce qu'est le HTTPS et pourquoi un certificat SSL est obligatoire en production
• Appréhender les enjeux d'une mise à jour en production (downtime, rollback, versioning)
• Déployer une application frontend et une API backend sur une plateforme d'hébergement moderne
• Connecter une base de données managée à une application déployée
• Mettre en place un déploiement continu depuis GitHub
• Savoir lire les logs d'une application pour diagnostiquer un problème basique
• Comprendre ce que sont la CI/CD, le monitoring et le logging et à quoi ils servent`,
        sortOrder: 14,
      },
      {
        title: "SPE DATA Business Intelligence",
        volumeHoraire: 24,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Comprendre les principes de la Business Intelligence et son rôle dans le cycle de vie des données d'entreprise.
• Savoir collecter et préparer des données pour la BI à partir de sources variées.
• Concevoir et interpréter des tableaux de bord interactifs et des visualisations de données adaptées aux besoins des utilisateurs.
• Identifier et analyser les indicateurs clés de performance pour répondre à des problématiques spécifiques.
• Découvrir les bases de l’intégration des données dans un entrepôt de données (ETL) et des notions de qualité des données.
• Respecter les bonnes pratiques et les cadres réglementaires tels que le RGPD dans la manipulation des données analytiques.`,
        sortOrder: 15,
      },
      {
        title: "SPE DATA Analyses et calcul numérique",
        volumeHoraire: 16,
        periode: "AVRIL",
        avecMentor: false,
        contenu: `• Maîtriser les calculs matriciels et la manipulation des vecteurs.
• Implémenter des méthodes d’approximation et d’interpolation.
• Résoudre des problématiques simples à l’aide d’équations mathématiques.
• Intégrer des calculs numériques dans des processus d’analyse de données.`,
        sortOrder: 16,
      },
      {
        title: "SPE DATA Extraction et transformation des flux de données",
        volumeHoraire: 16,
        periode: "Avril",
        avecMentor: false,
        contenu: `• Découvrir et utiliser un ETL open-source pour extraire, transformer et charger des données.
• Mettre en place un entrepôt de données (DWH) adapté à l’intégration de multiples sources.
• Trouver et exploiter des données ouvertes (open data) tout en respectant les réglementations (RGPD, licences).
• Extraire des données à partir de sources multiples (APIs, fichiers, bases de o données) et les traiter pour garantir leur qualité.
• Automatiser l’alimentation du DWH avec des scripts ou des outils pour intégrer des données en continu ou par lot.
• Documenter les processus ETL pour garantir leur maintenabilité et leur conformité`,
        sortOrder: 17,
      },
      {
        title: "SPE DATA Manipulation massive de données",
        volumeHoraire: 16,
        periode: "Juin",
        avecMentor: false,
        contenu: `• Apprendre à manipuler des données volumineuses à l’aide de bibliothèques Python comme Pandas, Dask ou PySpark.
• Comprendre les principes de traitement distribué avec des outils comme Apache Spark ou Hadoop.
• Nettoyer, structurer et transformer des données massives tout en garantissant leur qualité et leur cohérence.
• Optimiser les performances des processus de manipulation et d’analyse de données massives.
• Respecter les cadres juridiques et éthiques liés à la manipulation des données sensibles ou ouvertes.
• Mettre en œuvre des workflows pratiques pour intégrer et traiter des données issues de multiples sources.`,
        sortOrder: 18,
      },
    ],
  },
  {
    slug: "bachelor-3-developpement",
    label: "Bachelor 3 - Développement",
    level: "bachelor",
    year: 3,
    specialization: "developpement",
    sortOrder: 4,
    title: "Bachelor 3 - Spécialisation Développement",
    introduction:
      "En troisième année, les étudiants approfondissent l'architecture logicielle, le développement fullstack moderne et les pratiques DevOps avancées.",
    subjects: [
      {
        title: "Bases de Données Non Relationnelles",
        volumeHoraire: 14,
        periode: "Décembre",
        avecMentor: false,
        contenu: `• Identifier les 4 grands paradigmes NoSQL (document, clé-valeur, colonne, graphe) et leurs cas d'usage respectifs
• Comparer SQL et NoSQL sur des critères concrets : structure des données, scalabilité, cohérence, cas d'usage
• Modéliser des données en format document et comprendre en quoi ça diffère d'un schéma relationnel 
• Effectuer des opérations CRUD et des agrégations dans MongoDB
• Créer et exploiter des index dans MongoDB pour optimiser les performances
• Choisir et justifier le bon type de base de données selon les contraintes d'un projet réel`,
        sortOrder: 1,
      },
      {
        title: "Bases de Données Relationnelles Avancées",
        volumeHoraire: 7,
        periode: "Novembre / décembre",
        avecMentor: false,
        contenu: `• Optimiser les performances d'une requête lente en lisant et interprétant un plan d'exécution avec EXPLAIN ANALYZE
• Optimiser l'accès aux données avec l'indexation avancée : index composites, partiels, sur expressions et covering indexes et savoir quand ne pas indexer
• Optimiser les requêtes de reporting avec les vues matérialisées et comprendre leur cycle de rafraîchissement
• Optimiser la lisibilité et les performances de requêtes complexes avec les CTE récursives et non récursives
• Optimiser les requêtes analytiques avec les fonctions de fenêtrage (OVER, PARTITION BY, ROW_NUMBER, RANK, LAG, LEAD)
• Garantir l'intégrité des données sous forte charge avec les transactions : niveaux d'isolation (READ COMMITTED, REPEATABLE READ, SERIALIZABLE), gestion des deadlocks et compréhension du MVCC
• Dénormaliser stratégiquement un schéma pour répondre à des contraintes de performance ou de reporting, en sachant mesurer le gain réel avec EXPLAIN ANALYZE`,
        sortOrder: 2,
      },
      {
        title: "Conception et architecture des données",
        volumeHoraire: 14,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Concevoir un MCD à partir d'un cahier des charges métier et le traduire en schéma physique (MLD, MPD)
• Décider de normaliser ou dénormaliser un schéma selon les contraintes du projet (lecture intensive, reporting, fort trafic)
• Identifier les 4 paradigmes NoSQL (document, clé-valeur, colonne, graphe) et leurs cas d'usage respectifs
• Choisir et justifier le bon paradigme de base de données selon les contraintes d'un projet réel
• Concevoir une architecture de données polyglotte combinant SQL et NoSQL dans une même application`,
        sortOrder: 3,
      },
      {
        title: "Sécurité Applicative & RGPD",
        volumeHoraire: 14,
        periode: "Janvier",
        avecMentor: false,
        contenu: `• Repérer et corriger les 5 vulnérabilités OWASP les plus courantes sur une application réelle (injection SQL, XSS, CSRF, IDOR, broken auth)
• Mettre en place le chiffrement des données sensibles au repos et en transit (bcrypt, AES, TLS)
• Appliquer les exigences du RGPD dans le code : consentement, droit à l'oubli, minimisation des données, registre de traitement
• Réaliser un audit de sécurité basique sur une application existante et rédiger un rapport de remédiation`,
        sortOrder: 4,
      },
      {
        title: "Conception d'Interfaces",
        volumeHoraire: 14,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Appliquer les grandes lois ergonomiques (Fitts, Hick, Miller, proximité Gestalt) à la conception concrète d'une interface
• Réaliser un wireframe et un prototype interactif sur Figma en respectant les critères d'accessibilité (WCAG 2.1 AA)
• Construire un design system minimal avec composants réutilisables, tokens de couleur et de typographie, et une documentation utilisable
• Mener un test utilisateur et itérer sur le design à partir des retours collectés`,
        sortOrder: 5,
      },
      {
        title: "Architecture Hexagonale & DDD",
        volumeHoraire: 28,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Distinguer les responsabilités des couches présentation, métier et infrastructure dans une architecture en couches
• Appliquer les principes SOLID à l'échelle d'une architecture complète et pas uniquement à l'échelle d'une classe
• Implémenter l'architecture hexagonale : ports, adapters et injection de dépendances pour isoler la logique métier de l'infrastructure
• Concevoir une application selon l'approche DDD : bounded contexts, aggregates, entités, value objects et domain events
• Identifier quand appliquer le DDD et quand une architecture plus simple suffit
• Refactorer une application non structurée vers une architecture hexagonale
• Rédiger un document d'architecture technique (diagrammes UML composants + séquence) pour un projet d'équipe`,
        sortOrder: 6,
      },
      {
        title: "Projet Fil Rouge Application Full-Stack",
        volumeHoraire: 35,
        periode: "Novembre / juin",
        avecMentor: false,
        contenu: `• Concevoir l'architecture complète d'une application avec diagrammes C4, choix technologiques argumentés et modèle de données
• Développer le backend (API REST), le frontend (Next.js SSR) ou l'application mobile (React Native)
• Mettre en place le pipeline CI/CD, la conteneurisation Docker et le monitoring Prometheus/Grafana
• Livrer en sprints agiles avec code reviews, tests automatisés (couverture >70%) et documentation technique complète`,
        sortOrder: 7,
      },
      {
        title: "Développement Backend & Microservices",
        volumeHoraire: 28,
        periode: "Février",
        avecMentor: false,
        contenu: `• Comprendre les différences fondamentales entre monolith modulaire et microservices : avantages, inconvénients, et critères de choix
• Concevoir une architecture microservices : découpage des responsabilités, indépendance des services
• Mettre en place la communication synchrone entre services avec REST via une API Gateway
• Mettre en place la communication asynchrone entre services avec RabbitMQ/Kafka
• Appliquer les patterns de résilience fondamentaux : circuit breaker, retry avec backoff exponentiel et timeout`,
        sortOrder: 8,
      },
      {
        title: "Développement Frontend Avancé",
        volumeHoraire: 28,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Développer une application Next.js complète en choisissant SSR (Server-Side Rendering) ou SSG (Static Site Generation) selon les besoins de chaque page
• Gérer l'état de l'application avec Zustand pour l'état global et TanStack Query pour le cache serveur, avec des mises à jour optimistes
• Optimiser les performances frontend : lazy loading, code splitting, optimisation des images, Core Web Vitals
• Intégrer l'authentification (NextAuth.js), la gestion des rôles et la protection des routes côté client et côté serveur`,
        sortOrder: 9,
      },
      {
        title: "Clean Code & Refactoring",
        volumeHoraire: 14,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Repérer et éliminer les code smells classiques (Long Method, God Class, Feature Envy, Shotgun Surgery) avec des refactorings ciblés
• Appliquer les principes SOLID sur un projet existant : extraire des interfaces, inverser les dépendances, séparer les responsabilités
• Refactorer du code legacy en toute sécurité avec des characterization tests, le Strangler Fig pattern et la technique extract-and-override
• Mesurer et réduire la dette technique avec de l'analyse statique (SonarQube) et des métriques de complexité cyclomatique`,
        sortOrder: 10,
      },
      {
        title: "Développement Mobile",
        volumeHoraire: 21,
        periode: "Avril",
        avecMentor: false,
        contenu: `• Comprendre les différences entre Expo et React Native CLI et mettre en place un projet React Native avec Expo
• Développer une application iOS et Android : navigation multi-écrans, composants natifs, Hooks, StyleSheet Flexbox
• Implémenter une navigation complexe avec React Navigation : Stack, Tab, Drawer et deep linking
• Gérer le state global avec Zustand et les données serveur avec TanStack Query pour rester cohérent avec l'écosystème React du cursus
• Intégrer les fonctionnalités natives incontournables : caméra, géolocalisation, notifications push Firebase
• Implémenter un mode offline-first avec SQLite : persistance locale et synchronisation au retour du réseau
• Optimiser les performances de l'application : React.memo, FlatList virtualisée, lazy loading des images`,
        sortOrder: 11,
      },
      {
        title: "Qualité Logicielle & Testing Avancé",
        volumeHoraire: 14,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Écrire des tests unitaires avec Jest sur des fonctions et composants isolés
• Utiliser les mocks et spies Jest pour isoler les dépendances (API calls, modules externes)
• Structurer une suite de tests lisible et maintenable (nommage, organisation par feature, pattern AAA)
• Écrire des tests E2E avec Cypress sur un parcours utilisateur complet (formulaire, navigation, assertions DOM)
• Distinguer ce qui relève du test unitaire, du test d'intégration et du test E2E et choisir le bon outil
• Identifier les zones critiques d'un projet et prioriser la couverture en conséquence
• Intégrer Jest et Cypress dans un pipeline CI/CD basique et lire les rapports de résultats`,
        sortOrder: 12,
      },
      {
        title: "DevOps & Déploiement Continu",
        volumeHoraire: 28,
        periode: "Juin",
        avecMentor: false,
        contenu: `• Créer un pipeline CI/CD complet en 4 stages (build, test, security scan, deploy) avec GitHub Actions ou GitLab CI
• Orchestrer une application multi-services avec Docker Compose (app + BDD + cache + reverse proxy) et des réseaux Docker
• Déployer une application sur un cluster Kubernetes : Pods, Services, Deployments, ConfigMaps, Ingress
• Configurer le monitoring applicatif avec Prometheus (métriques custom) et Grafana (dashboards d'alerte)`,
        sortOrder: 13,
      },
      {
        title: "Participation Projet & Agilité",
        volumeHoraire: 14,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Participer efficacement aux cérémonies Scrum : Daily, Sprint Planning, Review et Retrospective
• Rédiger des user stories avec critères d'acceptance et estimer en planning poker Fibonacci
•  Mettre en place les différents artefacts Scrum : Product Backlog, Sprint backlog, story mapping
• Utiliser Jira ou Notion pour suivre l'avancement d'un projet et produire un burndown chart
• Pratiquer le Kanban avec WIP limits et comprendre la différence entre pull et push
• Identifier les acteurs d'un processus métier, cartographier les flux d'information et extraire les règles de gestion
• Conduire une rétrospective et formuler des actions d'amélioration concrètes et mesurables`,
        sortOrder: 14,
      },
      {
        title: "Communication Technique",
        volumeHoraire: 14,
        periode: "Février",
        avecMentor: false,
        contenu: `• Rédiger un ADR (Architecture Decision Record) pour justifier un choix technique de façon claire et structurée auprès de votre équipe
• Présenter une démo technique de 10 minutes à un public mixte (technique et non-technique) avec un fil conducteur cohérent
• Produire une documentation de projet complète : guide d'installation, API reference (Swagger/OpenAPI), guide de contribution
• Formaliser les spécifications fonctionnelles d'une feature à partir d'un besoin métier exprimé à l'oral`,
        sortOrder: 15,
      },
      {
        title: "Intégration API & Services Tiers",
        volumeHoraire: 21,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Intégrer plusieurs services tiers dans une application (paiement, stockage, email) en gérant correctement les erreurs et les retry
• Implémenter des webhooks entrants et sortants avec validation de signature et idempotence
• Concevoir un ETL léger pour synchroniser des données entre systèmes (API → base locale → cache)
• Écrire des tests d'intégration en mockant les services externes (VCR pattern, fixtures HTTP)`,
        sortOrder: 16,
      },
      {
        title: "Rétro-ingénierie & Audit de Code",
        volumeHoraire: 14,
        periode: "Avril",
        avecMentor: false,
        contenu: `• Analyser une base de données non documentée (50+ tables) et produire un MCD/MLD complet avec les relations identifiées
• Reverser une API existante à partir du code source : identifier les endpoints, les modèles de données et les flux d'authentification
• Générer une spécification OpenAPI à partir d'une API non documentée et la valider
• Produire un rapport d'audit de code avec les points de dette technique, les vulnérabilités, les fragilités et des recommandations concrètes`,
        sortOrder: 17,
      },
      {
        title: "Échange de Données & Interopérabilité",
        volumeHoraire: 14,
        periode: "Janvier",
        avecMentor: false,
        contenu: `• Mettre en place des échanges de données avec différents formats de sérialisation (JSON, Protobuf, Avro) et comparer leurs performances selon les cas
• Définir un contrat de données (JSON Schema / data contract) pour fiabiliser les échanges entre systèmes
• Implémenter un pattern d'intégration asynchrone avec un message broker (RabbitMQ ou Redis Pub/Sub)
• Versionner une API (URL versioning, header versioning) en gérant la rétrocompatibilité pour les clients existants`,
        sortOrder: 18,
      },
    ],
  },
  {
    slug: "bachelor-3-ia-data",
    label: "Bachelor 3 - IA & Data",
    level: "bachelor",
    year: 3,
    specialization: "ia_data",
    sortOrder: 5,
    title: "Bachelor 3 - Spécialisation IA & Data",
    introduction:
      "Cette promotion s'oriente vers le machine learning appliqué, les pipelines de données et la BI avancée. Les étudiants ont une bonne maîtrise de Python et du SQL.",
    subjects: [
      {
        title: "Conception et architecture des données",
        volumeHoraire: 14,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Concevoir un MCD à partir d'un cahier des charges métier et le traduire en schéma physique (MLD, MPD)
• Décider de normaliser ou dénormaliser un schéma selon les contraintes du projet (lecture intensive, reporting, fort trafic)
• Identifier les 4 paradigmes NoSQL (document, clé-valeur, colonne, graphe) et leurs cas d'usage respectifs
• Choisir et justifier le bon paradigme de base de données selon les contraintes d'un projet réel
• Concevoir une architecture de données polyglotte combinant SQL et NoSQL dans une même application`,
        sortOrder: 1,
      },
      {
        title: "Sécurité Applicative & RGPD",
        volumeHoraire: 14,
        periode: "Janvier",
        avecMentor: false,
        contenu: `• Repérer et corriger les 5 vulnérabilités OWASP les plus courantes sur une application réelle (injection SQL, XSS, CSRF, IDOR, broken auth)
• Mettre en place le chiffrement des données sensibles au repos et en transit (bcrypt, AES, TLS)
• Appliquer les exigences du RGPD dans le code : consentement, droit à l'oubli, minimisation des données, registre de traitement
• Réaliser un audit de sécurité basique sur une application existante et rédiger un rapport de remédiation`,
        sortOrder: 2,
      },
      {
        title: "Conception d'Interfaces",
        volumeHoraire: 14,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Appliquer les grandes lois ergonomiques (Fitts, Hick, Miller, proximité Gestalt) à la conception concrète d'une interface
• Réaliser un wireframe et un prototype interactif sur Figma en respectant les critères d'accessibilité (WCAG 2.1 AA)
• Construire un design system minimal avec composants réutilisables, tokens de couleur et de typographie, et une documentation utilisable
• Mener un test utilisateur et itérer sur le design à partir des retours collectés`,
        sortOrder: 3,
      },
      {
        title: "Architecture Hexagonale & DDD",
        volumeHoraire: 28,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Distinguer les responsabilités des couches présentation, métier et infrastructure dans une architecture en couches
• Appliquer les principes SOLID à l'échelle d'une architecture complète et pas uniquement à l'échelle d'une classe
• Implémenter l'architecture hexagonale : ports, adapters et injection de dépendances pour isoler la logique métier de l'infrastructure
• Concevoir une application selon l'approche DDD : bounded contexts, aggregates, entités, value objects et domain events
• Identifier quand appliquer le DDD et quand une architecture plus simple suffit
• Refactorer une application non structurée vers une architecture hexagonale
• Rédiger un document d'architecture technique (diagrammes UML composants + séquence) pour un projet d'équipe`,
        sortOrder: 4,
      },
      {
        title: "Modélisation Décisionnelle & Data Warehousing",
        volumeHoraire: 21,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Concevoir un schéma en étoile et en flocon à partir d'un besoin métier : tables de faits, dimensions, métriques agrégées
• Gérer l'historisation des données référentielles avec les Slowly Changing Dimensions (SCD Type 1, 2, 3)
• Architecturer un data warehouse en 3 couches (staging, integration, presentation) avec des conventions de nommage claires
• Comparer les approches Kimball (bottom-up) et Inmon (top-down) et justifier le choix selon le contexte du projet`,
        sortOrder: 5,
      },
      {
        title: "Qualité Logicielle & Testing Avancé",
        volumeHoraire: 14,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Écrire des tests unitaires avec Jest sur des fonctions et composants isolés
• Utiliser les mocks et spies Jest pour isoler les dépendances (API calls, modules externes)
• Structurer une suite de tests lisible et maintenable (nommage, organisation par feature, pattern AAA)
• Écrire des tests E2E avec Cypress sur un parcours utilisateur complet (formulaire, navigation, assertions DOM)
• Distinguer ce qui relève du test unitaire, du test d'intégration et du test E2E et choisir le bon outil
• Identifier les zones critiques d'un projet et prioriser la couverture en conséquence
• Intégrer Jest et Cypress dans un pipeline CI/CD basique et lire les rapports de résultats`,
        sortOrder: 6,
      },
      {
        title: "Projet Fil Rouge Pipeline Data End-to-End",
        volumeHoraire: 28,
        periode: "Novembre / juin",
        avecMentor: false,
        contenu: `• Concevoir l'architecture data complète : diagramme de flux, choix technologiques justifiés et modèle dimensionnel en étoile adapté au cas métier
• Implémenter le pipeline ETL : extraction multi-sources (API, CSV, bases relationnelles), transformation et nettoyage, chargement dans le warehouse
• Orchestrer le pipeline avec Airflow : DAGs, gestion des dépendances, retry, alertes, scheduling et idempotence
• Exploiter le warehouse avec du SQL analytique avancé : window functions, CTEs, optimisation de requêtes pour alimenter la couche de restitution
Entraîner et intégrer un modèle prédictif sur les données du warehouse, évaluer ses performances et exposer les prédictions avec une interprétation métier
• Livrer un dashboard décisionnel connecté au warehouse, combinant KPIs analytiques et résultats du modèle, avec une documentation utilisateur claire`,
        sortOrder: 7,
      },
      {
        title: "Mathématiques pour la Data",
        volumeHoraire: 28,
        periode: "Février",
        avecMentor: false,
        contenu: `• Réaliser des tests d'hypothèse (H0/H1, p-value, intervalle de confiance à 95%) et interpréter les résultats pour orienter une décision
• Appliquer le théorème de Bayes à des cas concrets : détection de fraude, classification, diagnostic
• Implémenter une régression linéaire from scratch en NumPy (calcul matriciel, résidus, R²) puis valider avec scikit-learn
• Calculer et interpréter une matrice de corrélation, identifier les variables colinéaires et appliquer une réduction de dimension (PCA)`,
        sortOrder: 8,
      },
      {
        title: "Machine Learning Appliqué",
        volumeHoraire: 21,
        periode: "Mars",
        avecMentor: false,
        contenu: `• Construire des pipelines Scikit-learn complets avec Pipeline() et ColumnTransformer, du preprocessing jusqu'au modèle, en garantissant l'absence de data leakage
• Appliquer la sélection de features orientée modèle (SelectKBest, feature_importances_, RFE) en la distinguant des filtres de qualité pipeline vus en ETL
• Entraîner et comparer les algorithmes supervisés clés — régression linéaire et logistique, arbres de décision, Random Forest, XGBoost — et choisir l'algorithme adapté selon la nature du problème
• Évaluer un modèle honnêtement avec la cross-validation et les métriques adaptées au contexte métier (accuracy, F1, AUC-ROC, RMSE), en comprenant les implications d'un faux positif vs faux négatif selon le domaine
• Mettre en œuvre l'apprentissage non supervisé via le clustering (k-means, DBSCAN, hiérarchique) et la réduction de dimension (PCA, t-SNE) pour les problèmes sans label
• Identifier et corriger les pièges classiques : data leakage, overfitting, underfitting, biais de dataset et mauvais choix de métriques`,
        sortOrder: 9,
      },
      {
        title: "Python Data Engineering & SQL Avancé",
        volumeHoraire: 28,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Maîtriser les window functions SQL (ROW_NUMBER, RANK, LAG, LEAD, NTILE, PERCENT_RANK) et les CTEs récursifs pour l'analyse avancée
• Optimiser les requêtes lentes avec EXPLAIN ANALYZE, index partiels, partitionnement de tables volumineuses et stratégies de dénormalisation
• Mettre en place un pipeline de data quality testing : validation de schéma, détection d'anomalies, alertes sur les drifts de données
• Traiter des volumes importants avec Dask (DataFrames parallélisés) et comparer les performances avec pandas sur des jeux de données réels
• Construire un pipeline d'ingestion avec MongoDB : schéma flexible, agrégation pipeline, indexation pour la performance
• Configurer une base time-series (InfluxDB ou TimescaleDB) pour stocker et interroger des métriques applicatives ou des données IoT
• Utiliser Redis comme cache de pipeline : invalidation, TTL, structures de données avancées (sorted sets, streams)
• Concevoir un pipeline polyglotte intégrant PostgreSQL, MongoDB et Redis dans une même architecture de traitement`,
        sortOrder: 10,
      },
      {
        title: "BI & Visualisation Avancée",
        volumeHoraire: 14,
        periode: "Juin",
        avecMentor: false,
        contenu: `• Concevoir un tableau de bord décisionnel avec Metabase ou Apache Superset : KPIs, filtres dynamiques, connexion directe au data warehouse
• Calculer des KPIs complexes : cohortes, rétention, funnel de conversion, comparaison N/N-1
• Appliquer les principes fondamentaux de dataviz (Tufte) : choix du bon type de graphique, ratio encre/données, accessibilité couleur
• Structurer une présentation data-driven synthétique avec recommandations actionnables pour un public métier`,
        sortOrder: 11,
      },
      {
        title: "DevOps & Déploiement Continu",
        volumeHoraire: 28,
        periode: "Juin",
        avecMentor: false,
        contenu: `• Créer un pipeline CI/CD complet en 4 stages (build, test, security scan, deploy) avec GitHub Actions ou GitLab CI
• Orchestrer une application multi-services avec Docker Compose (app + BDD + cache + reverse proxy) et des réseaux Docker
• Déployer une application sur un cluster Kubernetes : Pods, Services, Deployments, ConfigMaps, Ingress
• Configurer le monitoring applicatif avec Prometheus (métriques custom) et Grafana (dashboards d'alerte)`,
        sortOrder: 12,
      },
      {
        title: "Participation Projet & Agilité",
        volumeHoraire: 14,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Participer efficacement aux cérémonies Scrum : Daily, Sprint Planning, Review et Retrospective
• Rédiger des user stories avec critères d'acceptance et estimer en planning poker Fibonacci
•  Mettre en place les différents artefacts Scrum : Product Backlog, Sprint backlog, story mapping
• Utiliser Jira ou Notion pour suivre l'avancement d'un projet et produire un burndown chart
• Pratiquer le Kanban avec WIP limits et comprendre la différence entre pull et push
• Identifier les acteurs d'un processus métier, cartographier les flux d'information et extraire les règles de gestion
• Conduire une rétrospective et formuler des actions d'amélioration concrètes et mesurables`,
        sortOrder: 13,
      },
      {
        title: "Communication Technique",
        volumeHoraire: 14,
        periode: "Février",
        avecMentor: false,
        contenu: `• Rédiger un ADR (Architecture Decision Record) pour justifier un choix technique de façon claire et structurée auprès de votre équipe
• Présenter une démo technique de 10 minutes à un public mixte (technique et non-technique) avec un fil conducteur cohérent
• Produire une documentation de projet complète : guide d'installation, API reference (Swagger/OpenAPI), guide de contribution
• Formaliser les spécifications fonctionnelles d'une feature à partir d'un besoin métier exprimé à l'oral`,
        sortOrder: 14,
      },
      {
        title: "Rétro-ingénierie & Audit de Code",
        volumeHoraire: 14,
        periode: "Avril",
        avecMentor: false,
        contenu: `• Analyser une base de données non documentée (50+ tables) et produire un MCD/MLD complet avec les relations identifiées
• Reverser une API existante à partir du code source : identifier les endpoints, les modèles de données et les flux d'authentification
• Générer une spécification OpenAPI à partir d'une API non documentée et la valider
• Produire un rapport d'audit de code avec les points de dette technique, les vulnérabilités, les fragilités et des recommandations concrètes`,
        sortOrder: 15,
      },
      {
        title: "Échange de Données & Interopérabilité",
        volumeHoraire: 14,
        periode: "Janvier",
        avecMentor: false,
        contenu: `• Mettre en place des échanges de données avec différents formats de sérialisation (JSON, Protobuf, Avro) et comparer leurs performances selon les cas
• Définir un contrat de données (JSON Schema / data contract) pour fiabiliser les échanges entre systèmes
• Implémenter un pattern d'intégration asynchrone avec un message broker (RabbitMQ ou Redis Pub/Sub)
• Versionner une API (URL versioning, header versioning) en gérant la rétrocompatibilité pour les clients existants`,
        sortOrder: 16,
      },
      {
        title: "ETL, Pipelines et Orchestration",
        volumeHoraire: 28,
        periode: "Décembre",
        avecMentor: false,
        contenu: `• Formaliser le preprocessing comme étape de pipeline : politique de nulls (seuil de drop vs imputation), encodage et mise à l'échelle appliqués comme règles documentées et reproductibles, validation de distribution et de variance nulle comme filtres de qualité
• Définir des data contracts avec JSON Schema et pandera pour contractualiser les interfaces entre systèmes producteurs et consommateurs, et piloter le comportement du pipeline en cas de violation
• Développer des DAGs Airflow avec gestion des dépendances, retry policies, alertes email/Slack et scheduling cron pour orchestrer des pipelines fiables en production
• Appliquer les patterns d'idempotence et de replay (upsert, watermark, partition par date) pour garantir qu'un pipeline peut être rejoué sans effet de bord
• Monitorer les pipelines avec des métriques de performance (latence, volume, fraîcheur), détecter le data drift par tests statistiques et configurer des alertes proactives avant impact aval`,
        sortOrder: 17,
      },
    ],
  },
  {
    slug: "mastere-1-dev-fullstack",
    label: "Mastère 1 - Développement Fullstack",
    level: "mastere",
    year: 1,
    specialization: "dev_fullstack",
    sortOrder: 6,
    title: "Mastère 1 - Expert Développement Logiciel Fullstack",
    introduction:
      "Ce programme forme des développeurs fullstack experts capables de concevoir, développer et déployer des applications web complexes en utilisant les derniers outils et méthodologies du secteur.",
    subjects: [
      {
        title: "Domain-Driven Design",
        volumeHoraire: 21,
        periode: "Septembre",
        avecMentor: false,
        contenu: `• Identifier les bounded contexts d'un projet
• Définir l'ubiquitous language avec le métier
• Modéliser les entités et value objects principaux
• Pratiquer l'event storming pour comprendre le domaine
• Créer un modèle de domaine simple pour démarrer le projet
• Comprendre les bases DDD sans aller dans la complexité`,
        sortOrder: 1,
      },
      {
        title: "Veille Technologique & Sélection de Solutions",
        volumeHoraire: 14,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Mettre en place un système de veille technologique structuré et efficace
• Analyser les tendances technologiques et évaluer leur maturité (Hype Cycle)
• Réaliser des études comparatives rigoureuses de solutions techniques
• Évaluer les solutions en termes de sécurité, performance, coût et viabilité
• Analyser l'impact des choix technologiques sur dette technique et écoconception
• Présenter des recommandations techniques argumentées devant décideurs`,
        sortOrder: 2,
      },
      {
        title: "Fil Rouge FullStack : Cadrage",
        volumeHoraire: 19,
        periode: "Novembre / Juin",
        avecMentor: false,
        contenu: `• Constituer l'équipe et définir les rôles
• Cadrer le périmètre fonctionnel et technique du projet
• Rédiger le brief et les spécifications initiales
• Démarrer le développement
• Planifier les jalons jusqu'à la soutenance`,
        sortOrder: 3,
      },
      {
        title: "Stratégie de Tests & TDD",
        volumeHoraire: 35,
        periode: "",
        avecMentor: false,
        contenu: `• Pratiquer TDD avec cycle Red-Green-Refactor systématique
• Écrire des tests unitaires atteignant >80% de couverture avec mocks et stubs
• Appliquer property-based testing et mutation testing pour valider la qualité
• Implémenter des tests d'intégration API complets
• Automatiser les tests E2E avec Cypress ou Playwright
• Pratiquer BDD avec Cucumber pour collaboration métier/tech`,
        sortOrder: 4,
      },
      {
        title: "Optimisation Bases de Données & NoSQL",
        volumeHoraire: 21,
        periode: "",
        avecMentor: false,
        contenu: `• Concevoir le schéma de base de données d'un projet
• Écrire des requêtes SQL complexes optimisées
• Optimiser les performances avec indexes et explain plans
• Utiliser MongoDB pour données non-relationnelles
• Choisir entre SQL et NoSQL selon les besoins projet`,
        sortOrder: 5,
      },
      {
        title: "Clean Architecture & API REST en microservice",
        volumeHoraire: 28,
        periode: "",
        avecMentor: false,
        contenu: `• Développer des APIs REST avec Clean Architecture (Domain/Application/Infrastructure)
• Implémenter l'authentification JWT sécurisée avec refresh tokens
• Valider les entrées avec schémas robustes (Joi, Pydantic, Zod)
• Documenter les APIs avec OpenAPI 3.0/Swagger de manière exhaustive
• Mettre en place rate limiting, throttling et caching strategies
• Gérer les patterns asynchrones (async/await, promises, queues)`,
        sortOrder: 6,
      },
      {
        title: "Développement Frontend Moderne",
        volumeHoraire: 28,
        periode: "",
        avecMentor: false,
        contenu: `• Maîtriser React ou Vue ou Angular avec composants complexes et hooks avancés
• Implémenter state management global (Redux/Zustand/Pinia) dans application réelle
• Optimiser les performances frontend (lazy loading, code splitting, memoization)
• Créer des Web Components réutilisables et interopérables
• Structurer une application avec patterns avancés (HOC, render props, composition)`,
        sortOrder: 7,
      },
      {
        title: "Performance & Optimisation Applicative",
        volumeHoraire: 14,
        periode: "",
        avecMentor: false,
        contenu: `• Identifier les bottlenecks d'un projet développement
• Optimiser le frontend : lazy loading, code splitting, images
• Implémenter caching multi-niveaux (Redis, browser cache)
• Optimiser les requêtes base de données
• Mesurer les performances avec Lighthouse et PageSpeed
• Atteindre un temps de chargement < 3 secondes`,
        sortOrder: 8,
      },
      {
        title: "Sécurité Applicative - OWASP Top 10",
        volumeHoraire: 21,
        periode: "Mars / mai",
        avecMentor: false,
        contenu: `• Prévenir les vulnérabilités OWASP Top 10 (injection, XSS, CSRF, etc.)
• Implémenter une authentification sécurisée avec hashing adaptatif (bcrypt, Argon2)
• Configurer les headers HTTP de sécurité (CSP, HSTS, CORS)
• Valider et sanitizer toutes les entrées utilisateur de manière robuste
• Pratiquer le pentesting avec OWASP ZAP
• Modéliser les menaces avec STRIDE et créer des plans de mitigation`,
        sortOrder: 9,
      },
      {
        title: "Méthodologies Agile & Scrum",
        volumeHoraire: 21,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Animer des cérémonies Scrum (daily, planning, retro, review) de manière productive
• Estimer avec la méthode du poker planning et gérer la vélocité d'équipe
• Pratiquer Kanban avec des WIP limits et un flow management
• Conduire des retrospectives structurées avec des actions concrètes
• Collaborer efficacement avec le Product Owner sur la priorisation
• Mesurer et améliorer avec les métriques Agile (cycle time, lead time, throughput)`,
        sortOrder: 10,
      },
      {
        title: "Infrastructure as Code & Monitoring de Base",
        volumeHoraire: 14,
        periode: "Avril / mai",
        avecMentor: false,
        contenu: `• Écrire des configurations Terraform avec HCL pour provisionner l'infrastructure
• Créer des modules Terraform réutilisables et gérer le state avec remote backend
• Installer et configurer Prometheus pour collecter des métriques
• Créer des dashboards Grafana et configurer des alertes pertinentes
• Mettre en place des logs structurés pour faciliter le debug
• Instrumenter une application pour exposer des métriques custom`,
        sortOrder: 11,
      },
      {
        title: "Estimation & Chiffrage de Projets Complexes",
        volumeHoraire: 14,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Appliquer les techniques d'estimation adaptées au contexte
• Décomposer un projet en unités estimables (WBS, user stories)
• Identifier et intégrer les charges indirectes et coûts cachés
• Construire un budget projet détaillé incluant tous les postes
• Calculer le TCO (Total Cost of Ownership) sur 3-5 ans
• Présenter et défendre un chiffrage auprès de décideurs`,
        sortOrder: 12,
      },
      {
        title: "Docker & Kubernetes Fondamentaux",
        volumeHoraire: 21,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Créer des Dockerfiles multi-stage optimisés pour réduire la taille des images
• Gérer volumes et réseaux Docker pour des applications complexes
• Sécuriser les conteneurs (scanning, non-root users, secrets management)
• Déployer des applications sur Kubernetes avec Deployments et Services
• Configurer Ingress pour exposer les services via HTTPS
• Implémenter health checks et HPA pour la résilience et scalabilité`,
        sortOrder: 13,
      },
      {
        title: "Communication Projet & Reporting",
        volumeHoraire: 14,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Rédiger des comptes-rendus d'activités clairs et actionnables
• Préparer des présentations adaptées à différentes audiences
• Créer des dashboards de suivi projet visuels et pertinents
• Gérer la documentation projet et la traçabilité des décisions
• Adapter son discours technique selon l'audience
• Présenter efficacement les réalisations en sprint review`,
        sortOrder: 14,
      },
      {
        title: "CI/CD - Intégration & Déploiement Continu",
        volumeHoraire: 35,
        periode: "Novembre / janvier",
        avecMentor: false,
        contenu: `• Créer des pipelines CI multi-stages avec build, test, lint, security
• Mettre en place un pipeline CD vers dev/staging/production
• Implémenter blue-green deployment et canary releases pour zero-downtime
• Utiliser feature flags pour déploiement progressif et A/B testing
• Gérer les secrets de manière sécurisée (Vault, secrets managers)
• Intégrer SAST/SCA et gérer les environnements dynamiques par branche`,
        sortOrder: 15,
      },
      {
        title: "Analyse des Besoins & Faisabilité Technique",
        volumeHoraire: 28,
        periode: "Octobre / novembre",
        avecMentor: false,
        contenu: `• Cartographier les acteurs projet et définir leurs rôles (RACI/RASCI)
• Conduire des entretiens d'explicitation structurés
• Analyser l'environnement technique existant (SWOT)
• Identifier et quantifier les risques avec méthodologie structurée
• Proposer des stratégies de mitigation adaptées
• Rédiger un rapport de faisabilité avec recommandation Go/No-Go`,
        sortOrder: 16,
      },
    ],
  },
  {
    slug: "mastere-2-dev-fullstack",
    label: "Mastère 2 - Développement Fullstack",
    level: "mastere",
    year: 2,
    specialization: "dev_fullstack",
    sortOrder: 7,
    title: "Mastère 2 - Expert Développement Logiciel Fullstack",
    introduction:
      "La deuxième année du mastère approfondit les sujets avancés de web services, développement cloud, coordination frontend/backend et conteneurisation.",
    subjects: [
      {
        title: "Web services",
        volumeHoraire: 63,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `APIS REST :
> Découvrir les bonnes pratiques d’architecture et de design d’APIs ReSTful.
> Découvrir les menaces auxquelles s’exposent vos API.
> Découvrir les vulnérabilités les plus fréquentes.
> Repérer les points faibles d’une API.
> Corriger les vulnérabilités et développer de façon sécurisée.
SOAP/SOA - ARCHITECTURES ORIENTES SERVICES  :
> Intérioriser le "paradigme" SOA et prendre conscience de ses implications
> Être capable de trouver les "bons" services et de les documenter rigoureusement
> Appréhender la portée "système" et la nécessité de l'architecture logique
> Apprécier les conditions de succès des projets SOA et les exigences sur leur input`,
        sortOrder: 1,
      },
      {
        title: "Développer pour le cloud",
        volumeHoraire: 63,
        periode: "Semestre 2",
        avecMentor: false,
        contenu: `- Comprendre les principes fondamentaux du cloud et des architectures cloud-native, et identifier les solutions adaptées à différents besoins de développement. (C1.2.2, C1.3.2)
Concevoir des applications cloud en tirant parti des services comme la conteneurisation et les architectures serverless, tout en répondant aux exigences de scalabilité et de performance. (C1.5, C2.2.3)
Déployer et superviser des applications cloud sur des plateformes telles qu’AWS, GCP et Azure, en configurant les environnements et les outils nécessaires. (C2.1.1, C2.2.4)
Automatiser le déploiement des applications cloud à l’aide de pipelines d’intégration et de déploiement continu (CI/CD) pour garantir des mises à jour fluides et sans régression. (C2.1.2, C4.2.2)
Intégrer des outils de gestion de données cloud et de monitoring pour suivre la performance des applications et identifier les axes d’optimisation. (C4.1.2, C4.3.1)
Documenter les déploiements et les évolutions des applications pour assurer la traçabilité et faciliter la collaboration entre équipes. (C2.4.1, C4.3.2)`,
        sortOrder: 2,
      },
      {
        title: "Coordination Front&Back",
        volumeHoraire: 63,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `- Superviser la coordination entre les équipes front-end et back-end pour assurer une collaboration fluide.
- Gérer les interdépendances techniques entre les couches front et back dans un projet.
- Définir et documenter les interfaces entre le front-end et le back-end (API, contrats, spécifications).
- Mettre en place des pipelines CI/CD pour les projets multi-couches.
- Garantir la qualité des livrables à travers des tests unitaires, d’intégration et fonctionnels.
- Optimiser la performance des applications en prenant en compte les contraintes des deux environnements.
- Identifier et résoudre les conflits ou problématiques techniques liés à l’intégration entre front-end et back-end.
- Documenter les processus techniques et garantir leur traçabilité pour toutes les parties prenantes.`,
        sortOrder: 3,
      },
      {
        title: "Dév avec Docker",
        volumeHoraire: 28,
        periode: "Semestre,1",
        avecMentor: false,
        contenu: `- Acquérir une compréhension solide de Docker, y compris son architecture, son fonctionnement et ses cas d'usage.
- Apprendre à installer et à configurer Docker sur divers systèmes d'exploitation.
- Maîtriser la création, la gestion, et le déploiement de conteneurs Docker pour développer, tester, et déployer des applications de manière efficace et isolée.
- Explorer les fonctionnalités avancées de Docker, telles que Docker Compose pour la gestion de services multi-conteneurs, le réseau Docker, et le stockage persistant.
- Comprendre l'intégration de Docker dans les workflows de développement et de déploiement continu (CI/CD) et dans les écosystèmes de microservices.`,
        sortOrder: 4,
      },
    ],
  },
  {
    slug: "mastere-1-dev-mobile-iot",
    label: "Mastère 1 - Développement Mobile & IoT",
    level: "mastere",
    year: 1,
    specialization: "dev_mobile_iot",
    sortOrder: 8,
    title: "Mastère 1 - Expert Développement Logiciel Mobile et IoT",
    introduction:
      "Ce programme forme des experts en développement mobile (Android, Flutter, React Native) et en solutions IoT connectées. Les étudiants apprennent à concevoir des applications performantes et des architectures embarquées.",
    subjects: [
      {
        title: "Développement Android Natif - Kotlin & Jetpack Compose",
        volumeHoraire: 28,
        periode: "Mai / juin",
        avecMentor: false,
        contenu: `• Configurer Android Studio, les émulateurs Android et le signing des APK/AAB
• Maîtriser Kotlin : coroutines, Flows, sealed classes et extensions
• Construire des UIs avec Jetpack Compose et Material Design 3
• Implémenter une architecture MVVM avec Room, Hilt et Navigation
• Intégrer des fonctionnalités hardware (caméra CameraX, Bluetooth LE, capteurs)
• Tester et distribuer une application Android (JUnit, Espresso, Firebase Distribution)`,
        sortOrder: 1,
      },
      {
        title: "Flutter & Développement Multi-Plateforme",
        volumeHoraire: 28,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Maîtriser les fondamentaux de Dart : typage fort, null safety, async/await et isolates
• Développer une application Flutter complète avec navigation multi-niveaux
• Implémenter une gestion d'état avancée avec Riverpod ou BLoC
• Créer des animations fluides et des interfaces Material Design 3
• Écrire des tests unitaires, widget et d'intégration Flutter
• Déployer l'application sur Android (et iOS si accès disponible) via CI/CD`,
        sortOrder: 2,
      },
      {
        title: "Stratégie de Tests IoT",
        volumeHoraire: 14,
        periode: "Juin",
        avecMentor: false,
        contenu: `• Identifier les spécificités des tests IoT et adapter sa stratégie en conséquence
• Simuler capteurs et comportements réseau pour les tests hors matériel
• Écrire des tests unitaires pour la logique embarquée (MicroPython, C++ avec Unity)
• Mettre en place des tests d'intégration de la chaîne IoT complète
• Automatiser les tests dans un pipeline CI/CD adapté à l'IoT
• Tester la résilience (coupures réseau, firmware défaillant, données corrompues)`,
        sortOrder: 3,
      },
      {
        title: "React Native Avancé & Architecture Mobile",
        volumeHoraire: 21,
        periode: "Octobre / novembre",
        avecMentor: false,
        contenu: `• Architecturer une application React Native avec Clean Architecture : séparation Domain, Data et Presentation
• Comprendre et implémenter la navigation avancée (nested navigators, deep links, Auth flow)
• Maîtriser la gestion d'état experte (Zustand, Redux Toolkit ou Jotai)
• Optimiser les performances (memo, useCallback, FlatList, Flipper profiling)
• Écrire des tests unitaires et d'intégration sur une app React Native
• Configurer et utiliser EAS Build pour les releases`,
        sortOrder: 4,
      },
      {
        title: "Domain-Driven Design",
        volumeHoraire: 21,
        periode: "Septembre",
        avecMentor: false,
        contenu: `• Identifier les bounded contexts d'un projet
• Définir l'ubiquitous language avec le métier
• Modéliser les entités et value objects principaux
• Pratiquer l'event storming pour comprendre le domaine
• Créer un modèle de domaine simple pour démarrer le projet
• Comprendre les bases DDD sans aller dans la complexité`,
        sortOrder: 5,
      },
      {
        title: "Fil Rouge Mobile/IoT : Cadrage",
        volumeHoraire: 19,
        periode: "Novembre / juin",
        avecMentor: false,
        contenu: `• Cadrer un projet mobile ou IoT de A à Z
• Constituer et organiser le travail en équipe projet
• Produire les livrables de cadrage (brief, architecture, backlog)
• Soutenir le projet devant un jury`,
        sortOrder: 6,
      },
      {
        title: "Fondamentaux IoT & Protocoles de Communication",
        volumeHoraire: 35,
        periode: "Novembre / décembre",
        avecMentor: false,
        contenu: `• Concevoir une architecture IoT adaptée à un contexte donné en tenant compte des contraintes d'énergie, de latence et de bande passante
• Implémenter la communication MQTT avec broker Mosquitto (QoS, TLS, LWT)
• Programmer un ESP32 pour lire des capteurs et publier des données
• Sécuriser les communications IoT avec mTLS et authentification des devices
• Construire un pipeline de données complet IoT → Cloud → Dashboard
• Réaliser un audit de sécurité IoT basique (OWASP IoT Top 10)`,
        sortOrder: 7,
      },
      {
        title: "Veille Technologique & Sélection de Solutions",
        volumeHoraire: 14,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Mettre en place un système de veille technologique structuré et efficace
• Analyser les tendances technologiques et évaluer leur maturité (Hype Cycle)
• Réaliser des études comparatives rigoureuses de solutions techniques
• Évaluer les solutions en termes de sécurité, performance, coût et viabilité
• Analyser l'impact des choix technologiques sur dette technique et écoconception
• Présenter des recommandations techniques argumentées devant décideurs`,
        sortOrder: 8,
      },
      {
        title: "Sécurité Applicative - OWASP Top 10",
        volumeHoraire: 21,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Prévenir les vulnérabilités OWASP Top 10 (injection, XSS, CSRF, etc.)
• Implémenter une authentification sécurisée avec hashing adaptatif (bcrypt, Argon2)
• Configurer les headers HTTP de sécurité (CSP, HSTS, CORS)
• Valider et sanitizer toutes les entrées utilisateur de manière robuste
• Pratiquer le pentesting avec OWASP ZAP
• Modéliser les menaces avec STRIDE et créer des plans de mitigation`,
        sortOrder: 9,
      },
      {
        title: "Méthodologies Agile & Scrum",
        volumeHoraire: 21,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Animer des cérémonies Scrum (daily, planning, retro, review) de manière productive
• Estimer avec la méthode du poker planning et gérer la vélocité d'équipe
• Pratiquer Kanban avec des WIP limits et un flow management
• Conduire des retrospectives structurées avec des actions concrètes
• Collaborer efficacement avec le Product Owner sur la priorisation
• Mesurer et améliorer avec les métriques Agile (cycle time, lead time, throughput)`,
        sortOrder: 10,
      },
      {
        title: "Infrastructure as Code & Monitoring de Base",
        volumeHoraire: 14,
        periode: "Avril / mai",
        avecMentor: false,
        contenu: `• Écrire des configurations Terraform avec HCL pour provisionner l'infrastructure
• Créer des modules Terraform réutilisables et gérer le state avec remote backend
• Installer et configurer Prometheus pour collecter des métriques
• Créer des dashboards Grafana et configurer des alertes pertinentes
• Mettre en place des logs structurés pour faciliter le debug
• Instrumenter une application pour exposer des métriques custom`,
        sortOrder: 11,
      },
      {
        title: "Estimation & Chiffrage de Projets Complexes",
        volumeHoraire: 14,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Appliquer les techniques d'estimation adaptées au contexte
• Décomposer un projet en unités estimables (WBS, user stories)
• Identifier et intégrer les charges indirectes et coûts cachés
• Construire un budget projet détaillé incluant tous les postes
• Calculer le TCO (Total Cost of Ownership) sur 3-5 ans
• Présenter et défendre un chiffrage auprès de décideurs`,
        sortOrder: 12,
      },
      {
        title: "Docker & Kubernetes Fondamentaux",
        volumeHoraire: 21,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Créer des Dockerfiles multi-stage optimisés pour réduire la taille des images
• Gérer volumes et réseaux Docker pour des applications complexes
• Sécuriser les conteneurs (scanning, non-root users, secrets management)
• Déployer des applications sur Kubernetes avec Deployments et Services
• Configurer Ingress pour exposer les services via HTTPS
• Implémenter health checks et HPA pour la résilience et scalabilité`,
        sortOrder: 13,
      },
      {
        title: "Communication Projet & Reporting",
        volumeHoraire: 14,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Rédiger des comptes-rendus d'activités clairs et actionnables
• Préparer des présentations adaptées à différentes audiences
• Créer des dashboards de suivi projet visuels et pertinents
• Gérer la documentation projet et la traçabilité des décisions
• Adapter son discours technique selon l'audience
• Présenter efficacement les réalisations en sprint review`,
        sortOrder: 14,
      },
      {
        title: "CI/CD - Intégration & Déploiement Continu",
        volumeHoraire: 35,
        periode: "Novembre / janvier",
        avecMentor: false,
        contenu: `• Créer des pipelines CI multi-stages avec build, test, lint, security
• Mettre en place un pipeline CD vers dev/staging/production
• Implémenter blue-green deployment et canary releases pour zero-downtime
• Utiliser feature flags pour déploiement progressif et A/B testing
• Gérer les secrets de manière sécurisée (Vault, secrets managers)
• Intégrer SAST/SCA et gérer les environnements dynamiques par branche`,
        sortOrder: 15,
      },
      {
        title: "Analyse des Besoins & Faisabilité Technique",
        volumeHoraire: 28,
        periode: "Octobre / novembre",
        avecMentor: false,
        contenu: `• Cartographier les acteurs projet et définir leurs rôles (RACI/RASCI)
• Conduire des entretiens d'explicitation structurés
• Analyser l'environnement technique existant (SWOT)
• Identifier et quantifier les risques avec méthodologie structurée
• Proposer des stratégies de mitigation adaptées
• Rédiger un rapport de faisabilité avec recommandation Go/No-Go`,
        sortOrder: 16,
      },
    ],
  },
  {
    slug: "mastere-2-dev-mobile-iot",
    label: "Mastère 2 - Développement Mobile & IoT",
    level: "mastere",
    year: 2,
    specialization: "dev_mobile_iot",
    sortOrder: 9,
    title: "Mastère 2 - Expert Développement Logiciel Mobile et IoT",
    introduction:
      "La deuxième année approfondit le développement mobile natif, les web services et le développement cloud pour des applications embarquées de grande envergure.",
    subjects: [
      {
        title: "Développement mobile",
        volumeHoraire: 63,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `"Maîtriser les plateformes de développement mobile natives : Être capable de développer des applications pour Android avec Java/Kotlin et pour iOS avec Swift.
Développer des compétences en conception d'UI/UX mobile : Apprendre à créer des interfaces utilisateur attrayantes et réactives adaptées aux petites surfaces d'écran et aux interactions tactiles.
Comprendre le développement d'applications mobiles hybrides et cross-platform : Utiliser des frameworks tels que Flutter ou React Native pour créer des applications fonctionnant à la fois sur Android et iOS.
Gérer le cycle de vie d'une application mobile : Depuis la conception, en passant par le test, jusqu'au déploiement sur les stores et la maintenance.
Intégrer des fonctionnalités avancées : Comme la géolocalisation, l'accès à la caméra, et les notifications push.
Appliquer les meilleures pratiques de sécurité dans le développement mobile."`,
        sortOrder: 1,
      },
      {
        title: "Web services",
        volumeHoraire: 63,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `APIS REST :
> Découvrir les bonnes pratiques d’architecture et de design d’APIs ReSTful.
> Découvrir les menaces auxquelles s’exposent vos API.
> Découvrir les vulnérabilités les plus fréquentes.
> Repérer les points faibles d’une API.
> Corriger les vulnérabilités et développer de façon sécurisée.
SOAP/SOA - ARCHITECTURES ORIENTES SERVICES  :
> Intérioriser le "paradigme" SOA et prendre conscience de ses implications
> Être capable de trouver les "bons" services et de les documenter rigoureusement
> Appréhender la portée "système" et la nécessité de l'architecture logique
> Apprécier les conditions de succès des projets SOA et les exigences sur leur input`,
        sortOrder: 2,
      },
      {
        title: "Développer pour le cloud",
        volumeHoraire: 63,
        periode: "Semestre 2",
        avecMentor: false,
        contenu: `- Comprendre les principes fondamentaux du cloud et des architectures cloud-native, et identifier les solutions adaptées à différents besoins de développement. (C1.2.2, C1.3.2)
Concevoir des applications cloud en tirant parti des services comme la conteneurisation et les architectures serverless, tout en répondant aux exigences de scalabilité et de performance. (C1.5, C2.2.3)
Déployer et superviser des applications cloud sur des plateformes telles qu’AWS, GCP et Azure, en configurant les environnements et les outils nécessaires. (C2.1.1, C2.2.4)
Automatiser le déploiement des applications cloud à l’aide de pipelines d’intégration et de déploiement continu (CI/CD) pour garantir des mises à jour fluides et sans régression. (C2.1.2, C4.2.2)
Intégrer des outils de gestion de données cloud et de monitoring pour suivre la performance des applications et identifier les axes d’optimisation. (C4.1.2, C4.3.1)
Documenter les déploiements et les évolutions des applications pour assurer la traçabilité et faciliter la collaboration entre équipes. (C2.4.1, C4.3.2)`,
        sortOrder: 3,
      },
      {
        title: "Prog. cross-plateform (C)",
        volumeHoraire: 28,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `- Développer une maîtrise pratique de Flutter et React Native pour la création d'applications mobiles à la fois performantes et esthétiquement agréables, fonctionnant sur iOS et Android.
- Explorer en profondeur le développement d'applications cross-plateforme, en soulignant les avantages et les défis, tels que le partage de code, l'optimisation de la performance et l'intégration avec les fonctionnalités natives des plateformes.
- Acquérir la capacité d'intégrer des fonctionnalités avancées et d'utiliser les API natives dans les applications développées avec Flutter et React Native, incluant la géolocalisation et l'accès à la caméra.
- Appliquer les meilleures pratiques pour optimiser la performance et améliorer l'expérience utilisateur des applications cross-plateforme.
- Se familiariser avec les principes de conception UI/UX pour créer des interfaces utilisateur réactives et adaptatives qui offrent une expérience utilisateur cohérente sur divers appareils et tailles d'écran.`,
        sortOrder: 4,
      },
    ],
  },
  {
    slug: "mastere-1-integration-ia-dev",
    label: "Mastère 1 - Intégration IA & Développement",
    level: "mastere",
    year: 1,
    specialization: "integration_ia_dev",
    sortOrder: 10,
    title: "Mastère 1 - Expert en Intégration d'IA et Développement Logiciel",
    introduction:
      "Ce programme unique forme des développeurs capables d'intégrer les technologies d'intelligence artificielle (LLMs, deep learning) dans des applications logicielles robustes et scalables.",
    subjects: [
      {
        title: "Domain-Driven Design",
        volumeHoraire: 21,
        periode: "Septembre",
        avecMentor: false,
        contenu: `• Identifier les bounded contexts d'un projet
• Définir l'ubiquitous language avec le métier
• Modéliser les entités et value objects principaux
• Pratiquer l'event storming pour comprendre le domaine
• Créer un modèle de domaine simple pour démarrer le projet
• Comprendre les bases DDD sans aller dans la complexité`,
        sortOrder: 1,
      },
      {
        title: "Veille Technologique & Sélection de Solutions",
        volumeHoraire: 14,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Mettre en place un système de veille technologique structuré et efficace
• Analyser les tendances technologiques et évaluer leur maturité (Hype Cycle)
• Réaliser des études comparatives rigoureuses de solutions techniques
• Évaluer les solutions en termes de sécurité, performance, coût et viabilité
• Analyser l'impact des choix technologiques sur dette technique et écoconception
• Présenter des recommandations techniques argumentées devant décideurs`,
        sortOrder: 2,
      },
      {
        title: "Transformers & LLM",
        volumeHoraire: 19,
        periode: "Mars / mai",
        avecMentor: false,
        contenu: `•  Comprendre l'architecture transformer : encoder, decoder, self-attention, multi-head attention
•  Maîtriser le concept de positional encoding et son rôle dans le traitement des séquences
•  Expliquer la tokenisation, la taille de vocabulaire et l'impact du context window sur les usages
•  Distinguer les grandes familles de LLMs
•  Comparer GPT, Claude, Llama, Mistral et Gemini selon leurs caractéristiques techniques et leurs licences
•  Construire et appliquer une matrice de choix coût / qualité / latence / confidentialité sur des cas d'usage réels
•  Identifier les comportements émergents des LLMs et leurs implications pour le développement`,
        sortOrder: 3,
      },
      {
        title: "IA Multimodale : Vision, Audio & Génération",
        volumeHoraire: 21,
        periode: "Mai / juillet",
        avecMentor: false,
        contenu: `• Extraire structurellement les données d'un lot de factures scannées avec GPT-4o Vision avec > 95 % de précision
• Construire un pipeline de transcription automatique de réunions avec Whisper API traduit en 5 langues
• Générer des variantes de visuels marketing cohérentes avec une charte graphique via DALL-E 3 ou Stable Diffusion
• Implémenter un système de modération de contenus générés (texte + image)
• Construire un agent multimodal capable de traiter inputs texte, image et audio dans une même conversation
• Évaluer la qualité des sorties multimodales et gérer les cas limites (images floues, audio bruité)`,
        sortOrder: 4,
      },
      {
        title: "Fondamentaux du machine learning",
        volumeHoraire: 28,
        periode: "Novembre / décembre",
        avecMentor: false,
        contenu: `•  Identifier et traiter les problèmes courants d'un dataset : valeurs manquantes, types de variables…
•  Appliquer les stratégies d'imputation adaptées (mean, median, forward fill, backward fill)
•  Encoder des variables catégorielles selon le contexte (label encoding, one-hot, ordinal)
•  Sélectionner les features pertinentes via corrélation, feature importance et variance threshold
•  Distinguer les trois paradigmes d'apprentissage et choisir l'approche adaptée au problème
•  Entraîner et configurer les modèles scikit-learn principaux : régression, classification, clustering
•  Construire un split train/test/validation rigoureux et appliquer la cross-validation
•  Choisir et interpréter les métriques d'évaluation adaptées
•  Détecter et corriger un overfitting ou underfitting sur un modèle entraîné
•  Produire un pipeline ML complet et reproductible avec scikit-learn
•  Traduire des résultats en recommandation`,
        sortOrder: 5,
      },
      {
        title: "Développement Assisté par IA",
        volumeHoraire: 21,
        periode: "Mai / juin",
        avecMentor: false,
        contenu: `• Configurer des règles de projet (.cursorrules) pour guider Cursor IDE sur un projet Python/FastAPI en contexte d'équipe
• Implémenter une fonctionnalité complète de 200+ lignes via vibe coding en moins de 30 minutes
• Générer une suite de tests unitaires complète pour du code legacy avec couverture > 80 %
• Détecter et corriger les hallucinations de code (bugs silencieux, mauvaises APIs, sécurité)
• Maintenir la qualité du code généré (revues, linting, tests)
• Définir les règles d'utilisation de l'IA pour une équipe (ce qui est autorisé, ce qui ne l'est pas)`,
        sortOrder: 6,
      },
      {
        title: "Deep Learning Fondamental",
        volumeHoraire: 14,
        periode: "Janvier / mars",
        avecMentor: false,
        contenu: `•  Comprendre le fonctionnement d'un réseau de neurones
•  Maîtriser le principe de la backpropagation et du gradient descent
•  Distinguer les architectures CNN et RNN/LSTM, leurs cas d'usage et leurs limitations
•  Prendre en main PyTorch pour charger, entraîner et évaluer un modèle
•  Réaliser un fine-tuning d'un modèle pré-entraîné sur un dataset métier
•  Lire et interpréter des courbes d'entraînement, détecter overfitting et underfitting
•  Comprendre le rôle du transfer learning comme fondation de tout le DL moderne`,
        sortOrder: 7,
      },
      {
        title: "Consommation d'API IA & Prompt avancé",
        volumeHoraire: 21,
        periode: "Janvier",
        avecMentor: false,
        contenu: `• Implémenter le function calling / tool use pour connecter un LLM à une base de données réelle en production
• Rédiger des system prompts robustes résistant aux injections de prompts (validation testée)
• Implémenter le streaming SSE pour un affichage temps-réel dans une API FastAPI
• Comparer les APIs OpenAI, Anthropic et Google sur latence, coût et qualité pour un cas d'usage donné
• Gérer le context window : résumé automatique, RAG-based context, sliding window
• Construire un prompt engineering framework réutilisable pour votre équipe`,
        sortOrder: 8,
      },
      {
        title: "Bases de Données Vectorielles & Embeddings",
        volumeHoraire: 21,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Générer, stocker et requêter 10 000 embeddings dans Pinecone ou Qdrant en moins de 5 minutes de setup
• Configurer une recherche hybride (BM25 + dense avec RRF) et mesurer le gain de précision vs dense seul
• Implémenter le filtrage par métadonnées pour un cas multi-tenant (isolation par client)
• Choisir entre Pinecone, Qdrant, Weaviate et pgvector selon les contraintes (coût, latence, infra)
• Construire un pipeline RAG basique end-to-end (ingestion + retrieval + génération)
• Mesurer la qualité du retrieval (recall@k, MRR) et identifier les faiblesses`,
        sortOrder: 9,
      },
      {
        title: "Sécurité Applicative - OWASP Top 10",
        volumeHoraire: 21,
        periode: "Mars / mai",
        avecMentor: false,
        contenu: `• Prévenir les vulnérabilités OWASP Top 10 (injection, XSS, CSRF, etc.)
• Implémenter une authentification sécurisée avec hashing adaptatif (bcrypt, Argon2)
• Configurer les headers HTTP de sécurité (CSP, HSTS, CORS)
• Valider et sanitizer toutes les entrées utilisateur de manière robuste
• Pratiquer le pentesting avec OWASP ZAP
• Modéliser les menaces avec STRIDE et créer des plans de mitigation`,
        sortOrder: 10,
      },
      {
        title: "Méthodologies Agile & Scrum",
        volumeHoraire: 21,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Animer des cérémonies Scrum (daily, planning, retro, review) de manière productive
• Estimer avec la méthode du poker planning et gérer la vélocité d'équipe
• Pratiquer Kanban avec des WIP limits et un flow management
• Conduire des retrospectives structurées avec des actions concrètes
• Collaborer efficacement avec le Product Owner sur la priorisation
• Mesurer et améliorer avec les métriques Agile (cycle time, lead time, throughput)`,
        sortOrder: 11,
      },
      {
        title: "Infrastructure as Code & Monitoring de Base",
        volumeHoraire: 14,
        periode: "Avril / mai",
        avecMentor: false,
        contenu: `• Écrire des configurations Terraform avec HCL pour provisionner l'infrastructure
• Créer des modules Terraform réutilisables et gérer le state avec remote backend
• Installer et configurer Prometheus pour collecter des métriques
• Créer des dashboards Grafana et configurer des alertes pertinentes
• Mettre en place des logs structurés pour faciliter le debug
• Instrumenter une application pour exposer des métriques custom`,
        sortOrder: 12,
      },
      {
        title: "Estimation & Chiffrage de Projets Complexes",
        volumeHoraire: 14,
        periode: "Mai",
        avecMentor: false,
        contenu: `• Appliquer les techniques d'estimation adaptées au contexte
• Décomposer un projet en unités estimables (WBS, user stories)
• Identifier et intégrer les charges indirectes et coûts cachés
• Construire un budget projet détaillé incluant tous les postes
• Calculer le TCO (Total Cost of Ownership) sur 3-5 ans
• Présenter et défendre un chiffrage auprès de décideurs`,
        sortOrder: 13,
      },
      {
        title: "Docker & Kubernetes Fondamentaux",
        volumeHoraire: 21,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Créer des Dockerfiles multi-stage optimisés pour réduire la taille des images
• Gérer volumes et réseaux Docker pour des applications complexes
• Sécuriser les conteneurs (scanning, non-root users, secrets management)
• Déployer des applications sur Kubernetes avec Deployments et Services
• Configurer Ingress pour exposer les services via HTTPS
• Implémenter health checks et HPA pour la résilience et scalabilité`,
        sortOrder: 14,
      },
      {
        title: "Communication Projet & Reporting",
        volumeHoraire: 14,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Rédiger des comptes-rendus d'activités clairs et actionnables
• Préparer des présentations adaptées à différentes audiences
• Créer des dashboards de suivi projet visuels et pertinents
• Gérer la documentation projet et la traçabilité des décisions
• Adapter son discours technique selon l'audience
• Présenter efficacement les réalisations en sprint review`,
        sortOrder: 15,
      },
      {
        title: "CI/CD - Intégration & Déploiement Continu",
        volumeHoraire: 35,
        periode: "Novembre / janvier",
        avecMentor: false,
        contenu: `• Créer des pipelines CI multi-stages avec build, test, lint, security
• Mettre en place un pipeline CD vers dev/staging/production
• Implémenter blue-green deployment et canary releases pour zero-downtime
• Utiliser feature flags pour déploiement progressif et A/B testing
• Gérer les secrets de manière sécurisée (Vault, secrets managers)
• Intégrer SAST/SCA et gérer les environnements dynamiques par branche`,
        sortOrder: 16,
      },
      {
        title: "Analyse des Besoins & Faisabilité Technique",
        volumeHoraire: 28,
        periode: "Octobre / novembre",
        avecMentor: false,
        contenu: `• Cartographier les acteurs projet et définir leurs rôles (RACI/RASCI)
• Conduire des entretiens d'explicitation structurés
• Analyser l'environnement technique existant (SWOT)
• Identifier et quantifier les risques avec méthodologie structurée
• Proposer des stratégies de mitigation adaptées
• Rédiger un rapport de faisabilité avec recommandation Go/No-Go`,
        sortOrder: 17,
      },
    ],
  },
  {
    slug: "mastere-1-expert-ia",
    label: "Mastère 1 - Expert IA",
    level: "mastere",
    year: 1,
    specialization: "expert_ia",
    sortOrder: 11,
    title: "Mastère 1 - Expert en Intelligence Artificielle",
    introduction:
      "Ce programme avancé couvre les fondements théoriques et pratiques de l'IA moderne, du machine learning au deep learning, en passant par le NLP et la visualisation data.",
    subjects: [
      {
        title: "Traitement du langage naturel",
        volumeHoraire: 21,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Comprendre et implémenter les pipelines NLP : tokenization, embeddings, attention mechanism
• Utiliser HuggingFace Tokenizers pour créer et personnaliser des tokenizers performants
• Fine-tuner des modèles BERT/RoBERTa pour la classification de texte et l'extraction d'entités (NER)
• Exploiter les embeddings (Sentence-Transformers) pour la recherche sémantique et le clustering`,
        sortOrder: 1,
      },
      {
        title: "Programmation python pour l'IA",
        volumeHoraire: 21,
        periode: "Octobre / novembre",
        avecMentor: false,
        contenu: `• Appliquer les principes SOLID et les pratiques Clean Code (Black, Ruff, MyPy) aux projets ML
• Maîtriser le versioning industriel avec Git et Git LFS pour les artefacts volumineux
• Concevoir des architectures modulaires avec packaging Python (pyproject.toml, Poetry)
• Implémenter des tests unitaires et d'intégration (Pytest) pour garantir la fiabilité du code ML`,
        sortOrder: 2,
      },
      {
        title:
          "ML : Apprentissage supervisé, non supervisé et par renforcement",
        volumeHoraire: 54,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Construire des pipelines Scikit-learn complets : preprocessing, feature engineering, model selection, validation croisée, GridSearchCV
• Implémenter et comparer les algorithmes supervisés clés (régression, SVM, arbres, KNN) sur des problèmes réels
• Maîtriser les méthodes d'ensemble : Random Forest, XGBoost, LightGBM, Stacking 
• Appliquer l'apprentissage non supervisé : K-Means, DBSCAN, PCA, t-SNE, UMAP, isolation forest
• Comprendre et implémenter le Q-learning tabulaire, le Deep Q-Network (DQN) et les Policy Gradient (PPO)
• Entraîner et évaluer des agents RL
• Choisir le paradigme ML adapté à un problème donné et justifier ses choix en situation professionnelle`,
        sortOrder: 3,
      },
      {
        title: "Mathématiques pour le ML et le DL",
        volumeHoraire: 21,
        periode: "Novembre / décembre",
        avecMentor: false,
        contenu: `•  Calculer des gradients multivariés, des jacobiennes et des hessiennes pour formaliser mathématiquement la backpropagation au-delà de l'implémentation vue en "Fondamentaux du Deep Learning"
• Appliquer les décompositions matricielles avancées (SVD, décomposition en valeurs propres) aux cas concrets de l'IA : réduction de dimension, compression d'embeddings, analyse en composantes principales
•  Résoudre des problèmes d'optimisation convexe et non convexe : conditions de convergence, points selle, rôle de la régularisation (L1/L2),  formaliser ce que les optimiseurs (SGD, Adam) font "sous le capot"
•  Maîtriser la théorie de l'information appliquée au ML : entropy, cross-entropy, divergence KL, comprendre mathématiquement pourquoi on utilise telle loss function plutôt qu'une autre`,
        sortOrder: 4,
      },
      {
        title: "Fondamentaux du deep learning",
        volumeHoraire: 28,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Dériver analytiquement la rétropropagation sur un réseau à 2 couches et l'implémenter from scratch en NumPy (dérivation en chaîne → gradients de chaque paramètre)
• Identifier et traiter les problèmes de vanishing/exploding gradients : initialisation de Xavier/He, gradient clipping
• Construire des MLP et CNN avec PyTorch : forward pass, fonctions de perte (MSE, cross-entropy), backward, optimizer.step()
• Comprendre et comparer les optimiseurs adaptatifs (SGD momentum, RMSprop, Adam, AdamW) et leur comportement sur des surfaces de perte réelles
• Appliquer BatchNorm, LayerNorm, Dropout et data augmentation pour stabiliser et régulariser l'entraînement
• Diagnostiquer un entraînement instable via TensorBoard : interpréter les courbes loss/accuracy, détecter overfitting/underfitting, ajuster le learning rate scheduling`,
        sortOrder: 5,
      },
      {
        title: "Visualisation et communication data",
        volumeHoraire: 21,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Appliquer les principes du design de visualisation (clarté, minimalisme, Tufte)
• Créer des dashboards interactifs avec Plotly, Dash et Gradio
• Raconter des histoires avec les données (data storytelling)
• Préparer des présentations impactantes pour executives (executive summaries)
• Créer des démos interactives sur HuggingFace Spaces`,
        sortOrder: 6,
      },
      {
        title: "Veille technologique et éthique de la Data",
        volumeHoraire: 14,
        periode: "Mai / juillet",
        avecMentor: false,
        contenu: `• Mettre en place une stratégie de veille technologique (blogs tech, newsletters, conférences)
• Évaluer les nouveaux outils et frameworks pour l'entreprise (ROI, maturité, communauté)
• Identifier et atténuer les biais dans les données et les pipelines
• Comprendre le cadre RGPD et ses implications pour l'ingénierie des données
• Mesurer l'impact carbone des infrastructures data (GreenCloud, CodeCarbon)`,
        sortOrder: 7,
      },
      {
        title: "Statistiques, inférence et causalité",
        volumeHoraire: 21,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Analyser les besoins métier et définir les métriques de succès alignées sur les objectifs business
• Réaliser des analyses d'inférence statistique : tests d'hypothèses (Student, Chi2, ANOVA), intervalles de confiance
• Implémenter des graphes causaux (DAGs) avec DoWhy ou CausalML pour l'analyse de scénarios
• Calculer la taille d'échantillon nécessaire et interpréter correctement les p-values et erreurs de type I/II
• Modéliser des distributions complexes et détecter les outliers`,
        sortOrder: 8,
      },
      {
        title: "Pilotage budgétaire et coordination d'équipe",
        volumeHoraire: 14,
        periode: "Avril / juin",
        avecMentor: false,
        contenu: `• Chiffrer les budgets cloud et infrastructure data (AWS vs GCP vs Azure vs stack Spark/Lakehouse)
• Allouer les ressources entre projets concurrents
• Coordonner une équipe pluridisciplinaire (Data Engineers, Data Analysts, Métiers)
• Produire des reportings et KPIs projet pour le management`,
        sortOrder: 9,
      },
      {
        title: "Modélisation et stockage des données",
        volumeHoraire: 14,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Modéliser un schéma dimensionnel pour BI et ML (Star Schema, Snowflake Schema)
• Choisir entre approches relationnelle, NoSQL et lakehouse selon les use cases
• Optimiser les index, partitions et compression pour accélérer les requêtes analytiques`,
        sortOrder: 10,
      },
      {
        title: "Méthodologies agiles pour projets data",
        volumeHoraire: 21,
        periode: "Avril / mai",
        avecMentor: false,
        contenu: `• Organiser un projet data en sprints avec user stories adaptées à l'ingénierie de données
• Estimer la complexité des tâches data (exploration, modélisation, validation, déploiement)
• Gérer les risques techniques : données manquantes, pipelines instables, dérive de périmètre
• Planifier les livrables data avec milestones réalistes
• Communiquer l'avancement aux stakeholders avec des métriques adaptées`,
        sortOrder: 11,
      },
      {
        title: "Ingénierie des données et pipelines SQL",
        volumeHoraire: 21,
        periode: "Décembre / janvier",
        avecMentor: false,
        contenu: `• Écrire des requêtes SQL avancées : window functions, CTEs, optimisation avec EXPLAIN, jointures complexes
• Configurer des pipelines d'ingestion asynchrones (AIOHTTP, asyncio) pour la collecte à grande échelle
• Sélectionner et appliquer les technologies de transformation adaptées au volume (Pandas, HF Datasets, Spark)
• Développer des processus ETL robustes avec gestion d'erreurs, logging et tests de validation
• Utiliser HuggingFace Datasets pour charger, transformer et streamer des datasets volumineux (>10GB)
• Automatiser le versioning et la documentation des datasets (Dataset Cards) sur le Hub`,
        sortOrder: 12,
      },
      {
        title: "Documentation et accompagnement utilisateurs",
        volumeHoraire: 14,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Documenter l'API et l'intégration technique
• Créer des guides utilisateur avec workflows
• Expliquer les limitations et les risques du système
• Rédiger la documentation technique et former les utilisateurs aux outils développés`,
        sortOrder: 13,
      },
      {
        title: "Collecte et ingestion de données",
        volumeHoraire: 28,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Concevoir une architecture d'ingestion scalable avec Apache Kafka et Airflow
• Implémenter des connecteurs personnalisés pour APIs REST, bases relationnelles et cloud storage
• Orchestrer des workflows complexes avec gestion des dépendances et retry automatique
• Monitorer la santé des pipelines avec alerting et logging centralisé
• Gérer les transformations précoces (early transformation) pour optimiser la qualité en amont`,
        sortOrder: 14,
      },
      {
        title: "Assurance qualité et résolution d'incidents",
        volumeHoraire: 14,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Élaborer des scénarios de tests pour pipelines data (volumétrie, fraîcheur, cohérence, unicité)
• Diagnostiquer et résoudre les incidents techniques en production
• Documenter les procédures de résolution (runbooks, post-mortems)
• Mettre en place des alertes et seuils de qualité`,
        sortOrder: 15,
      },
      {
        title: "Analyse de besoins et cadrage métier",
        volumeHoraire: 21,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Conduire des ateliers de cadrage avec métiers et executives
• Identifier les données disponibles et les lacunes
• Définir des objectifs SMART et des KPIs mesurables
• Évaluer la faisabilité technique et les risques
• Rédiger un cahier des charges avec use cases prioritisés`,
        sortOrder: 16,
      },
    ],
  },
  {
    slug: "mastere-2-expert-ia",
    label: "Mastère 2 - Expert IA",
    level: "mastere",
    year: 2,
    specialization: "expert_ia",
    sortOrder: 12,
    title: "Mastère 2 - Expert en Intelligence Artificielle",
    introduction:
      "La deuxième année explore les frontières de l'IA : deep learning avancé, NLP, LLMs, MLOps et industrialisation de l'IA dans le cloud.",
    subjects: [
      {
        title: "Deep Learning",
        volumeHoraire: 63,
        periode: "Semestre 2",
        avecMentor: false,
        contenu: `- Comprendre et appliquer les bases mathématiques nécessaires au deep learning (algèbre linéaire, probabilités, statistiques) dans des contextes de data science. (C2.1.2, C5.1.2)
- Concevoir, entraîner et optimiser des modèles de réseaux de neurones (CNN, RNN, LSTM) à l’aide de bibliothèques comme TensorFlow et PyTorch. (C5.2.3, C5.2.4)
- Exploiter des techniques avancées comme le transfert learning, les autoencodeurs et les mécanismes d’attention pour répondre à des problématiques spécifiques. (C5.1.3, C5.2.4)
- Appliquer des techniques de réduction de dimension (PCA) et des approches classiques aux séries temporelles (ARIMA, SARIMA). (C2.1.4, C5.2.2)
- Manipuler des matrices avancées avec Numpy et explorer des jeux de données complexes pour en extraire des insights pertinents. (C5.2.1, C2.1.3)
- Utiliser des méthodes traditionnelles de traitement d’images, comme les filtres morphologiques, avant d’intégrer des approches basées sur les réseaux de neurones. (C5.2.3)-  Intégrer les modèles dans des environnements de production en respectant les bonnes pratiques de sérialisation, containerisation et versioning. (C5.3.1)
- Analyser les besoins clients et définir les axes d’analyse pour proposer des solutions adaptées. (C2.1.1, C2.1.2)`,
        sortOrder: 1,
      },
      {
        title: "Indus de l'IA dans le cloud",
        volumeHoraire: 63,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `- Mettre en œuvre les méthodes de MLOps pour automatiser le cycle de vie des projets d'IA, en utilisant des bibliothèques telles que MLflow pour assurer le tracking et la gestion des modèles. 
- Comprendre et appliquer les concepts d'API pour intégrer les modèles de machine learning avec diverses applications cloud.
- Élaborer des stratégies de serving de modèles d'IA, en utilisant des solutions avancées pour garantir la disponibilité et la scalabilité des modèles en production.
- Optimiser les modèles d'apprentissage automatique pour la production via des techniques comme la quantization, assurant une performance optimale sur le cloud.
- Maîtriser le déploiement de modèles d'IA dans le cloud, en exploitant les infrastructures modernes et en choisissant les ressources adaptées, y compris la sélection de machines GPU pour répondre aux besoins spécifiques d'apprentissage.
- Comprendre l'utilisation et la manipulation de Docker pour containeriser les applications d'IA, assurant ainsi une portabilité et un déploiement cohérent sur différentes plateformes.
- Assurer la collecte et l'actualisation automatisées des données via des pipelines DATA temps réel, garantissant la fraîcheur et la fiabilité des données utilisées par les modèles d'IA.
- Concevoir une architecture de données robuste et sécurisée en tenant compte des aspects multiples comme le chiffrement, la gestion des accès et le respect des normes légales (ex: RGPD).
- Planifier les ressources et estimer le budget nécessaire pour projeter efficacement des solutions d'IA dans le cloud, avec un contrôle rigoureux des délais et des coûts.
- Rédiger une documentation détaillée et accessible pour garantir une transmission claire des procédures d'implémentation et de maintenance des solutions IA dans le cloud.`,
        sortOrder: 2,
      },
      {
        title: "Data visualisation M2",
        volumeHoraire: 28,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `- Analyser les besoins métier pour cadrer les objectifs de visualisation des données. (C2.1.1)
- Définir les axes d’analyse et les métriques à représenter visuellement en fonction des données disponibles et pertinentes. (C2.1.2)
- Réaliser des visualisations à l’aide d’outils de pointe comme Power BI, Tableau, et des bibliothèques Python dédiées. (C2.1.3, C5.1.3)
- Appliquer des modèles de représentation adaptés (histogrammes, heatmaps, nuages de points, graphiques interactifs) pour clarifier les analyses. (C2.2.1)
- Structurer et présenter des recommandations stratégiques basées sur les visualisations produites, en préparant des arguments clairs et un discours percutant. (C2.2.2)
- Concevoir et documenter des systèmes de visualisation interactifs, adaptés au public cible et garantissant une traçabilité complète. (C2.3.2)
- Planifier et suivre un projet de visualisation en définissant les indicateurs clés, les outils, et les jalons du projet. (C3.1.1, C3.2.2)
- Sélectionner les composants techniques pour concevoir une infrastructure de visualisation robuste et dimensionnée aux besoins du projet. (C4.1.2)`,
        sortOrder: 3,
      },
      {
        title: "MLOps",
        volumeHoraire: 28,
        periode: "Semestre 2",
        avecMentor: false,
        contenu: `- Concevoir des pipelines de données temps réel ou asynchrones pour automatiser la transformation et la transmission des données. (C4.2.2, C1.1.3)
- Mettre en place des architectures sécurisées pour garantir l’intégrité, la confidentialité et la disponibilité des données et des modèles. (C1.4.1, C1.4.2)
- Automatiser l’intégration et le déploiement des modèles Machine Learning en utilisant des outils CI/CD. (C4.2.3, C5.3.2)
- Superviser les systèmes d’apprentissage automatique en définissant des indicateurs pertinents et en utilisant des outils de monitoring pour détecter les dérives et garantir la performance des modèles. (C4.3.1, C5.3.3)
- Élaborer et mettre en œuvre des scénarios de tests pour détecter les anomalies et éviter les régressions en production. (C4.4.1)
- Résoudre les incidents techniques en investiguant la source des problèmes pour maintenir la disponibilité du service. (C4.4.2)
- Déployer des environnements robustes pour le stockage et le traitement des données en intégrant des technologies SQL, NoSQL et Big Data. (C1.2.1, C1.2.2, C4.1.1)
- Automatiser les tâches du cycle de vie des modèles avec des pipelines et des outils adaptés pour garantir leur mise à jour et leur efficacité. (C5.3.4)`,
        sortOrder: 4,
      },
      {
        title: "Natural Language processing",
        volumeHoraire: 63,
        periode: "Semestre 2",
        avecMentor: false,
        contenu: `Ce cours explore les concepts fondamentaux et avancés du traitement automatique du langage naturel (NLP). Les étudiants apprendront l’histoire et l’évolution des approches NLP, des premières méthodes de vectorisation (TF-IDF, One-Hot Encoding) aux techniques modernes comme les embeddings (Word2Vec, GloVe). Le programme inclut des architectures avancées telles que les RNN, LSTM bidirectionnels, et Seq2Seq, tout en introduisant les principes des modèles transformateurs (BERT, GPT) et des LLM (Large Language Models). Des outils comme SpaCy et HuggingFace seront utilisés pour les tâches de prétraitement, d’entraînement, et de déploiement de modèles. Une introduction au concept de Retrieval-Augmented Generation (RAG) permettra aux étudiants de relier NLP et gestion d’information pour des applications pratiques. Le cours inclut des exercices sur Python et des environnements comme TensorFlow et PyTorch.`,
        sortOrder: 5,
      },
      {
        title: "Large Language Model",
        volumeHoraire: 28,
        periode: "Semestre 2",
        avecMentor: false,
        contenu: `Ce cours approfondit les principes et applications des Large Language Models (LLM) tels que GPT et BERT, en mettant l’accent sur leur fonctionnement, leur entraînement, et leur optimisation. Les étudiants apprendront les concepts de pré-entraînement et de fine-tuning, les méthodes d’encodage textuel, ainsi que l’intégration des LLM dans des projets NLP concrets. À travers des cas pratiques, ils découvriront comment adapter ces modèles à des problématiques spécifiques, tout en explorant leur impact dans des domaines variés. L'approche pédagogique intègre la construction, le déploiement, et la supervision des modèles, permettant aux participants de développer des compétences techniques et stratégiques solides.`,
        sortOrder: 6,
      },
    ],
  },
  {
    slug: "mastere-1-data-engineer",
    label: "Mastère 1 - Data Engineering",
    level: "mastere",
    year: 1,
    specialization: "data_engineer",
    sortOrder: 13,
    title: "Mastère 1 - Expert Data Engineering",
    introduction:
      "Ce programme forme des Data Engineers capables de concevoir, construire et maintenir des architectures de données robustes et scalables pour des besoins analytiques et opérationnels.",
    subjects: [
      {
        title: "Visualisation et communication data",
        volumeHoraire: 21,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Appliquer les principes du design de visualisation (clarté, minimalisme, Tufte)
• Créer des dashboards interactifs avec Plotly, Dash et Gradio
• Raconter des histoires avec les données (data storytelling)
• Préparer des présentations impactantes pour executives (executive summaries)
• Créer des démos interactives sur HuggingFace Spaces`,
        sortOrder: 1,
      },
      {
        title: "Veille technologique et éthique de la Data",
        volumeHoraire: 14,
        periode: "Mai / juillet",
        avecMentor: false,
        contenu: `• Mettre en place une stratégie de veille technologique (blogs tech, newsletters, conférences)
• Évaluer les nouveaux outils et frameworks pour l'entreprise (ROI, maturité, communauté)
• Identifier et atténuer les biais dans les données et les pipelines
• Comprendre le cadre RGPD et ses implications pour l'ingénierie des données
• Mesurer l'impact carbone des infrastructures data (GreenCloud, CodeCarbon)`,
        sortOrder: 2,
      },
      {
        title: "Statistiques, inférence et causalité",
        volumeHoraire: 21,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Analyser les besoins métier et définir les métriques de succès alignées sur les objectifs business
• Réaliser des analyses d'inférence statistique : tests d'hypothèses (Student, Chi2, ANOVA), intervalles de confiance
• Implémenter des graphes causaux (DAGs) avec DoWhy ou CausalML pour l'analyse de scénarios
• Calculer la taille d'échantillon nécessaire et interpréter correctement les p-values et erreurs de type I/II
• Modéliser des distributions complexes et détecter les outliers`,
        sortOrder: 3,
      },
      {
        title: "Spark et traitement distribué",
        volumeHoraire: 33,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Développer des applications PySpark performantes : RDDs, DataFrames, Spark SQL, UDFs optimisées
• Comprendre les mécanismes internes de Spark : lazy evaluation, transformations vs actions, plan d'exécution DAG
• Optimiser les performances : partitionnement, broadcast joins, cache/persist, réduction des shuffles coûteux
• Déboguer des jobs Spark avec le Spark UI : identifier les bottlenecks, stages lents, data skew
• Déployer des clusters Spark sur EMR, Dataproc ou Databricks Community Edition
• Intégrer Spark dans des pipelines Airflow/Dagster avec SparkSubmitOperator`,
        sortOrder: 4,
      },
      {
        title: "Pipelines de données et Orchestration",
        volumeHoraire: 35,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Concevoir et implémenter des DAGs complexes avec par exemple Apache Airflow : scheduling, retry logic, SLAs, dépendances entre tâches
• Orchestrer des workflows modernes avec par exemple Dagster : assets, software-defined data, test isolation, observabilité intégrée
• Implémenter des tests de qualité des données avec Great Expectations et Soda Core : profilage, SLAs, détection d'anomalies
• Configurer le monitoring des pipelines avec par exemple Prometheus, Grafana et alerting (Slack, PagerDuty)
• Construire des pipelines ELT scalables avec dbt et orchestrer les dépendances entre modèles
• Gérer les données en retard (late data), les backfills et les re-runs historiques sans duplication`,
        sortOrder: 5,
      },
      {
        title: "Pilotage budgétaire et coordination d'équipe",
        volumeHoraire: 14,
        periode: "Avril / juin",
        avecMentor: false,
        contenu: `• Chiffrer les budgets cloud et infrastructure data (AWS vs GCP vs Azure vs stack Spark/Lakehouse)
• Allouer les ressources entre projets concurrents
• Coordonner une équipe pluridisciplinaire (Data Engineers, Data Analysts, Métiers)
• Produire des reportings et KPIs projet pour le management`,
        sortOrder: 6,
      },
      {
        title: "Modélisation et stockage des données",
        volumeHoraire: 14,
        periode: "Novembre",
        avecMentor: false,
        contenu: `• Modéliser un schéma dimensionnel pour BI et ML (Star Schema, Snowflake Schema)
• Choisir entre approches relationnelle, NoSQL et lakehouse selon les use cases
• Optimiser les index, partitions et compression pour accélérer les requêtes analytiques`,
        sortOrder: 7,
      },
      {
        title: "Méthodologies agiles pour projets data",
        volumeHoraire: 21,
        periode: "Avril / mai",
        avecMentor: false,
        contenu: `• Organiser un projet data en sprints avec user stories adaptées à l'ingénierie de données
• Estimer la complexité des tâches data (exploration, modélisation, validation, déploiement)
• Gérer les risques techniques : données manquantes, pipelines instables, dérive de périmètre
• Planifier les livrables data avec milestones réalistes
• Communiquer l'avancement aux stakeholders avec des métriques adaptées`,
        sortOrder: 8,
      },
      {
        title: "Ingénierie des données et pipelines SQL",
        volumeHoraire: 21,
        periode: "Décembre / janvier",
        avecMentor: false,
        contenu: `• Écrire des requêtes SQL avancées : window functions, CTEs, optimisation avec EXPLAIN, jointures complexes
• Configurer des pipelines d'ingestion asynchrones (AIOHTTP, asyncio) pour la collecte à grande échelle
• Sélectionner et appliquer les technologies de transformation adaptées au volume (Pandas, HF Datasets, Spark)
• Développer des processus ETL robustes avec gestion d'erreurs, logging et tests de validation
• Utiliser HuggingFace Datasets pour charger, transformer et streamer des datasets volumineux (>10GB)
• Automatiser le versioning et la documentation des datasets (Dataset Cards) sur le Hub`,
        sortOrder: 9,
      },
      {
        title: "Documentation et accompagnement utilisateurs",
        volumeHoraire: 14,
        periode: "Mars / avril",
        avecMentor: false,
        contenu: `• Documenter l'API et l'intégration technique
• Créer des guides utilisateur avec workflows
• Expliquer les limitations et les risques du système
• Rédiger la documentation technique et former les utilisateurs aux outils développés`,
        sortOrder: 10,
      },
      {
        title: "DevOps et CI/CD pour la Data",
        volumeHoraire: 28,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Mettre en place un pipeline CI/CD complet pour les projets data avec GitHub Actions : lint, test, build, deploy, rollback
• Versionner l'infrastructure avec Terraform (IaC) : provisioning Airflow, Spark, databases, VPC en code
• Conteneuriser des workloads data avec Docker et orchestrer avec Kubernetes (K8s) et Helm
• Automatiser les migrations de schéma et les déploiements dbt avec des tests de régression
• Gérer les secrets et configurations (HashiCorp Vault, AWS Secrets Manager) dans les pipelines data
• Implémenter des stratégies de déploiement blue-green et canary pour les pipelines en production`,
        sortOrder: 11,
      },
      {
        title: "Data Warehouse et Modélisation Analytique",
        volumeHoraire: 28,
        periode: "Novembre / décembre",
        avecMentor: false,
        contenu: `• Concevoir et implémenter un data warehouse avec schémas dimensionnels (Star Schema, Snowflake Schema) selon les principes de Kimball
• Appliquer les techniques de modélisation pour différents use cases analytiques : reporting, self-service BI, feature store ML
• Implémenter les Slowly Changing Dimensions (SCD Type 1, 2, 3) pour la gestion de l'historique
• Utiliser dbt (Data Build Tool) pour la transformation, les tests et la documentation du data warehouse
• Optimiser les performances des requêtes analytiques : partitionnement, clustering, materialized views
• Connecter le data warehouse aux outils de visualisation (Metabase, Tableau, Power BI)`,
        sortOrder: 12,
      },
      {
        title: "Collecte et ingestion de données",
        volumeHoraire: 28,
        periode: "Janvier / février",
        avecMentor: false,
        contenu: `• Concevoir une architecture d'ingestion scalable avec Apache Kafka et Airflow
• Implémenter des connecteurs personnalisés pour APIs REST, bases relationnelles et cloud storage
• Orchestrer des workflows complexes avec gestion des dépendances et retry automatique
• Monitorer la santé des pipelines avec alerting et logging centralisé
• Gérer les transformations précoces (early transformation) pour optimiser la qualité en amont`,
        sortOrder: 13,
      },
      {
        title: "Assurance qualité et résolution d'incidents",
        volumeHoraire: 14,
        periode: "Février / mars",
        avecMentor: false,
        contenu: `• Élaborer des scénarios de tests pour pipelines data (volumétrie, fraîcheur, cohérence, unicité)
• Diagnostiquer et résoudre les incidents techniques en production
• Documenter les procédures de résolution (runbooks, post-mortems)
• Mettre en place des alertes et seuils de qualité`,
        sortOrder: 14,
      },
      {
        title: "Architecture de l'infrastructure Data",
        volumeHoraire: 21,
        periode: "Octobre / novembre",
        avecMentor: false,
        contenu: `• Analyser et comparer les architectures de traitement de données (Lambda, Kappa, Lakehouse, Data Mesh) selon les critères de coût, performance et scalabilité
• Identifier les besoins en termes de scalabilité, disponibilité et tolérance aux pannes pour dimensionner une infrastructure DATA
• Évaluer les critères de choix entre technologies de traitement batch et streaming (Spark vs Flink vs Kafka Streams)
• Concevoir des architectures haute disponibilité avec réplication, sharding et load balancing
• Produire un document d'architecture technique (ADR) justifiant les choix technologiques`,
        sortOrder: 15,
      },
      {
        title: "Analyse de besoins et cadrage métier",
        volumeHoraire: 21,
        periode: "Octobre",
        avecMentor: false,
        contenu: `• Conduire des ateliers de cadrage avec métiers et executives
• Identifier les données disponibles et les lacunes
• Définir des objectifs SMART et des KPIs mesurables
• Évaluer la faisabilité technique et les risques
• Rédiger un cahier des charges avec use cases prioritisés`,
        sortOrder: 16,
      },
    ],
  },
  {
    slug: "mastere-1-systemes-embarques",
    label: "Mastère 1 - Systèmes Embarqués",
    level: "mastere",
    year: 1,
    specialization: "systemes_embarques",
    sortOrder: 14,
    title: "Mastère 1 - Expert Systèmes Embarqués et Objets Connectés",
    introduction:
      "Ce programme forme des experts en programmation embarquée, systèmes temps réel et architecture firmware, pour des applications dans l'industrie et l'IoT.",
    subjects: [
      {
        title: "Ingénierie des exigences & analyse des risques",
        volumeHoraire: 28,
        periode: "Année",
        avecMentor: false,
        contenu: `• Cartographier les parties prenantes et leurs attentes
• Conduire un entretien d'explicitation structuré avec un client
• Rédiger des exigences SMART avec critères d'acceptation testables
• Construire une matrice de traçabilité exigences → tests avec un outil dédié
• Identifier et qualifier les risques techniques (probabilité, impact, criticité)
• Proposer des stratégies de mitigation documentées et priorisées
• Produire un dossier de spécifications conforme à un standard d'ingénierie des exigences`,
        sortOrder: 1,
      },
      {
        title: "Veille technologique & positionnement",
        volumeHoraire: 14,
        periode: "Année",
        avecMentor: false,
        contenu: `• Mettre en place un système de veille technologique structuré et pérenne
• Surveiller les évolutions normatives et réglementaires (directives européennes, normes sectorielles)
• Analyser la maturité d'une technologie via un modèle d'adoption de type Hype Cycle
• Étudier les produits concurrents et identifier les lacunes du marché
• Rédiger une note de positionnement argumentée sur une solution technique
• Présenter les opportunités d'innovation devant des décideurs`,
        sortOrder: 2,
      },
      {
        title: "Modélisation système",
        volumeHoraire: 21,
        periode: "Année",
        avecMentor: false,
        contenu: `• Réaliser un Block Definition Diagram et un Internal Block Diagram
• Modéliser les interactions dynamiques via diagrammes de séquence
• Utiliser une plateforme MBSE type Capella pour une décomposition fonctionnelle
• Vérifier la cohérence d'un modèle système multi-vues
• Produire un dossier d'architecture système exploitable
• Tracer les exigences vers les éléments du modèle`,
        sortOrder: 3,
      },
      {
        title: "Architecture SE & choix technologiques",
        volumeHoraire: 21,
        periode: "Année",
        avecMentor: false,
        contenu: `• Comparer les langages embarqués selon contraintes matérielles et normes
• Justifier un choix de plateforme microcontrôleur/SoC dans un dossier technique
• Lire et exploiter un datasheet fabricant complet (pinout, timing, puissance)
• Dimensionner une alimentation et vérifier la compatibilité des composants
• Tester la faisabilité des concepts clés sur un prototype simplifié
• Produire un dossier de choix techniques argumenté`,
        sortOrder: 4,
      },
      {
        title: "Méthodologie, planification & suivi de projet SE",
        volumeHoraire: 28,
        periode: "Année",
        avecMentor: false,
        contenu: `• Choisir une méthodologie de gestion de projet adaptée au contexte SE
• Découper un projet en phases, tâches et lots livrables
• Construire un planning hybride V-cycle + sprints avec jalons
• Estimer la charge via WBS et techniques adaptées (PERT, Planning Poker)
• Mettre en place un tableau de bord de suivi avec KPIs opérationnels
• Piloter la production de la documentation projet multi-contributeurs`,
        sortOrder: 5,
      },
      {
        title: "Animation d'équipe & leadership projet",
        volumeHoraire: 14,
        periode: "Année",
        avecMentor: false,
        contenu: `• Constituer une équipe projet équilibrée (compétences, complémentarité)
• Prendre en compte l'inclusion (handicap, diversité) dans la constitution
• Animer les rituels agiles (daily standup, rétrospective, revue)
• Donner du feedback structuré avec une méthode type COIN
• Résoudre les conflits techniques en gardant le cap projet
• Coordonner une équipe transverse avec fournisseurs et parties prenantes
• Maintenir l'engagement des membres sur la durée du projet`,
        sortOrder: 6,
      },
      {
        title: "Fondamentaux : C embarqué, maths & physique",
        volumeHoraire: 35,
        periode: "Année",
        avecMentor: false,
        contenu: `• Manipuler pointeurs et allocation dynamique sans fuites mémoire
• Écrire et debugger un handler d'interruption avec un outil de debug type GDB
• Implémenter une machine à états finis en C structuré
• Dimensionner un filtre RC et un diviseur de tension
• Calculer une matrice de rotation pour positionnement capteur
• Lire et exploiter un datasheet complet (pinout, timing, courant, puissance)
• Valider les acquis par des ateliers de remédiation hands-on`,
        sortOrder: 7,
      },
      {
        title: "Développement STM32 avancé",
        volumeHoraire: 28,
        periode: "Année",
        avecMentor: false,
        contenu: `• Configurer les canaux DMA pour transferts périphérique-mémoire à haut débit
• Implémenter les modes low-power (sleep, stop, standby) et mesurer la conso
• Développer un bootloader custom avec vérification d'intégrité CRC
• Architecturer un firmware modulaire avec HAL et drivers séparés
• Gérer la configuration système via une table de paramètres en Flash
• Produire un firmware professionnel documenté et livrable`,
        sortOrder: 8,
      },
      {
        title: "Achitecture firmware multi-tâches",
        volumeHoraire: 21,
        periode: "Année",
        avecMentor: false,
        contenu: `• Concevoir une architecture firmware multi-tâches professionnelle
• Implémenter mutex, sémaphores et queues sans deadlock ni priority inversion
• Gérer la mémoire embarquée avec pool allocator (no-malloc policy)
• Configurer un watchdog matériel et logiciel hiérarchique
• Mesurer et garantir les deadlines temps réel avec analyseur logique
• Documenter et maintenir l'architecture firmware sur la durée`,
        sortOrder: 9,
      },
      {
        title: "Conception matérielle",
        volumeHoraire: 42,
        periode: "Année",
        avecMentor: false,
        contenu: `• Écrire un module HDL synthétisable (compteur, FSM, acquisition PWM)
• Synthétiser et implémenter un design FPGA avec une suite fabricant
• Interfacer le FPGA avec un processeur ARM via un bus standard (type AXI)
• Concevoir un schématique MCU complet avec un logiciel de CAO électronique
• Appliquer les règles de routage signal intégrité (impédance, découplage)
• Générer des fichiers Gerber prêts pour fabrication industrielle
• Réaliser une revue de conception PCB en équipe`,
        sortOrder: 10,
      },
      {
        title: "Linux embarqué",
        volumeHoraire: 35,
        periode: "Année",
        avecMentor: false,
        contenu: `• Construire une image Linux embarqué minimale avec un outil type Buildroot
• Comprendre et modifier un device tree pour ajouter un périphérique
• Écrire un module kernel simple (character device) avec API standard
• Debugger un boot Linux complet (bootloader, kernel, init, services)
• Utiliser les outils de cross-compilation (SDK, toolchain)
• Lire et comprendre un BSP fournisseur existant`,
        sortOrder: 11,
      },
      {
        title: "Qualité code, tests & gestion d'anomalies",
        volumeHoraire: 28,
        periode: "Année",
        avecMentor: false,
        contenu: `• Appliquer les règles d'un standard de codage embarqué sûr type MISRA-C
• Configurer et interpréter un outil d'analyse statique
• Écrire des tests unitaires embarqués avec un framework adapté
• Mesurer la complexité cyclomatique et la couverture de test
• Définir une stratégie de tests multi-niveaux (unitaires, intégration)
• Gérer un cycle complet de correction d'anomalie avec traçabilité`,
        sortOrder: 12,
      },
      {
        title: "CI/CD & gestion des versions",
        volumeHoraire: 14,
        periode: "Année",
        avecMentor: false,
        contenu: `• Configurer un pipeline CI cross-compilation ARM avec un orchestrateur CI/CD
• Automatiser le build et les tests unitaires embarqués
• Automatiser le flash sur cible via un outil de programmation
• Gérer les versions avec un workflow Git et semantic versioning
• Tagger et releaser une version firmware traçable
• Mettre en place un environnement HIL basique pour tests automatisés`,
        sortOrder: 13,
      },
    ],
  },
  {
    slug: "mastere-2-systemes-embarques",
    label: "Mastère 2 - Systèmes Embarqués",
    level: "mastere",
    year: 2,
    specialization: "systemes_embarques",
    sortOrder: 15,
    title: "Mastère 2 - Expert Systèmes Embarqués et Objets Connectés",
    introduction:
      "La deuxième année s'oriente vers les systèmes critiques, l'IA embarquée, la physique mécanique et la certification de systèmes embarqués industriels.",
    subjects: [
      {
        title: "Science de l'ingénieur",
        volumeHoraire: 63,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `- Analyser les exigences fonctionnelles et non fonctionnelles d’un projet d’ingénierie pour établir un cahier des charges structuré. (B1.A1.C1, B1.A1.C4)

- Effectuer une veille technologique et réglementaire afin de garantir la conformité et l’innovation des solutions proposées. (B1.A1.C2, B1.A1.C3)

- Évaluer et gérer les risques techniques et économiques d’un projet pour anticiper d’éventuelles vulnérabilités. (B1.A1.C4, B2.A1.C5)

- Mettre en place des stratégies d’optimisation et d’amélioration continue des systèmes. (B4.A4.C1, B4.A4.C3)

- Assurer la gestion des versions et la traçabilité des modifications techniques dans un projet d’ingénierie. (B4.A4.C2, B4.A4.C3)`,
        sortOrder: 1,
      },
      {
        title: "IA Embarquée",
        volumeHoraire: 63,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `Analyser les exigences fonctionnelles et non fonctionnelles des systèmes embarqués intégrant de l’IA. (B1.A1.C1, B1.A2.C1)

Concevoir des modèles d’IA adaptés aux contraintes des systèmes embarqués, en optimisant leur efficacité et leur consommation énergétique. (B1.A2.C2, B3.A1.C1)

Sélectionner et implémenter des architectures logicielles et matérielles compatibles avec l’IA embarquée. (B3.A2.C1, B3.A2.C2)

Tester, valider et intégrer les algorithmes d’IA sur des plateformes embarquées. (B3.A4.C2, B4.A1.C1)

- Assurer la maintenance, la mise à jour et la traçabilité des systèmes embarqués intégrant de l’IA. (B4.A4.C1, B4.A4.C3)`,
        sortOrder: 2,
      },
      {
        title: "C Avancé",
        volumeHoraire: 63,
        periode: "Semestre 2",
        avecMentor: false,
        contenu: `Analyser les exigences fonctionnelles et non fonctionnelles d’un projet de développement en C avancé. (B1.A1.C1, B1.A2.C1)

Concevoir des architectures logicielles performantes en optimisant le code et la gestion mémoire. (B1.A2.C2, B3.A1.C1)

Implémenter des algorithmes optimisés et gérer les ressources systèmes avec des techniques avancées de programmation en C. (B3.A3.C1, B3.A3.C2)

Tester et valider les programmes développés en respectant les normes de qualité et de sécurité. (B4.A1.C1, B4.A1.C2)

Assurer la maintenance, l’optimisation et la gestion des versions du code. (B4.A4.C1, B4.A4.C3)`,
        sortOrder: 3,
      },
      {
        title: "Physique mécanique",
        volumeHoraire: 28,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `Ce cours vise à fournir aux étudiants une compréhension approfondie des principes de la mécanique appliqués aux systèmes embarqués. Ils apprendront à modéliser et simuler des phénomènes physiques en utilisant des outils numériques tels que MATLAB et Simulink pour rechercher des solutions optimisées (B1.A2.C1).

Ils seront en mesure de définir les architectures mécaniques et dynamiques de systèmes embarqués en tenant compte des contraintes physiques et fonctionnelles, et en structurant leur conception autour de modules optimisés (B3.A1.C1). Ils apprendront également à sélectionner les composants mécaniques et électroniques en fonction des exigences du projet, des performances attendues et des normes industrielles (B3.A2.C1).

Grâce à des environnements de simulation, ils testeront et valideront les interactions entre les forces mécaniques et le logiciel de pilotage, en identifiant les anomalies et en optimisant le comportement du système avant intégration (B3.A4.C1). Ils mettront ensuite en œuvre des processus d’intégration complets pour garantir l’interopérabilité du matériel et des logiciels (B3.A4.C2).

Enfin, ils établiront des stratégies de test et de validation en définissant des plans détaillés, en s’assurant du respect des normes et en développant des mises à jour pour améliorer continuellement les performances des systèmes embarqués (B4.A1.C1, B4.A3.C1, B4.A4.C3).`,
        sortOrder: 4,
      },
      {
        title: "Prise de parole en public n*2",
        volumeHoraire: 28,
        periode: "Semestre 2",
        avecMentor: false,
        contenu: `- Gérer son stress et son émotion face à l’auditoire en utilisant des techniques de relaxation et de concentration. (B2.A3.C2, B2.A3.C1)

- Améliorer sa posture et son langage corporel pour renforcer l’impact de son message. (B2.A3.C2, B2.A3.C1)

- Structurer un discours de manière claire et fluide en utilisant des outils de planification comme les cartes mentales et les schémas. (B2.A1.C2, B2.A2.C1)

- S’adapter aux différents types d’auditoires et ajuster son discours en fonction des attentes et des réactions du public. (B3.A1.C1, B2.A3.C1)

- Utiliser des techniques de persuasion et d’influence pour captiver l’attention et faire passer des messages complexes de manière convaincante. (B2.A3.C1, B2.A2.C1)

- Gérer les questions et les interventions en direct lors d’une présentation pour maintenir l’attention et éviter les distractions. (B2.A3.C2, B2.A1.C2)

- Analyser et améliorer ses prestations à travers des retours constructifs et des rétrospectives sur ses propres interventions. (B2.A3.C3, B2.A1.C2)`,
        sortOrder: 5,
      },
      {
        title: "Analyse numérique",
        volumeHoraire: 28,
        periode: "Semestre 1",
        avecMentor: false,
        contenu: `- Vérifier l'efficacité, la fiabilité et la conformité d'une architecture en réalisant des modélisations et des prototypes afin de valider la conception avant son implémentation détaillée (B3.A1.C2). 
- Ils seront en mesure de développer des drivers et bibliothèques, en isolant les fonctionnalités et en optimisant leur intégration dans un système embarqué (B3.A3.C2).

- Grâce à des tests en environnement de simulation, ils identifieront les anomalies et appliqueront des améliorations de manière itérative afin de valider les interactions entre le logiciel et le matériel avant la phase d’intégration réelle (B3.A4.C1).
- Maitriser les processus de recettage en conditions réelles, en définissant et exécutant un protocole de validation garantissant la conformité aux exigences fonctionnelles et non fonctionnelles du client (B4.A3.C2).`,
        sortOrder: 6,
      },
    ],
  },
];

async function seedSurvey() {
  const count = await prisma.surveyCategory.count();
  if (count > 0) {
    console.log("Survey data already seeded, skipping.");
    return;
  }

  console.log("Seeding survey categories and subjects...");
  for (const cat of categorySeedData) {
    await prisma.surveyCategory.create({
      data: {
        slug: cat.slug,
        label: cat.label,
        level: cat.level,
        year: cat.year,
        specialization: cat.specialization ?? null,
        sortOrder: cat.sortOrder,
        title: cat.title,
        introduction: cat.introduction,
        subjects: {
          create: cat.subjects.map((s) => ({
            title: s.title,
            volumeHoraire: s.volumeHoraire,
            periode: s.periode,
            avecMentor: s.avecMentor,
            contenu: s.contenu,
            sortOrder: s.sortOrder,
          })),
        },
      },
    });
  }
  console.log("Survey data seeded successfully.");
}

async function seedDefaultUser() {
  const email = "admin@yboard.fr";
  const existing = await prisma.users.findFirst({ where: { email } });
  if (existing) {
    console.log("Default user already exists, skipping.");
    return;
  }
  const password = await bcrypt.hash("admin123", 10);
  await prisma.users.create({
    data: {
      firstname: "Admin",
      lastname: "YBoard",
      email,
      password,
    },
  });
  console.log(`Default user created: ${email} / admin123`);
}

async function main() {
  await seedDefaultUser();
  await seedSurvey();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
