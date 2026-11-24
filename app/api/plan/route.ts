import { z } from "zod";
import { runPipeline } from "@/lib/agents";
import { Priority } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const Input = z.object({ text: z.string().min(5).max(1000), budgetUsd: z.number().min(500).max(200000),
  travellers: z.number().int().min(1).max(12), nights: z.number().int().min(3).max(21), priority: Priority, origin: z.string().max(80).optional(), passport: z.string().max(60).optional() });

// Best-effort per-instance limiter. Use Vercel WAF or BotID for real protection before public launch.
const hits = new Map<string, number[]>();
function limited(ip: string) { const now = Date.now(), a = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000); a.push(now); hits.set(ip, a); return a.length > 12; }

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (limited(ip)) return new Response("Too many requests. Try again later.", { status: 429 });
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Invalid input.", { status: 400 });
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(c) {
      const send = (o: unknown) => c.enqueue(enc.encode(JSON.stringify(o) + "\n"));
      try { const result = await runPipeline(parsed.data, send); send({ agent: "Orchestrator", status: "done", message: "Complete", data: result }); }
      catch (e) { send({ agent: "Orchestrator", status: "error", message: (e as Error).message.slice(0, 200) }); }
      c.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" } });
}
