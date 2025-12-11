import { TALKS_INDEX_URL, talkUrl } from "../config/talks";
import { Talk, TalkMetadata } from "../types/talk";

export async function fetchTalksIndex(): Promise<TalkMetadata[]> {
  const res = await fetch(TALKS_INDEX_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch talks index: ${res.status}`);
  }
  return res.json();
}

export async function fetchTalk(id: string): Promise<Talk> {
  const res = await fetch(talkUrl(id));
  if (!res.ok) {
    throw new Error(`Failed to fetch talk ${id}: ${res.status}`);
  }
  return res.json();
}
