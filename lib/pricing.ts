import { DESTINATIONS, COMMISSION, type Dest } from "./data";
import type { Line, Mode, Priority, Proposal, TripBrief } from "./types";

// Deterministic engine. The LLM never supplies a number; it only chooses which options to price.
export function assembledLines(d: Dest, b: Pick<TripBrief, "travellers" | "nights">): Line[] {
  const rooms = Math.ceil(b.travellers / 2), vehicles = Math.ceil(b.travellers / 6), bn = d.baseNights;
  const a = d.assembled;
  const amounts = {
    "Internal flights": (a.flights / 2) * b.travellers,
    "Lodges": (a.lodges / bn) * b.nights * rooms,
    "Parks and activities": (a.parks / (2 * bn)) * b.travellers * b.nights,
    "Guide and transfers": (a.ground / bn) * b.nights * vehicles,
  };
  return Object.entries(amounts).map(([label, amount]) => ({ label, amount: Math.round(amount), status: "estimated" as const }));
}
export function packageTotal(d: Dest, b: Pick<TripBrief, "travellers" | "nights">): number {
  return Math.round((d.packagePrice / (2 * d.baseNights)) * b.travellers * b.nights);
}
export function commissionEarned(d: Dest, mode: Mode, b: Pick<TripBrief, "travellers" | "nights">): number {
  if (mode === "package") return packageTotal(d, b) * COMMISSION.package;
  const [f, l, p, g] = assembledLines(d, b).map((x) => x.amount);
  return f * COMMISSION.flights + l * COMMISSION.lodges + p * COMMISSION.parks + g * COMMISSION.ground;
}

const W: Record<Priority, [number, number, number]> = { cost: [0.7, 0.15, 0.15], time: [0.2, 0.6, 0.2], flex: [0.2, 0.15, 0.65] };

export function priceAll(b: TripBrief): Proposal[] {
  const raw = DESTINATIONS.flatMap((d) =>
    (["assembled", "package"] as Mode[]).map((mode) => {
      const lines: Line[] = mode === "assembled" ? assembledLines(d, b)
        : [{ label: d.packageName, amount: packageTotal(d, b), status: "estimated" as const }];
      const total = lines.reduce((s, l) => s + l.amount, 0);
      return { d, mode, lines, total, flexibility: mode === "assembled" ? 100 : 40 };
    }));
  const minT = Math.min(...raw.map((r) => r.total)), minH = Math.min(...raw.map((r) => r.d.hoursFromNairobi)), w = W[b.priority];
  return raw.map((r): Proposal => ({
    id: `${r.d.id}-${r.mode}`, destId: r.d.id, destName: `${r.d.name}, ${r.d.country}`, mode: r.mode,
    title: r.mode === "assembled" ? "Assembled by WAYFARER" : r.d.packageName,
    highlights: r.mode === "assembled" ? r.d.supplierRoles : [r.d.packageIncludes],
    total: r.total, lines: r.lines, hoursFromNairobi: r.d.hoursFromNairobi, flexibility: r.flexibility,
    score: Math.round(w[0] * 100 * (minT / r.total) + w[1] * 100 * (minH / r.d.hoursFromNairobi) + w[2] * r.flexibility),
    headroom: Math.round(b.budgetUsd - r.total), evidence: "Demonstration data. No supplier quote received.",
  }));
}

export function verify(p: Proposal, b: TripBrief): { ok: boolean; issues: string[]; notes: string[] } {
  const issues: string[] = [], notes: string[] = [];
  if (p.total > b.budgetUsd) issues.push(`Estimated total is $${p.total - b.budgetUsd} over budget.`);
  if (p.headroom >= 0 && p.headroom < b.budgetUsd * 0.05) notes.push("Less than 5% budget headroom: any price change could break the budget.");
  if (p.hoursFromNairobi > 7) notes.push("Long transfer from Nairobi: confirm schedules and a buffer for delays.");
  notes.push(`International flights from ${b.origin || "your departure city"} to Nairobi are not priced or searched here. Confirm flights separately.`);
  notes.push("No supplier quote or availability confirmation yet. This cannot be booked until suppliers confirm.");
  if (p.mode === "package") notes.push("Package flexibility is an assumption (fixed dates). Confirm change and cancellation terms.");
  return { ok: issues.length === 0, issues, notes };
}

// Counterfactuals: how the recommendation would change. Deterministic, computed by the same engine.
export function whatIf(b: TripBrief): string[] {
  const top = (x: TripBrief) => [...priceAll(x)].sort((p, q) => q.score - p.score)[0];
  const label = (p: Proposal) => `${p.destName.split(",")[0]} (${p.mode === "assembled" ? "assembled" : "package"})`;
  const base = top(b), out: string[] = [];
  for (const d of [-2, 2, 3]) { const n = b.nights + d; if (n < 3 || n > 21) continue; const t = top({ ...b, nights: n }); if (t.id !== base.id) out.push(`With ${n} nights instead of ${b.nights}, the top option becomes ${label(t)} at about $${t.total.toLocaleString("en-US")}.`); }
  for (const t of [b.travellers - 1, b.travellers + 1]) { if (t < 1 || t > 12) continue; const r = top({ ...b, travellers: t }); if (r.id !== base.id) out.push(`With ${t} traveller${t > 1 ? "s" : ""}, the top option becomes ${label(r)}.`); }
  for (const pr of ["cost", "time", "flex"] as const) { if (pr === b.priority) continue; const r = top({ ...b, priority: pr }); if (r.id !== base.id) out.push(`If you prioritised ${pr === "cost" ? "lowest cost" : pr === "time" ? "least travel time" : "flexibility"}, it would be ${label(r)}.`); }
  if (base.total > b.budgetUsd) out.push(`The top option needs about $${(base.total - b.budgetUsd).toLocaleString("en-US")} more than your budget.`);
  return out.slice(0, 4);
}
