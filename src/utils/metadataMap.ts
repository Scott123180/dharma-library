import { TalkMetadata } from "../types/talk";

export function buildMetadataMap(
  index: TalkMetadata[]
): Map<string, TalkMetadata> {
  return new Map(index.map((t) => [t.id, t]));
}
