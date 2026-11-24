import { z } from "zod";
// Share links carry the proposal in the URL fragment. Nothing is stored and no personal data is included.
const Line = z.object({ label: z.string().max(80), amount: z.number(), status: z.string().max(40) });
export const SharedTrip = z.object({
  v: z.literal(1), destId: z.string().max(10), destName: z.string().max(120), title: z.string().max(120), mode: z.enum(["assembled", "package"]),
  total: z.number(), lines: z.array(Line).max(8), hours: z.number(), score: z.number(), narrative: z.string().max(400).optional(),
  notes: z.array(z.string().max(300)).max(8), travellers: z.number(), nights: z.number(), budget: z.number(), origin: z.string().max(80).optional(),
});
export type SharedTrip = z.infer<typeof SharedTrip>;
export function encodeShare(t: SharedTrip): string {
  const b = btoa(unescape(encodeURIComponent(JSON.stringify(t))));
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeShare(s: string): SharedTrip | null {
  try {
    const b = s.replace(/-/g, "+").replace(/_/g, "/"); const pad = b + "=".repeat((4 - (b.length % 4)) % 4);
    return SharedTrip.parse(JSON.parse(decodeURIComponent(escape(atob(pad)))));
  } catch { return null; }
}
