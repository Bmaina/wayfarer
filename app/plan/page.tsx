"use client";
import { useRef, useState } from "react";
import type { AgentEvent, AgentName, Proposal, TripBrief } from "@/lib/types";

const ORDER: AgentName[] = ["Intent", "Discovery", "Journey builder", "Verifier", "Booking coordinator"];
interface Result { brief: TripBrief; proposals: Proposal[]; recommendedId: string | null; drafts: { supplierRole: string; subject: string; body: string }[]; mode: "llm" | "rules" }
const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export default function Plan() {
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<Record<string, AgentEvent>>({});
  const [orch, setOrch] = useState<AgentEvent | null>(null);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [pick, setPick] = useState<Proposal | null>(null);
  const [sent, setSent] = useState<{ id: string; note: string } | null>(null);
  const form = useRef<HTMLFormElement>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setRes(null); setEvents({}); setPick(null); setSent(null);
    const f = new FormData(form.current!);
    const body = { text: String(f.get("text")), budgetUsd: Number(f.get("budget")), travellers: Number(f.get("trav")), nights: Number(f.get("nights")), priority: String(f.get("prio")) };
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

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!pick || !res) return;
    const f = new FormData(e.target as HTMLFormElement);
    const payload = { name: String(f.get("name")), email: String(f.get("email")), window: String(f.get("window") ?? ""), notes: String(f.get("notes") ?? ""), wouldBook: String(f.get("wb") ?? ""), worry: String(f.get("worry") ?? ""),
      brief: res.brief, proposalId: pick.id, destName: pick.destName, mode: pick.mode, estimatedTotal: pick.total, drafts: res.drafts.map((d) => `${d.supplierRole}: ${d.subject}`) };
    const r = await fetch("/api/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json(); if (j.ok) setSent({ id: j.id, note: j.note }); else setErr(j.error || "Could not send the request.");
  }

  return (<main>
    <h1>The agent desk</h1>
    <p className="lead">Describe the trip. Five agents plan, price, verify and prepare it. Prices are demonstration estimates.</p>
    <form ref={form} onSubmit={run} className="card">
      <label htmlFor="text">Your trip, in your words</label>
      <textarea id="text" name="text" required minLength={5} maxLength={1000} defaultValue="First safari for two in December. We want big wildlife, comfortable lodges and no logistics to manage. Open to any country in East Africa." />
      <div className="row">
        <div><label htmlFor="budget">Budget (USD)</label><input id="budget" name="budget" type="number" min={500} step={100} defaultValue={9000} /></div>
        <div><label htmlFor="trav">Travellers</label><input id="trav" name="trav" type="number" min={1} max={12} defaultValue={2} /></div>
        <div><label htmlFor="nights">Nights</label><input id="nights" name="nights" type="number" min={3} max={21} defaultValue={8} /></div>
        <div><label htmlFor="prio">What matters most</label><select id="prio" name="prio"><option value="cost">Lowest cost</option><option value="time">Least travel time</option><option value="flex">Most flexibility</option></select></div>
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
      <div className="grid">{res.proposals.map((p) => (
        <div className={"card" + (p.id === res.recommendedId ? " sel" : "")} key={p.id}>
          {p.id === res.recommendedId && <span className="tag">Recommended</span>}
          <b>{p.destName}</b><div className="muted">{p.title}</div>
          <p><b>{usd(p.total)}</b> <span className="bdg">Estimated</span><br /><span className={p.headroom >= 0 ? "ok" : "bad"}>{p.headroom >= 0 ? usd(p.headroom) + " under budget" : usd(-p.headroom) + " over budget"}</span></p>
          {p.narrative && <p>{p.narrative}</p>}
          <table><tbody>{p.lines.map((l) => (<tr key={l.label}><td>{l.label}</td><td>{usd(l.amount)}</td></tr>))}<tr><td>Score</td><td>{p.score} / 100</td></tr></tbody></table>
          {p.verdict && <ul className="muted">{[...p.verdict.issues.map((x) => "Fails: " + x), ...p.verdict.notes].map((n, i) => <li key={i}>{n}</li>)}</ul>}
          <button className="btn" disabled={!p.verdict?.ok} onClick={() => { setPick(p); setSent(null); }}>Request this trip</button>
        </div>))}</div>
      {res.drafts.length > 0 && <div className="card"><b>Supplier quote requests drafted (not sent)</b>
        {res.drafts.map((d) => (<details key={d.supplierRole}><summary>{d.supplierRole}: {d.subject}</summary><pre>{d.body}</pre></details>))}
        <p className="muted">A person reviews and sends these. Nothing is booked, paid or confirmed by the agents.</p></div>}
    </>}
    {pick && !sent && <form className="card" onSubmit={submit} style={{ marginTop: 14 }}>
      <b>Request: {pick.destName}, {pick.title} ({usd(pick.total)} estimated)</b>
      <p className="muted">This is a request, not a booking. We check supplier availability and price, then send you a verified proposal for approval.</p>
      <div className="row"><div><label htmlFor="name">Your name</label><input id="name" name="name" required /></div><div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div></div>
      <div className="row"><div><label htmlFor="window">Travel window</label><input id="window" name="window" /></div><div><label htmlFor="wb">Would you book if an AI organised it and a person verified the price?</label><select id="wb" name="wb"><option>Yes</option><option>Maybe</option><option>No</option><option>Not sure</option></select></div></div>
      <label htmlFor="worry">What worries you most?</label><input id="worry" name="worry" />
      <p><button className="btn">Send request</button></p>
    </form>}
    {sent && <div className="note"><b>Request {sent.id} received.</b> {sent.note} Nothing has been booked.</div>}
  </main>);
}
