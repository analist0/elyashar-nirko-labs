---
task: Integrate Cloudflare AI, upgrade blog pipeline, add sales agent
slug: 20260507-125000_cloudflare-ai-blog-agent
effort: advanced
phase: complete
progress: 30/30
mode: interactive
started: 2026-05-07T12:50:00+03:00
updated: 2026-05-07T12:50:00+03:00
---

## Context

User has Cloudflare Workers AI account ($20 credit, token cfut_...). Wants:
1. Replace Pollinations/Kimi image gen with alibaba/wan-2.6-image ($0.03/image)
2. Replace template-based blog content with real LLM-generated Hebrew guides
3. Sales agent chat widget on site that markets Joseph's services
4. Telegram handoff when visitor shows buying intent
5. Cost calculation for 3 images/day

Cost math: 3 images × $0.03 × 30 days = $2.70/month. $20 lasts ~7.4 months.
LLM text gen (llama-3.1-70b) is ~$0.0008/post, negligible.

Static site constraint: chat agent backend must be a Cloudflare Worker (external URL), not Next.js API route.

## Criteria

### Image Generation
- [ ] ISC-1: `scripts/cloudflare-ai.ts` created with CF REST API client
- [ ] ISC-2: Image endpoint uses `alibaba/wan-2.6-image` model
- [ ] ISC-3: Image response binary saved to `public/images/generated/`
- [ ] ISC-4: Post JSON stores local path instead of external URL
- [ ] ISC-5: Negative prompt parameter included in image request
- [ ] ISC-6: Falls back to Pollinations URL if CF AI fails

### LLM Content Generation
- [ ] ISC-7: `cfTextGenerate` function in cloudflare-ai.ts uses llama-3.1-70b
- [ ] ISC-8: Blog content generated via LLM prompt (not hardcoded template)
- [ ] ISC-9: Hebrew system prompt crafted for tech guide writing
- [ ] ISC-10: Content includes structured step-by-step sections
- [ ] ISC-11: Code blocks properly formatted in generated HTML
- [ ] ISC-12: Falls back to template if CF AI text gen fails

### Environment & CI
- [ ] ISC-13: `.env.local.example` includes `CLOUDFLARE_API_TOKEN`
- [ ] ISC-14: `.env.local.example` includes `CLOUDFLARE_ACCOUNT_ID`
- [ ] ISC-15: GitHub Actions workflow passes CF secrets to generate step
- [ ] ISC-16: Workflow commits `public/images/generated/` alongside content

### Sales Agent Frontend
- [ ] ISC-17: `components/SalesAgent.tsx` created as floating chat widget
- [ ] ISC-18: Chat widget renders as floating button (bottom-right)
- [ ] ISC-19: Click opens chat panel with Joseph's services context
- [ ] ISC-20: Messages display with RTL Hebrew support
- [ ] ISC-21: Loading dots shown while waiting for response
- [ ] ISC-22: Enter key sends message

### Cloudflare Worker Backend
- [ ] ISC-23: `workers/sales-agent.ts` Worker created with AI binding
- [ ] ISC-24: System prompt includes Joseph's services and pricing
- [ ] ISC-25: CORS headers allow GitHub Pages origin
- [ ] ISC-26: HANDOFF trigger detection implemented

### Telegram Integration
- [ ] ISC-27: Worker calls Telegram Bot API when HANDOFF detected
- [ ] ISC-28: Full conversation history sent to Telegram
- [ ] ISC-29: `workers/wrangler.toml` config created

### Site Integration
- [ ] ISC-30: `SalesAgent` imported and rendered in `src/app/page.tsx`

## Decisions

## Verification
