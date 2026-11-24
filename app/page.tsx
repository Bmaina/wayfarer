import { PHOTOS } from "@/lib/photos";
const AGENTS = [
  ["Intent", "Turns a plain-language brief into a validated trip specification."],
  ["Discovery", "Shortlists destinations using a deterministic ranking tool."],
  ["Journey builder", "Builds assembled trips and package alternatives and explains them."],
  ["Verifier", "Checks budget, logistics and unsupported claims. Rejects what fails."],
  ["Booking coordinator", "Prepares supplier quote requests. Humans approve before anything is sent or paid."],
];
const TRIPS = [["ke", "Masai Mara and Amboseli", "Kenya"], ["tz", "Serengeti and Ngorongoro", "Tanzania"], ["rw", "Volcanoes and Akagera", "Rwanda"]];
export default function Home() {
  return (<main>
    <div className="hero"><img src="/banner.svg" alt="WAYFARER: a savanna sunset with an acacia tree" /></div>
    <h1>From &ldquo;I want to go&rdquo; to a trip that works.</h1>
    <p className="lead">You watched a video of the Mara and thought: I want to go. Then the hard part starts: the route, the entry rules, the lodges, the park fees, the price. WAYFARER is a team of AI agents that works it out, checks it, and prepares the booking. Software does the arithmetic. People approve every payment.</p>
    <p className="chips"><a className="btn" href="/plan">Plan a trip</a><a className="btn alt" href="/plan?dest=ke">Start from the Mara</a></p>
    <h2 style={{ marginTop: 36 }}>Start from a place</h2>
    <div className="grid">{TRIPS.map(([id, name, country]) => { const p = PHOTOS[id]; return (<a key={id} href={`/plan?dest=${id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
      <figure className="photo"><img src={p.url} alt={p.alt} loading="lazy" /><figcaption>Photo: {p.author}, {p.licence}, via Wikimedia Commons</figcaption></figure>
      <b>{name}</b><div className="muted">{country}. Plan this trip</div></a>); })}</div>
    <h2 style={{ marginTop: 36 }}>Five agents, one deterministic core</h2>
    <div className="grid">{AGENTS.map(([n, d]) => (<div className="card" key={n}><b>{n}</b><p className="muted">{d}</p></div>))}</div>
    <div className="note"><b>What is real today:</b> the agent pipeline, the pricing and verification engine, entry-rule links to official sources, shareable proposals, and the request workflow. <b>What is not yet:</b> live supplier rates, availability, flights and payments. Every price is labelled Estimated until a supplier confirms it.</div>
    <h2>How it earns</h2>
    <p>Supplier commissions on completed bookings: lodges, guides, transfers, activities and packages. No fee for planning. Recommendations never use commission as an input.</p>
  </main>);
}
