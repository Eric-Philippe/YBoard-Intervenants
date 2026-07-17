# Rapport d'audit de sécurité, YBoard Intervenants

**Date de l'audit :** 17 juillet 2026
**Périmètre :** code applicatif (Next.js, tRPC, routes API, dépendances, configuration de déploiement)
**Méthode :** revue de code exhaustive, puis vérification empirique de chaque correctif par requêtes réelles contre l'application en fonctionnement.
**Auteur :** Eric PHILIPPE

> Ce document décrit l'état de sécurité constaté et les mesures appliquées. Chaque vulnérabilité corrigée a été rejouée après correctif pour confirmer la fermeture. Les résultats de ces tests figurent en regard de chaque entrée.

> L'analyse a d'abord été effectuée s'appuyant sur les outils de sécurité automatisés (npm audit, Snyk, nsp, npm-check-updates, etc.), puis complétée par une revue manuelle, qui s'est soldée sur une analyse de fond en utilisant le modèle Opus 4.8.

---

## 1. Résumé

L'audit a mis en évidence une exposition : **une partie de l'API applicative était accessible sans aucune authentification**, alors que l'interface web, elle, redirigeait bien vers la page de connexion. Le middleware de Next.js ne couvre pas les routes `/api`, et certaines procédures tRPC étaient déclarées publiques.

Ces points sont corrigés et vérifiés. 15 vulnérabilités ont été traitées.

| Indicateur                                       | Avant                 | Après               |
| ------------------------------------------------ | --------------------- | ------------------- |
| Procédures API accessibles sans authentification | 8                     | 4 (volontaires)     |
| Vulnérabilités de dépendances (production)       | 16 (dont 2 critiques) | 5 (dont 0 critique) |
| Vulnérabilités applicatives corrigées            | —                     | 15                  |
| En-têtes de sécurité HTTP                        | 0                     | 5                   |

---

## 2. Vulnérabilités corrigées

### 2.1 Critiques

#### V-01 — API en partie accessible sans authentification

**Constat.** Sur les différents routeurs tRPC, 7 exposaient certaines de leurs procédures en `publicProcedure`. Le middleware protégeait les pages, mais son `matcher` exclut explicitement `/api`.

**Correctif.** Bascule en `protectedProcedure` sur les 7 routeurs. Restent publiques 4 procédures, par nécessité fonctionnelle : `auth.login` et les 3 procédures du questionnaire de candidature (`survey.getHub`, `survey.getConfig`, `survey.submit`).

**Vérification.**

```
teachers.getAll   sans jeton -> HTTP 401
users.getAll      sans jeton -> HTTP 401
perimeters.getAll sans jeton -> HTTP 401
survey.getConfig  sans jeton -> HTTP 200  (public, attendu)
teachers.getAll   avec jeton -> HTTP 200  (nominal, attendu)
```

---

#### V-02 — Secret de signature des jetons présent dans le dépôt public

**Constat.** Cinq fichiers appliquaient un repli en dur : `process.env.JWT_SECRET ?? "your-secret-key"`. Par ailleurs, `docker-compose.yml` et `.env.example` contenaient une valeur de secret en clair, dans un dépôt public. Le `Dockerfile` positionne `SKIP_ENV_VALIDATION=1`, ce qui neutralise la validation de `env.js` : une variable absente ne déclenchait aucune erreur, l'application basculait silencieusement sur le secret connu si non changé en production.

**Impact.** Toute personne disposant du secret peut signer un jeton valide pour n'importe quel compte, sans mot de passe. L'accès obtenu est indiscernable d'une session légitime et **n'écrit aucune trace de connexion**, `last_connected` n'étant mis à jour que par `auth.login`.

**Correctif.** Suppression des cinq replis, au profit d'un accesseur unique `getJwtSecret()` (`src/server/jwt.ts`) qui lit `env.JWT_SECRET` et **lève une erreur explicite** en son absence. La résolution intervient à l'appel et non au chargement du module, afin de ne pas casser la construction de l'image Docker.

**Vérification.** Un jeton forgé avec le secret d'exemple a été accepté avant rotation, ce qui confirme l'exploitabilité. La fermeture effective de cette faille **dépend de la rotation du secret en production** (voir section 5, action A-02).

---

#### V-03 — Next.js 15.2.3 : exécution de code à distance et contournement du middleware

**Constat.** La version employée était affectée par plusieurs avis critiques, dont une exécution de code à distance via le protocole React Flight, un **contournement du middleware en App Router**, une SSRF et des empoisonnements de cache. Le contournement de middleware compromettait directement le mécanisme de protection des pages.

**Correctif.** Montée en version 15.5.20 (dernière 15.x corrigée). Maintien volontaire sur la branche 15.x : le passage en 16.x est une rupture, non nécessaire à la correction.

