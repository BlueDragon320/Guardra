# Guardra — Project Brief

**Tagline:** Your personal privacy guardian
**One-line pitch:** An open-source browser suite that rates site privacy, guards your identity, and helps you reclaim your personal data.
**Theme (SIH):** Blockchain & Cybersecurity
**Scope:** Global tool (not India-only) — DPDP/GDPR/CCPA compliance checking is a *feature inside it*, not the brand identity.

---

## 1. Problem Statement

Users have no visibility into what data websites collect, no easy way to know if their personal data has already leaked, and no simple path to exercise legal rights (deletion, correction, opt-out) they now have under laws like GDPR, CCPA, and India's DPDP Act. Existing tools (Mozilla Monitor, Jumbo, DeleteMe, ToS;DR, uBlock Origin) each solve one slice of this — Guardra combines the essentials into one lightweight browser suite, and is the only one that actively checks sites against emerging regional laws like DPDP.

---

## 2. Core Features (MVP priority order)

### Priority 1 — Build first, demo live

**a) Real-time Privacy Policy Rating**
- Extension badge (green/amber/red) shown on every site visited, similar to uBlock Origin's block counter.
- Backend NLP engine scores a site's privacy policy against a rubric: third-party data sharing, retention period, tracking/cookies, user rights disclosed, breach history, plain-language clarity.
- Base layer: use/reference the open ToS;DR dataset and API rather than building ratings from scratch.
- Differentiator: add a **regional law compliance check** — does the policy name a grievance/DPO contact, disclose retention period, mention correction/erasure rights (required under DPDP Act 2023 / DPDP Rules 2025 in India, and analogous under GDPR/CCPA elsewhere)?
- Technical note: for judged demo credibility, fine-tune a small open-source classifier (e.g. distilled BERT) on labeled policy clauses rather than only wrapping a generic LLM call — shows real ML depth.
- Pre-cache scores for a set of common global + Indian sites so the live demo doesn't wait on inference.

**b) Data Rights / Deletion Assistant**
- Pre-filled data-erasure / access request templates addressed to a site's grievance officer / DPO, citing the correct legal right (GDPR Art. 17, CCPA, or DPDP erasure rights depending on region detected).
- Directory of known data brokers and people-search sites with their opt-out contact flow.
- Request status tracker: Sent → Acknowledged → Resolved.
- Escalation path: point users to the relevant regulator (e.g. Data Protection Board of India, or the applicable EU/US authority) if a company doesn't respond in time.

### Priority 2 — Build if time allows, else keep as roadmap slide

**c) One-Place Privacy Control Hub** *(new addition — recommended)*
- A single settings screen that deep-links directly into the personalization/ad-tracking opt-outs of major platforms (Google My Ad Center, Meta Ad Preferences, etc.), so the user doesn't have to hunt through five different settings menus.
- Shows current status where detectable (e.g. "Ad personalization: ON — 1 click to turn off") and links straight to the right settings page.
- This is a strong "one place solution" pitch point — low technical complexity, high visible value.

**d) Breach / OSINT Self-Exposure Check**
- Self-lookup tool: checks the user's own email/phone against breach databases (HIBP API — k-anonymity, no raw credentials ever transmitted) and known people-search sites.
- Every finding is paired with a one-click remediation action (e.g. opt-out link), not just a raw scary list.
- Recurring background check with alerts on new exposure, not just one-time lookup.

**e) Identity Compartmentalization Onboarding**
- Guided wizard (NOT automated account creation — pure UX guidance) suggesting risk-tiered identities:
  - Core identity (banking, government, healthcare)
  - Work identity
  - Shopping/subscriptions (alias email recommended)
  - Low-trust/one-time signups (alias email + throwaway password)
- Integrates email aliasing (SimpleLogin, Firefox Relay, Apple Hide My Email, or `+tag` addressing) — NOT password-manager-internal hacks (browser extensions cannot read/write another extension's vault, e.g. Proton Pass or Chrome's password manager — this was explicitly ruled out as infeasible).
- Pairs with a password reuse/strength checker via HIBP k-anonymity API.

