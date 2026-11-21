import { TripRequest } from "@/lib/types";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = TripRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const id = "REQ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const record = JSON.stringify({ id, ts: new Date().toISOString(), ...parsed.data });
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  let saved = false;
  if (url && token) {
    try { const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(["LPUSH", "wayfarer:requests", record]) }); saved = r.ok; } catch { saved = false; }
  } else { console.log("TRIP_REQUEST", record); }
  return Response.json({ ok: true, id, saved, note: saved ? "Saved." : "Not stored: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to persist requests. The request is in the function logs." });
}
