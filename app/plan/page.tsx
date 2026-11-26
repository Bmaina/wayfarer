"use client";
import { useEffect, useState } from "react";
import type { AgentEvent, AgentName, Proposal, TripBrief } from "@/lib/types";
import { whatIf } from "@/lib/pricing";
import { encodeShare } from "@/lib/share";
import { EntryPanel, Photo, usd } from "@/components/parts";

const ORDER: AgentName[] = ["Intent", "Discovery", "Journey builder", "Verifier", "Booking coordinator"];
interface Result { brief: TripBrief; proposals: Proposal[]; recommendedId: string | null; drafts: { supplierRole: string; subject: string; body: string }[]; mode: "llm" | "rules" }
const NAMES: Record<string, string> = { ke: "Masai Mara and Amboseli", tz: "Serengeti and Ngorongoro", rw: "Volcanoes and Akagera" };

export default function Plan() {
  const [f, setF] = useState({ text: "First safari for two in December. We want big wildlife, comfortable lodges and no logistics to manage. Open to any country in East Africa.", budget: 9000, trav: 2, nights: 8, prio: "cost", origin: "", passport: "" });
  const [focus, setFocus] = useState(""); const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<Record<string, AgentEvent>>({});
  const [orch, setOrch] = useState<AgentEvent | null>(null);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [pick, setPick] = useState<Proposal | null>(null);
  const [sent, setSent] = useState<{ id: string; note: string; support: { name: string; email: string; window: string } } | null>(null);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => { // creator / deep links: /plan?dest=ke&nights=8&budget=9000&trav=2&origin=Chicago&ref=creatorname
    const q = new URLSearchParams(window.location.search); const n = (k: string, d: number) => { const v = Number(q.get(k)); return v > 0 ? v : d; };
    const dest = q.get("dest") ?? ""; setFocus(NAMES[dest] ? dest : ""); setRef((q.get("ref") ?? "").slice(0, 60));
    setF((p) => ({ ...p, budget: n("budget", p.budget), trav: n("trav", p.trav), nights: n("nights", p.nights), origin: (q.get("origin") ?? "").slice(0, 80),
      text: (q.get("text") ?? "").slice(0, 1000) || (NAMES[dest] ? `I saw ${NAMES[dest]} and I want to go. Make this trip happen for ${n("trav", p.trav)} traveller(s), ${n("nights", p.nights)} nights.` : p.text) }));
  }, []);

  async function run(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setRes(null); setEvents({}); setPick(null); setSent(null); setShareMsg("");
    const body = { text: f.text, budgetUsd: f.budget, travellers: f.trav, nights: f.nights, priority: f.prio, origin: f.origin || undefined, passport: f.passport || undefined };
    try {
      const r = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok || !r.body) throw new Error(await r.text());
      const rd = r.body.getReader(), dec = new TextDecoder(); let buf = "";
      for (;;) {
        const { done, value } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true }); const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const l of lines) { if (!l.trim()) continue; const ev = JSON.parse(l) as AgentEvent;
          if (ev.agent === "Orchestrator") { setOrch(ev); if (ev.status === "done" && ev.data) setRes(ev.data as Result); if (ev.status === "error") setErr(ev.message); }
          else setEvents((p) => ({ ...p, [ev.agent]: ev })); }
      }
    } catch (x) { setErr((x as Error).message || "Something went wrong."); }
    setBusy(false);
  }

  function share(p: Proposal) {
    if (!res) return;
    const t = encodeShare({ v: 1, destId: p.destId, destName: p.destName, title: p.title, mode: p.mode, total: p.total, lines: p.lines, hours: p.hoursFromNairobi, score: p.score,
      narrative: p.narrative, notes: p.verdict ? [...p.verdict.issues, ...p.verdict.notes] : [], travellers: res.brief.travellers, nights: res.brief.nights, budget: res.brief.budgetUsd, origin: res.brief.origin || undefined });
    const url = `${window.location.origin}/share#${t}`;
    navigator.clipboard?.writeText(url).then(() => setShareMsg("Link copied. Anyone with it can see this proposal, which contains no personal details."), () => setShareMsg(url));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!pick || !res) return;
    const d = new FormData(e.target as HTMLFormElement);
    const payload = { name: String(d.get("name")), email: String(d.get("email")), window: String(d.get("window") ?? ""), notes: String(d.get("notes") ?? ""), wouldBook: String(d.get("wb") ?? ""), worry: String(d.get("worry") ?? ""),
      stuck: String(d.get("stuck") ?? ""), creatorRef: ref || undefined, brief: res.brief, proposalId: pick.id, destName: pick.destName, mode: pick.mode, estimatedTotal: pick.total, drafts: res.drafts.map((x) => `${x.supplierRole}: ${x.subject}`) };
    const r = await fetch("/api/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json(); if (j.ok) setSent({ id: j.id, note: j.note, support: j.support }); else setErr(j.error || "Could not send the request.");
  }

  const ordered = res ? [...res.proposals].sort((a, b) => Number(b.destId === focus) - Number(a.destId === focus) || b.score - a.score) : [];
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: ["budget", "trav", "nights"].includes(k) ? Number(e.target.value) : e.target.value }));

  return (<main>
    <h1>The agent desk</h1>
    <p className="lead">Describe the trip. Five agents plan, price, verify and prepare it. Prices are demonstration estimates, and entry rules link to official sources.</p>
    {focus && <div className="note">You opened a link for <b>{NAMES[focus]}</b>. It is shown first in your results.</div>}
    <form onSubmit={run} className="card">
      <label htmlFor="text">Your trip, in your words</label>
      <textarea id="text" required minLength={5} maxLength={1000} value={f.text} onChange={set("text")} />
      <div className="row">
        <div><label htmlFor="origin">Departing from</label><input id="origin" value={f.origin} onChange={set("origin")} placeholder="For example, Chicago" maxLength={80} /></div>
        <div><label htmlFor="passport">Passport country (optional)</label><input id="passport" value={f.passport} onChange={set("passport")} placeholder="Used only to point you to the right rules" maxLength={60} /></div>
      </div>
      <div className="row">
        <div><label htmlFor="budget">Budget (USD)</label><input id="budget" type="number" min={500} step={100} value={f.budget} onChange={set("budget")} /></div>
        <div><label htmlFor="trav">Travellers</label><input id="trav" type="number" min={1} max={12} value={f.trav} onChange={set("trav")} /></div>
        <div><label htmlFor="nights">Nights</label><input id="nights" type="number" min={3} max={21} value={f.nights} onChange={set("nights")} /></div>
        <div><label htmlFor="prio">What matters most</label><select id="prio" value={f.prio} onChange={set("prio")}><option value="cost">Lowest cost</option><option value="time">Least travel time</option><option value="flex">Most flexibility</option></select></div>
      </div>
      <button className="btn" disabled={busy}>{busy ? "Agents working…" : "Run the agents"}</button>
    </form>
    {err && <p className="bad" role="alert">{err}</p>}
    {(orch || busy) && <div className="card" style={{ marginTop: 14 }} aria-live="polite">
      <b>Agent activity</b> {orch?.mode && <span className="bdg">{orch.mode === "llm" ? "LLM agents on" : "Rules mode (no API key)"}</span>}
      {ORDER.map((n) => { const ev = events[n]; return (<div className="agent" key={n}><span className={"dot " + (ev?.status ?? "")} /><span style={{ minWidth: 150 }}>{n}</span><span className="muted">{ev?.message ?? "Waiting"}</span></div>); })}
    </div>}
    {res && <>
      <h2 style={{ marginTop: 24 }}>Proposals</h2>
      <p className="muted">Ranked for your priority. Numbers come from the pricing engine, not the language model. Every line is an estimate until a supplier confirms.</p>
      <div className="grid">{ordered.map((p) => (
        <div className={"card" + (p.id === res.recommendedId ? " sel" : "")} key={p.id}>
          <Photo destId={p.destId} />
          {p.id === res.recommendedId && <span className="tag">Recommended</span>}
          <b>{p.destName}</b><div className="muted">{p.title}</div>
          <p><b>{usd(p.total)}</b> <span className="bdg">Estimated</span><br /><span className={p.headroom >= 0 ? "ok" : "bad"}>{p.headroom >= 0 ? usd(p.headroom) + " under budget" : usd(-p.headroom) + " over budget"}</span></p>
          {p.narrative && <p>{p.narrative}</p>}
          <table><tbody>{p.lines.map((l) => (<tr key={l.label}><td>{l.label}</td><td>{usd(l.amount)}</td></tr>))}<tr><td>Score</td><td>{p.score} / 100</td></tr></tbody></table>
          {p.verdict && <ul className="muted">{[...p.verdict.issues.map((x) => "Fails: " + x), ...p.verdict.notes].map((n, i) => <li key={i}>{n}</li>)}</ul>}
          <EntryPanel destId={p.destId} passport={res.brief.passport} />
          <div className="chips"><button className="btn" disabled={!p.verdict?.ok} onClick={() => { setPick(p); setSent(null); }}>Request this trip</button><button className="btn alt" onClick={() => share(p)}>Share this proposal</button></div>
        </div>))}</div>
      {shareMsg && <p className="muted copy" role="status">{shareMsg}</p>}
      <div className="card"><b>What would change this recommendation?</b>
        <ul className="whatif">{(whatIf(res.brief).length ? whatIf(res.brief) : ["The recommendation holds across small changes to nights, group size and priority."]).map((w, i) => <li key={i}>{w}</li>)}</ul>
        <p className="muted">Computed by the pricing engine on the same demo rates.</p></div>
      <div className="card"><b>Where the trips go</b><p className="muted">Straight-line distances from Nairobi. Routes are illustrative.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/route-map.svg" alt="Map of East Africa with routes from Nairobi to the destinations" style={{ width: "100%", borderRadius: 10 }} /></div>
      {res.drafts.length > 0 && <div className="card"><b>Supplier quote requests drafted (not sent)</b>
        {res.drafts.map((d) => (<details key={d.supplierRole}><summary>{d.supplierRole}: {d.subject}</summary><pre>{d.body}</pre></details>))}
        <p className="muted">A person reviews and sends these. Nothing is booked, paid or confirmed by the agents.</p></div>}
    </>}
    {pick && !sent && <form className="card" onSubmit={submit} style={{ marginTop: 14 }}>
      <b>Request: {pick.destName}, {pick.title} ({usd(pick.total)} estimated)</b>
      <p className="muted">This is a request, not a booking. We check supplier availability and price, then send you a verified proposal for approval.</p>
      <div className="row"><div><label htmlFor="name">Your name</label><input id="name" name="name" required /></div><div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div></div>
      <div className="row"><div><label htmlFor="window">Travel window</label><input id="window" name="window" /></div><div><label htmlFor="wb">Would you book if an AI organised it and a person verified the price?</label><select id="wb" name="wb"><option>Yes</option><option>Maybe</option><option>No</option><option>Not sure</option></select></div></div>
      <label htmlFor="stuck">Where were you unsure, or tempted to stop planning?</label><input id="stuck" name="stuck" />
      <label htmlFor="worry" style={{ marginTop: 10 }}>What worries you most?</label><input id="worry" name="worry" />
      <p><button className="btn">Send request</button></p>
    </form>}
    {sent && <div className="note"><b>Request {sent.id} received.</b> {sent.note} Nothing has been booked.{" "}
      {sent.support.name || sent.support.email ? <>You will hear from {sent.support.name || "the WAYFARER team"}{sent.support.window ? ` within ${sent.support.window}` : ""}{sent.support.email ? ` at ${sent.support.email}` : ""}.</> : <>A WAYFARER team member will reply by email.</>}</div>}
  </main>);
}
