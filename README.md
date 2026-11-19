# Streams DL — interface web

Interface Next.js en français pour rechercher des films et séries, extraire leurs liens UQload et actualiser les informations d’une vidéo.

## Prérequis

- Node.js 20.19 ou plus récent
- npm
- Le backend FastAPI Streams DL démarré localement

## Installation

```bash
npm install
cp .env.example .env.local
```

Dans `.env.local`, adaptez `BACKEND_URL` si le backend écoute ailleurs. La valeur par défaut est `http://127.0.0.1:8000`. Le délai proxy est de 120 secondes via `BACKEND_TIMEOUT_MS`. Cette URL est lue côté serveur et n’est jamais exposée au navigateur.

## Lancement

Démarrez le backend avec un seul worker et sans rechargement automatique :

```bash
uvicorn api:app --host 127.0.0.1 --port 8000 --workers 1
```

Le backend peut aussi être lancé avec `python api.py` ; dans ce cas, vérifiez son port (8095 d’après le contrat) et définissez `BACKEND_URL=http://127.0.0.1:8095`.

Dans un autre terminal :

```bash
npm run dev
```

Puis ouvrez l’adresse indiquée par Next.js. Pour une version de production : `npm run build`, puis `npm run start`.

## Commandes

| Commande               | Usage                           |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Développement local             |
| `npm run build`        | Build de production             |
| `npm run start`        | Démarrage de production         |
| `npm run lint`         | ESLint                          |
| `npm run typecheck`    | Vérification TypeScript stricte |
| `npm test`             | Tests unitaires Vitest          |
| `npm run format:check` | Vérification Prettier           |

## Architecture

- `app/api/*` : six route handlers Next.js avec allowlist stricte. Ils valident les entrées puis relaient les requêtes au backend.
- `lib/server/backend.ts` : accès serveur uniquement, délai configurable, réponse JSON sûre et traduction des erreurs réseau en 502/504.
- `lib/api/schemas.ts` : schémas Zod tolérants pour les réponses tierces ; `lib/api/client.ts` normalise chaque appel en `ApiResult`.
- `lib/validators.ts` : validation des recherches, fournisseurs, URL HTTP(S) et identifiants de tâche.
- `lib/hooks/` : état asynchrone et polling des tâches avec pause en arrière-plan.
- `components/` : composants d’interface, sélection des fournisseurs, résultats et résolution des tâches.
- `app/page.tsx` : recherche pilotée par `q` et `provider` dans l’URL ; `/media` affiche les liens et `/about` les informations déclarées par le backend.

Le navigateur n’appelle jamais `BACKEND_URL` directement. Le proxy same-origin évite le problème CORS et ne fournit aucune route proxy générique.

## Hypothèses

- `size_in_bytes` est interprété comme un nombre d’octets uniquement lorsqu’il s’agit d’un nombre fini et non négatif ; les autres valeurs sont affichées telles quelles.
- `duration` est interprété comme un nombre de secondes uniquement lorsqu’il s’agit d’un nombre fini et non négatif ; les chaînes sont affichées telles quelles.
- Les champs vidéo absents sont traités comme `null`. Les champs tiers supplémentaires sont tolérés et ignorés par l’interface.
- Le frontend utilise le port 8000 par défaut ; `python api.py` peut nécessiter le port 8095 indiqué dans le brief.
- Le contenu des catalogues, les URLs fournisseurs et les liens UQload viennent exclusivement du backend. Aucun résultat de démonstration n’est inventé.

## Limites connues

- Le scraping Selenium peut durer 30 à 60 secondes ou plus. Le backend utilise un seul navigateur partagé sous verrou : l’interface attend la soumission du formulaire et n’effectue pas de recherche à la frappe.
- Les tâches d’actualisation sont en mémoire et disparaissent au redémarrage du backend. Une réponse `not_found` est donc possible.
- Le statut fournisseur est une déclaration statique, pas un test de santé en direct.
- Le nom backend `/download` est conservé uniquement dans le proxy technique : dans l’interface, l’action s’appelle « Actualiser les infos » et ne télécharge aucun fichier.
- Une liste vide n’est pas une erreur ; le site distant ou ses sélecteurs peuvent avoir changé.
- Les champs d’une réponse API peuvent changer car le backend ne déclare pas de `response_model`. Zod vérifie les champs utilisés sans rejeter les champs supplémentaires.

## Vérification manuelle

- [ ] Recherche réussie et ouverture d’un résultat.
- [ ] Recherche sans résultat et essai d’un autre fournisseur.
- [ ] Fournisseur invalide renvoyé comme erreur métier HTTP 200.
- [ ] Backend éteint (erreur réseau 502) et délai dépassé (504).
- [ ] Actualisation d’une tâche `done`, `failed` et `not_found`.
- [ ] Retour arrière et rechargement avec `/?q=...&provider=...`.

## Tests unitaires

Vitest couvre les schémas Zod et la normalisation d’erreurs métier HTTP 200, validation 422, backend inaccessible 502, timeout 504, les formats durée/taille et les validateurs d’entrée.
