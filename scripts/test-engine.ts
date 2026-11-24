import { priceAll, verify, whatIf } from "../lib/pricing";
import { ENTRY } from "../lib/entry";
import { PHOTOS } from "../lib/photos";
import { encodeShare, decodeShare } from "../lib/share";
import { TripBrief } from "../lib/types";
const assert = (c: boolean, m: string) => { if (!c) { console.error("FAIL", m); process.exit(1); } console.log("ok  ", m); };
const base = TripBrief.parse({ travellers: 2, nights: 8, budgetUsd: 9000, priority: "cost", month: "December", interests: [], summary: "test" });
const ps = priceAll(base);
const ke = ps.find((p) => p.id === "ke-assembled")!;
assert(ke.total === 8000, "Kenya assembled for 2 travellers, 8 nights = $8,000 (got " + ke.total + ")");
assert(ps.length === 6, "six options priced");
assert(ps.every((p) => p.lines.every((l) => l.status === "estimated")), "every line labelled estimated");
assert(priceAll({ ...base, travellers: 4 }).find((p) => p.id === "ke-assembled")!.total > ke.total, "price rises with travellers");
assert(priceAll({ ...base, nights: 10 }).find((p) => p.id === "ke-assembled")!.total > ke.total, "price rises with nights");
const best = (b: typeof base) => ps.length && priceAll(b).sort((a, c) => c.score - a.score)[0].destId;
assert(best({ ...base, priority: "time" }) === "rw", "time priority ranks Rwanda first");
assert(best({ ...base, priority: "cost" }) === "ke", "cost priority ranks Kenya first");
assert(verify(priceAll({ ...base, budgetUsd: 3000 })[0], { ...base, budgetUsd: 3000 }).ok === false, "over-budget option fails verification");
assert(verify(ke, base).notes.some((n) => n.includes("No supplier quote")), "verifier always flags missing supplier confirmation");

const wi = whatIf(base);
assert(Array.isArray(wi) && wi.length <= 4 && wi.every((x) => typeof x === "string"), "what-if returns up to four sentences");
assert(whatIf({ ...base, nights: 4 }).length > 0, "what-if finds a change for a short trip (" + whatIf({ ...base, nights: 4 }).length + ")");
assert(verify(ke, { ...base, origin: "Chicago" }).notes.some((n) => n.includes("Chicago")), "verifier notes the unpriced flights from the origin city");
for (const id of ["ke", "tz", "rw"]) { assert(!!ENTRY[id] && ENTRY[id].portalUrl.startsWith("https://") && ENTRY[id].checkedOn.length === 10, "entry source and date for " + id); assert(!!PHOTOS[id] && PHOTOS[id].author.length > 0, "photo credit for " + id); }
const trip = { v: 1 as const, destId: "ke", destName: "Masai Mara, Kenya", title: "Assembled", mode: "assembled" as const, total: 8000, lines: [{ label: "Lodges", amount: 4200, status: "estimated" }], hours: 5.5, score: 84, notes: ["a note with ünïcode"], travellers: 2, nights: 8, budget: 9000 };
const back = decodeShare(encodeShare(trip));
assert(!!back && back.total === 8000 && back.notes[0] === "a note with ünïcode", "share link round-trips, including unicode");
assert(decodeShare("not-a-valid-link") === null, "invalid share link is rejected");