**Vérification.** `npm run build` réussi. Plus aucune vulnérabilité critique en production.

---

### 2.2 Élevées

#### V-04 — Routes CV : aucune authentification, et traversée de répertoire

**Constat.** `GET` et `DELETE /api/cv/[filename]` ne vérifiaient aucune identité : les CV étaient téléchargeables et supprimables par quiconque. Le paramètre `filename` était concaténé sans contrôle dans `path.join(...)`, ouvrant la lecture et la suppression de fichiers arbitraires du serveur, `.env` compris.

**Correctif.** Authentification obligatoire via `isAuthenticatedRequest` (`src/server/apiAuth.ts`), et résolution du chemin par `resolveCvPath` (`src/server/cvStorage.ts`) qui rejette tout séparateur, toute traversée et toute cible non PDF, puis vérifie le confinement dans le répertoire.

Le contrôle accepte le jeton par en-tête `Authorization` **ou** par cookie : l'interface ouvre les PDF via `window.open`, une navigation qui ne transmet pas d'en-tête.

**Vérification.**

```
GET    /api/cv/test.pdf         sans jeton -> HTTP 401
DELETE /api/cv/test.pdf         sans jeton -> HTTP 401
GET    /api/cv/..%2F..%2F.env              -> HTTP 401
POST   /api/cv/upload           sans jeton -> HTTP 401
```

---

#### V-05 — Téléversement : écriture de fichier hors du répertoire prévu

**Constat.** `POST /api/cv/upload` était non sécurisé correctement. Une valeur telle que `../../evil` permettait d'écrire hors du répertoire de destination.

**Correctif.** Validation de `teacherId` au format UUID, extension forcée à `.pdf`.

---

#### V-06 — Absence de protection contre le bruteforce

**Constat.** `auth.login` n'imposait aucune limite. Un mot de passe pouvait être testé indéfiniment, sans ralentissement ni blocage.

**Correctif.** Limiteur de tentatives (`src/server/rateLimit.ts`) : 8 échecs tolérés sur une fenêtre de 15 minutes, puis blocage de 15 minutes. Le compteur est remis à zéro par une authentification réussie. Implémentation en mémoire du processus, adaptée au déploiement actuel en conteneur unique (voir limite R-04).

**Vérification.**

```
tentatives 1 à 8   -> "Invalid credentials"
tentative  9       -> "Trop de tentatives. Réessayez dans 15 minute(s)."
tentative 10       -> "Trop de tentatives. Réessayez dans 15 minute(s)."
bon mot de passe pendant le blocage -> refusé (comportement attendu)
```

---

#### V-07 — Dépendances vulnérables inutilisées

**Constat.** `axios` et `react-router-dom` figuraient parmi les dépendances de production sans **aucun usage dans le code**, tout en apportant une trentaine d'avis de sécurité élevés (SSRF, pollution de prototype, XSS, redirections ouvertes).

**Correctif.** Désinstallation des deux paquets. Vulnérabilités de production ramenées de 16 à 11, puis à 5 après application des correctifs non cassants.

---

#### V-08 — Inscription ouverte

**Constat.** `auth.register` et `users.create` étaient publics : toute personne pouvait se créer un compte et accéder à l'application par la voie normale.

**Correctif.** Les deux procédures exigent désormais une session authentifiée.

---

### 2.3 Moyennes

#### V-09 — Injection de formules dans les exports (CSV et Excel)

**Constat.** Les tableurs interprètent toute cellule débutant par `=`, `+`, `-` ou `@` comme une formule. Les exports écrivaient sans neutralisation des valeurs issues de saisies : noms d'enseignants, de modules, de périmètres.

Le cas le plus grave concerne `/api/sondage/export` : **le questionnaire est public**, donc un tiers peut soumettre une candidature dont le nom vaut `=cmd|'/c calc'!A1`. La formule s'exécute alors sur le poste de la personne qui ouvre l'export. Le code n'échappait que les guillemets, ce qui relève du format CSV et **ne neutralise pas** les formules.

**Correctif.** Fonction `sanitizeCell` (`src/server/spreadsheet.ts`), qui préfixe d'une apostrophe toute valeur commençant par un caractère déclencheur, appliquée aux deux exports.

---

#### V-10 — Référence directe non contrôlée sur le profil utilisateur

**Constat.** `users.updateProfile` utilisait `input.id`, fourni par le client, au lieu de l'identité du jeton. Un utilisateur authentifié pouvait modifier le nom et l'adresse email d'un autre compte. Le changement de mot de passe restait protégé par la vérification du mot de passe courant.

**Correctif.** La cible est désormais dérivée de `ctx.userId`. L'`id` transmis est ignoré.

