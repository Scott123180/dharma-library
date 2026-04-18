# Dharma Library

React + TypeScript shell for dharmalibrary.link. The initial version is a read-first experience for Dharma talks, with room to add audio playback and hosted search.

## Getting started

Requirements: Node 18+ and npm.

```bash
npm install
npm run dev
```

Visit the printed local URL (defaults to `http://localhost:5173`). Build for production with `npm run build` and preview the output with `npm run preview`.

## Project structure

- `src/` — React components and styles (`App.tsx` is the main page)
- `index.html` — Vite entry HTML
- `public/` — static assets like `favicon.svg`
- `vite.config.ts` — Vite configuration
- `tsconfig*.json` — TypeScript build settings

## Deploying with AWS Amplify

1. Push this repo to your Git provider.
2. In the Amplify console, connect the repo and select the main branch.
3. Amplify will detect Vite and use `npm install`, `npm run build`, and `npm run preview` for verification.
4. The build output lives in `dist/`. Configure the artifact directory to `dist`.

## Authentication

The site is gated behind Amazon Cognito authentication (Amplify Gen 2). Users must log in before accessing any content — there is no self-registration.

**User Pool:** `us-east-1_GnKLpjgam`

To add a user:
1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito) → User pools → `us-east-1_GnKLpjgam`
2. Users tab → Create user
3. Enter their email and a temporary password — they'll be prompted to set a permanent one on first login

**Local development:** The Cognito resources were provisioned via `npx ampx sandbox` (requires Node 20, `@aws-amplify/backend-cli` installed globally). The generated `amplify_outputs.json` is committed and used by both dev and prod builds. To update auth config, edit [amplify/auth/resource.ts](amplify/auth/resource.ts) and re-run the sandbox.

## Roadmap hints

- Add audio URLs and a player component when files are ready.
- Hook the search bar into your search-as-a-service endpoint once available.
- Swap placeholder links with real talk pages once the library is ingested.

## Cloudfront distribution
Text files can be accessed via cloudfront distribution. Distribution here: `d2f7aw4s8anu7j.cloudfront.net`
