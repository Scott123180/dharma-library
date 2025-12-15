// Central place to decide where talks are loaded from in each mode.
const isDev = import.meta.env.MODE === "development"; // development is the default vite env

const DEV_BASE_URL = "/dev-data"; // served from public/dev-data when running the dev server
//const DEV_BASE_URL = "/home/biosdaddy/git/llm-speaker/schema-mapper/output"; // unique to local machine
const PROD_BASE_URL = "https://d2f7aw4s8anu7j.cloudfront.net";

export const TALKS_BASE_URL = isDev ? DEV_BASE_URL : PROD_BASE_URL;

export const TALKS_INDEX_URL = `${TALKS_BASE_URL}/talks-index.json`;
export const talkUrl = (id: string) => `${TALKS_BASE_URL}/talks/${id}.json`;