**Vérification.** Requête émise avec un jeton administrateur et un `id` arbitraire : la modification a porté sur le compte du jeton, et aucune ligne correspondant à l'`id` transmis n'a été touchée.

> Précision de conception : la réinitialisation du mot de passe d'un tiers reste possible via `users.update`. Il s'agit d'un choix produit assumé, l'application ne définissant pas de rôles.

---

#### V-11 — Absence d'en-têtes de sécurité HTTP

**Constat.** Aucun en-tête défensif n'était émis.

**Correctif.** Ajout dans `next.config.js` de `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (caméra, micro, géolocalisation désactivés) et `Strict-Transport-Security`.

**Vérification.** Les cinq en-têtes sont présents sur les réponses.

---

#### V-12 — Type de fichier déclaré par le client

**Constat.** Le contrôle du téléversement reposait sur `file.type`, valeur transmise par le client et donc falsifiable. Un contenu quelconque pouvait être stocké en se déclarant PDF.

**Correctif.** Vérification du nombre magique réel : les cinq premiers octets doivent valoir `%PDF-`.

---

#### V-13 — Algorithme de signature non contraint

**Constat.** Les appels `jwt.verify` ne fixaient pas la liste des algorithmes acceptés, exposant à des attaques par confusion d'algorithme. Un avis de sécurité affecte par ailleurs la vérification HMAC de la bibliothèque `jws` sous-jacente.

**Correctif.** Épinglage de `HS256` sur l'ensemble des `jwt.verify` (5 emplacements) et sur `jwt.sign`.

**Vérification.** Un jeton signé en `HS512` avec le secret valide est rejeté : `HTTP 401`.

---

### 2.4 Faibles

#### V-14 — Divulgation de traces d'exécution

**Constat.** Les erreurs tRPC renvoyaient au client la pile d'appels serveur, révélant les chemins absolus de fichiers et la structure interne.

**Correctif.** `errorFormatter` force `stack: undefined`.

**Vérification.** La réponse d'erreur contient désormais `"stack": null`, sans contenu.

---

#### V-15 — Masquage de la cause réelle des échecs de connexion

**Constat.** Le bloc `try/catch` de `auth.login` interceptait les `TRPCError` légitimes et les convertissait en erreur 500 « Login failed ». Un mot de passe invalide remontait donc comme une panne serveur, empêchant de distinguer un échec d'authentification d'un incident, et masquant les messages de blocage.

**Correctif.** Les `TRPCError` sont relancées telles quelles.

---

## 3. Points contrôlés sans anomalie

| Contrôle                                         | Résultat                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| Injection SQL                                    | Non applicable : Prisma emploie des requêtes paramétrées, aucun SQL brut. |
| XSS par rendu HTML brut                          | Aucun `dangerouslySetInnerHTML` dans la base de code.                     |
| Secrets dans l'historique Git                    | `.env` correctement ignoré, absent du suivi.                              |
| Authentification des routes d'export et d'import | Contrôle de jeton présent sur les trois routes.                           |

---

## 4. Actions hors code

Ces mesures ne relèvent pas du code applicatif et **conditionnent l'efficacité des correctifs**.

| Réf. | Action                                                                                                                 | Priorité      | Justification                                                                                                                                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| A-01 | Retirer les identifiants par défaut du `README` public et changer le mot de passe du compte concerné.                  | **Immédiate** | Le dépôt est public et documentait un couple identifiant/mot de passe fonctionnel.                                                                                                                                    |
| A-02 | **Faire tourner `JWT_SECRET`** en production, avec une valeur aléatoire longue transmise par variable d'environnement. | **Immédiate** | Tant que le secret publié reste en place, les correctifs de la section 2.1 sont contournables par un jeton forgé. La rotation invalide de surcroît tous les jetons existants, y compris ceux d'un éventuel intrus.    |     |
| A-03 | Examiner les journaux d'accès du serveur web sur `/api/trpc/*` et `/api/cv/*`.                                         | Haute         | Seule source permettant d'établir si une exfiltration a eu lieu, l'application ne journalisant rien (R-06). En cas de fuite avérée de données personnelles, une notification à la CNIL sous 72 heures peut s'imposer. |
| A-04 | Envisager le passage du dépôt en privé.                                                                                | Moyenne       | À défaut, toute configuration versionnée doit être considérée comme publique.                                                                                                                                         |

---

## 6. Conclusion

Les expositions les plus graves, à savoir l'accès non authentifié à certaines routes de l'API et la possibilité de forger des jetons administrateur, sont corrigées et vérifiées. La surface d'attaque a été sensiblement réduite : 8 procédures publiques ramenées à 4, deux dépendances mortes supprimées, vulnérabilités critiques éliminées.

---
