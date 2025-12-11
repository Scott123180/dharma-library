export interface TalkMetadata {
  id: string; // e.g. "2024-03-15-dana-paramita"
  title: string;
  teacher: string;
  date: string; // ISO date string: "2024-03-15"
  retreat?: string;
  tags: string[];
  summary?: string;
  duration?: string;
  length?: string;
  location?: string;
  audioUrl?: string;
  caption?: string;
  collection?: string;
  track?: string;
  koanCase?: string;
  catalogId?: string;
  trainingQuarter?: string;
  contributedBy?: string;
  resourceId?: string;
}

export interface Talk extends TalkMetadata {
  transcript: string; // full text of the talk
}
