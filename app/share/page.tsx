"use client";
import { useEffect, useState } from "react";
import { decodeShare, type SharedTrip } from "@/lib/share";
import { EntryPanel, Photo, usd } from "@/components/parts";

export default function Share() {
  const [t, setT] = useState<SharedTrip | null | undefined>(undefined);
  useEffect(() => { const h = window.location.hash.replace(/^#/, ""); setT(h ? decodeShare(h) : null); }, []);
  if (t === undefined) return <main><p className="muted">Loading…</p></main>;
  if (!t) return <main><h1>This link is not valid</h1><p className="lead">The shared proposal could not be read. Ask the sender for a new link, or plan your own trip.</p><p><a className="btn" href="/plan">Plan a trip</a></p></main>;
  return (<main>
    <h1>A trip someone wants to share</h1>
    <p className="lead">{t.destName}: {t.title}. {t.travellers} traveller{t.travellers > 1 ? "s" : ""}, {t.nights} nights{t.origin ? `, from ${t.origin}` : ""}.</p>
    <div className="card" style={{ maxWidth: 560 }}>
      <Photo destId={t.destId} />
      <p><b>{usd(t.total)}</b> <span className="bdg">Estimated, demo data</span></p>
      {t.narrative && <p>{t.narrative}</p>}
      <table><tbody>{t.lines.map((l) => (<tr key={l.label}><td>{l.label}</td><td>{usd(l.amount)}</td></tr>))}<tr><td>Score</td><td>{t.score} / 100</td></tr></tbody></table>
      <ul className="muted">{t.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
      <EntryPanel destId={t.destId} />
    </div>
    <p className="muted">This is a proposal from WAYFARER's prototype. Prices are demonstration estimates, not supplier quotes, and nothing is booked.</p>
    <p><a className="btn" href={`/plan?dest=${t.destId}&nights=${t.nights}&trav=${t.travellers}&budget=${Math.round(t.budget)}`}>Plan a trip like this</a></p>
  </main>);
}