**f) Education Hub**
- Explains how data brokers monetize profiles, in plain language.
- Explains psychographic targeting / personalization risks with evidence-based examples (not sensationalist).
- Step-by-step guides for disabling ad personalization across major platforms (feeds into feature 2c).
- Recommends privacy-respecting tools: Firefox/LibreWolf, uBlock Origin, Privacy Badger, NextDNS.

### Priority 3 — Stretch goals / roadmap only

- **Dark pattern / cookie-consent detector** — flags manipulative consent banners (pre-ticked boxes, buried "reject all").
- **Permission monitor** — real-time alert when a site's JS requests camera/mic/location/clipboard access.
- **Gamified digital footprint score** — one aggregate score that improves as the user completes privacy actions (opt-outs, 2FA, disabling personalization); designed to drive repeat engagement.

---

## 3. UI/UX Principles

- **Minimalist first.** The popup/badge UI should show one clear signal (rating color + one-line summary) by default, with details available on click-through, not crammed into the first view. Model this after uBlock Origin's popup: fast, unobtrusive, no clutter.
- Every "problem found" surfaced to the user should come with exactly one clear next action — never present a raw data dump without a way to act on it.
- The extension itself should follow privacy-by-design: minimize what Guardra collects, process client-side wherever possible, don't retain scraped OSINT results longer than needed to display, encrypt anything stored, and open-source the extension so it's auditable — this is also a strong pitch point for judges.

---

## 4. User Flow

1. **Login** → account created for the web dashboard (email or OAuth).
2. **Onboarding wizard** → guided identity compartmentalization (see 2e) + email alias setup.
3. **Dashboard** shows: aggregate privacy score, active site rating (from installed extension), OSINT exposure summary, deletion request tracker, one-place personalization control hub, education hub progress.
4. **Day-to-day**: extension badge rates every site visited in real time; user can trigger a deletion request or check exposure at any point from the popup.

---

## 5. Architecture

- **Browser extension** (Manifest V3): content scripts (detect site, read policy links, flag trackers) + background service worker + popup/badge UI.
- **Backend API**: policy rating engine (NLP/classifier), OSINT & breach check module, deletion request tracker/generator.
- **External integrations**: HIBP API (breach check, k-anonymity), ToS;DR API (policy rating base layer), email alias provider (SimpleLogin/Firefox Relay), regional regulator contact info (Data Protection Board of India, EU DPAs, US state AGs as applicable).
- **Web dashboard**: login, onboarding, aggregate privacy score, education hub, request tracking.

---

## 6. Ethical / Legal Guardrails (do not skip)

- No automated account creation on third-party sites — onboarding is guidance only, never bot signups.
- No scraping of sites in violation of their ToS for OSINT data — prefer official APIs (HIBP) over scraping people-search sites directly; clearly disclose data sources.
- Never transmit or store raw passwords — password checks must use k-anonymity hashing only.
- Be ready to explain, to a technical judge, exactly how each data source is obtained and why it's legal.

---

## 7. Tech Stack Suggestions

- Extension: Manifest V3, JS/TS, React for popup UI.
- Backend: Node/Express or Python/FastAPI.
- NLP: fine-tuned small open-source classifier (e.g. distilled BERT) for policy scoring; cache results aggressively for demo speed.
- Database: minimal — user accounts, preferences, request-tracking status only. Avoid long-term storage of scraped personal exposure data.

---

## 8. Hackathon Notes

- Team size: 6 — feasible if scope is cut to Priority 1 features for the live demo, with Priority 2/3 shown as working-but-simpler or roadmap slides.
- Confirm an actual SIH problem statement exists matching this space before committing (PS list historically drops toward the end of August) — if none matches, position this as an open-innovation / portfolio submission instead.
- Lead the pitch with the regional-law compliance angle (feature 1a's DPDP/GDPR/CCPA check) — it's the one piece with no direct existing competitor.
