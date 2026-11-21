const AGENTS = [
  ["Intent", "Turns a plain-language brief into a validated trip specification."],
  ["Discovery", "Shortlists destinations using a deterministic ranking tool."],
  ["Journey builder", "Builds assembled trips and package alternatives and explains them."],
  ["Verifier", "Checks budget, logistics and unsupported claims. Rejects what fails."],
  ["Booking coordinator", "Prepares supplier quote requests. Humans approve before anything is sent or paid."],
];
export default function Home() {
  return (<main>
    <h1>Tell us the trip. Agents do the booking work.</h1>
    <p className="lead">WAYFARER is a team of AI agents that plans, prices, verifies and requests East African trips for international travellers. Software does the arithmetic. People approve every payment.</p>
    <p><a className="btn" href="/plan">Try the agent desk</a></p>
    <h2 style={{ marginTop: 40 }}>Five agents, one deterministic core</h2>
    <div className="grid">{AGENTS.map(([n, d]) => (<div className="card" key={n}><b>{n}</b><p className="muted">{d}</p></div>))}</div>
    <div className="note"><b>What is real today:</b> the agent pipeline, the pricing and verification engine, and the request workflow. <b>What is not yet:</b> live supplier rates, availability and payments. Every price is labelled Estimated until a supplier confirms it.</div>
    <h2>How it earns</h2>
    <p>Supplier commissions on completed bookings: lodges, guides, transfers, activities and packages. No fee for planning. Recommendations never use commission as an input.</p>
  </main>);
}
