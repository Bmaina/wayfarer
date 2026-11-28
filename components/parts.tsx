import { ENTRY } from "@/lib/entry";
import { PHOTOS } from "@/lib/photos";

export const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function Photo({ destId, tall }: { destId: string; tall?: boolean }) {
  const p = PHOTOS[destId]; if (!p) return null;
  return (<figure className="photo">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={p.url} alt={p.alt} loading="lazy" style={tall ? { height: 260 } : undefined} />
    <figcaption>Photo: {p.author}, <a href={p.page} target="_blank" rel="noopener noreferrer">{p.licence}</a></figcaption>
  </figure>);
}

export function EntryPanel({ destId, passport }: { destId: string; passport?: string }) {
  const e = ENTRY[destId]; if (!e) return null;
  return (<details className="entry">
    <summary><b>Entry requirements for {e.country}</b> <span className="bdg">Official source, checked {e.checkedOn}</span></summary>
    <p className="muted">{passport ? `You said your passport is from ${passport}. ` : ""}WAYFARER does not decide who may enter a country. Rules depend on your passport and change, so confirm on the official site before you book.</p>
    <ul>{e.facts.map((f, i) => <li key={i}>{f}</li>)}</ul>
    <p><a className="btn alt" href={e.portalUrl} target="_blank" rel="noopener noreferrer">{e.portalName}</a></p>
  </details>);
}
