# WAYFARER MVP

A multi-agent travel desk for East African trips, built with Next.js 16 and the Vercel AI SDK 7.
Five agents (Intent, Discovery, Journey builder, Verifier, Booking coordinator) run in sequence. A deterministic engine
does every price and score. Agents choose, explain, check and draft; they never send, pay or confirm.

## Run locally
```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY to switch the LLM agents on
npm run test                 # pricing and verification engine tests
npm run dev                  # http://localhost:3000
```
Without an API key the app runs in **rules mode** and says so in the UI.

## Deploy on Vercel
1. Push this folder to a GitHub repository.
2. In Vercel: Add New > Project > import the repo. Framework is detected as Next.js.
3. Add environment variables: `ANTHROPIC_API_KEY` (and optionally `AGENT_MODEL`).
4. To keep trip requests: add an Upstash Redis integration from the Vercel Marketplace; it fills `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
5. Deploy. Or from the terminal: `npm i -g vercel && vercel --prod`.
Notes: `/api/plan` streams for up to 120 seconds (`maxDuration`). Use a Pro plan for commercial use. Add Vercel WAF rate limits or BotID before sharing the URL widely, because the endpoint spends LLM credits.

## What is real, what is not
Real: agent pipeline and tool loop, deterministic pricing/scoring/verification (tested), streaming UI, request workflow, input validation.
Not yet: supplier rates (all data in `lib/data.ts` is placeholder), availability, payments, email sending, human approval console, the LLM path has not been run against a live key by the author.

## Make it real (in order)
1. Replace `lib/data.ts` with quotes from 5 to 10 real suppliers (rates, season, terms) and add a `quotedAt` date and source per line.
2. Add a review console where a person edits and sends the drafted quote requests, then records replies; move line status to `quote_received` and `availability_confirmed`.
3. Move the pipeline to Vercel Workflows so each run is durable and resumable.
4. Add the Booking coordinator's approval step (AI SDK `toolApproval`) before any send or payment tool.
5. Get the licences and payment partner in place before taking money (Kenya agent licence, ticketing partner).
