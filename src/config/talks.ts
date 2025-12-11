// Central place to decide where talks are loaded from in each mode.
const isDev = import.meta.env.MODE === "development";

const DEV_BASE_URL = "/dev-data"; // served from public/dev-data when running the dev server
const PROD_BASE_URL = import.meta.env.VITE_TALKS_CDN_URL ?? "/dev-data"; // fallback keeps things working if env is missing

export const TALKS_BASE_URL = isDev ? DEV_BASE_URL : PROD_BASE_URL;

export const TALKS_INDEX_URL = `${TALKS_BASE_URL}/talks-index.json`;
export const talkUrl = (id: string) => `${TALKS_BASE_URL}/talks/${id}.json`;
