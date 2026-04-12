export function supportsTextFragments(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof (document as Document & { fragmentDirective?: unknown }).fragmentDirective !== "undefined"
  );
}
