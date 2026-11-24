import { z } from "zod";

export const Priority = z.enum(["cost", "time", "flex"]);
export type Priority = z.infer<typeof Priority>;

export const TripBrief = z.object({
  travellers: z.number().int().min(1).max(12),
  nights: z.number().int().min(3).max(21),
  budgetUsd: z.number().min(500).max(200000),
  priority: Priority,
  month: z.string().max(40).describe("Travel month or window as the traveller said it, or empty"),
  interests: z.array(z.string().max(60)).max(8),
  summary: z.string().max(400),
  origin: z.string().max(80).default("").describe("Departure city, or empty"),
  passport: z.string().max(60).default("").describe("Passport country, or empty"),
});
export type TripBrief = z.infer<typeof TripBrief>;

export type Mode = "assembled" | "package";
export type LineStatus = "estimated" | "quote_received" | "availability_confirmed";

export interface Line { label: string; amount: number; status: LineStatus }
export interface Proposal {
  id: string; destId: string; destName: string; mode: Mode; title: string; highlights: string[];
  total: number; lines: Line[]; hoursFromNairobi: number; flexibility: number; score: number;
  headroom: number; evidence: string; verdict?: Verdict; narrative?: string;
}
export interface Verdict { ok: boolean; issues: string[]; notes: string[] }

export type AgentName = "Intent" | "Discovery" | "Journey builder" | "Verifier" | "Booking coordinator";
export interface AgentEvent {
  agent: AgentName | "Orchestrator"; status: "running" | "done" | "error"; message: string;
  mode?: "llm" | "rules"; data?: unknown;
}

export const TripRequest = z.object({
  name: z.string().min(1).max(120), email: z.string().email().max(200),
  window: z.string().max(120).optional(), notes: z.string().max(1000).optional(),
  wouldBook: z.string().max(80).optional(), worry: z.string().max(400).optional(),
  stuck: z.string().max(400).optional(), creatorRef: z.string().max(60).optional(),
  brief: TripBrief, proposalId: z.string().max(80), destName: z.string().max(120),
  mode: z.enum(["assembled", "package"]), estimatedTotal: z.number(), drafts: z.array(z.string().max(4000)).max(6).optional(),
});
export type TripRequest = z.infer<typeof TripRequest>;
