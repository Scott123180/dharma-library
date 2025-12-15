export interface TalkMetadata {
  id: string; // e.g. "37675" or "2024-03-15-dana-paramita"
  title: string;
  speaker: string;
  date: string; // ISO-ish date string: "2024-07-07 12:59"
  tags: string[];
  summary?: string;
  duration?: string;
  location?: string;
  audioUrl?: string;
  caption?: string;
  koanCollection?: string;
  track?: string;
  koanCase?: string;
  catalogId?: string;
  trainingQuarter?: string;
  dataLineage?: string[];
  retreat?: string;
  contributedBy?: string;
  // Legacy fields kept optional for backwards compatibility during the migration.
  teacher?: string;
  collection?: string;
  resourceId?: string;
}

export interface Talk extends TalkMetadata {
  transcript: string; // full text of the talk
}
