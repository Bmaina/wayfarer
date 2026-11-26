import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "WAYFARER: African trips planned and prepared by agents", description: "A multi-agent travel desk for East African safaris. Describe the trip; agents plan, price, verify and request it." };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><div className="wrap">
    <header className="top"><a className="logo" href="/">WAYFARER</a><a className="btn alt" href="/plan">Plan a trip</a></header>
    {children}
    <p className="muted" style={{ marginTop: 40 }}>Prototype. Prices are demonstration data, not supplier quotes. Nothing is booked or charged.</p>
  </div></body></html>);
}
