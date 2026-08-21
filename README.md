# Guardra — Personal Privacy Guardian 🛡️

> **An open-source browser privacy suite that rates site privacy policies in real-time, enforces regional data protection compliance (India DPDP Act 2023 / EU GDPR / CCPA), guards your identity, and automates statutory data erasure requests.**

---

## 🌟 Key Highlights & Pitch Differentiators

1. **Regional Law Compliance Checker (Unique Differentiator)**:
   - Evaluates whether sites name an in-house **Grievance Officer (India DPDP Act 2023 / DPDP Rules 2025)** or **Data Protection Officer (GDPR Art. 17)**.
   - Detects explicit retention limits, user correction/erasure rights, and grievance redressal turnaround times (30-day statutory SLA).
2. **Statutory Data Rights & Erasure Assistant**:
   - Auto-generates legally verified data deletion notices citing **Section 12 of India's DPDP Act**, **GDPR Article 17**, or **California CCPA § 1798.105**.
   - Generates official PDF notices and pre-filled email client actions (`mailto:`).
   - Lifecycle request tracker: `Sent` ➔ `Acknowledged` ➔ `In Progress` ➔ `Resolved` ➔ `Escalated to Data Protection Board of India (DPBI)`.
3. **Zero-Knowledge K-Anonymity Credential & Breach Audit**:
   - Uses client-side SHA-1 hashing with **k-anonymity** (only the 5-character hash prefix is ever queried against HaveIBeenPwned API). Raw credentials never leave the browser.
4. **One-Place Platform Privacy Control Hub**:
   - Deep-links directly to buried ad tracking, voice recording, location history, and AI model training opt-out settings across Google, Meta, Amazon, Microsoft, Apple, and X/Twitter.
5. **Identity Compartmentalization Architecture**:
   - Guided 4-tier risk architecture (Core Banking, Work, Shopping/Delivery, Disposable) paired with recommended email masking providers (Firefox Relay, SimpleLogin, DuckDuckGo).
6. **Manifest V3 Browser Extension**:
   - Minimalist uBlock-inspired popup with dynamic badge grades (Green/Amber/Red), instant 1-click legal deletion notice generator, and content-script tracker detector.

---

## 🏗️ Architecture Overview

```
Guardra/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint & router aggregation
│   │   ├── database.py       # SQLite database for request tracking & preferences
│   │   ├── models/schemas.py # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── policy_analyzer.py   # Multi-pillar NLP classifier & DPDP compliance scorer
│   │   │   ├── deletion_service.py  # Legal notice & PDF generator + lifecycle tracker
│   │   │   ├── breach_service.py    # K-Anonymity HIBP client & OSINT checker
│   │   │   └── footprint_service.py # Dynamic privacy health score calculator
│   │   └── data/
│   │       ├── cached_policies.json # 40+ Pre-cached Indian & global platforms
│   │       ├── data_brokers.json    # Data broker suppression catalog
│   │       ├── regulators.json      # DPBI India, CNIL, ICO, CPPA directory
│   │       └── privacy_hub.json     # 1-Click platform control deep-links
│   └── requirements.txt
│
├── extension/                # Manifest V3 Browser Extension
│   ├── manifest.json         # Extension Manifest V3 configuration
│   ├── background/
│   │   └── service_worker.js # Real-time badge updater & API synchronization
│   ├── content/
│   │   └── content_script.js # Tracker discovery, privacy link & dark pattern checker
│   ├── popup/
│   │   ├── popup.html        # Minimalist popup interface
│   │   ├── popup.css         # Dark-themed modern UI styles
│   │   └── popup.js          # Live site rating & 1-click statutory notice modal
│   └── options/              # Extension configuration options page
│
├── frontend/                 # Modern React Web Dashboard (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Sidebar, Navbar, Badges
│   │   ├── pages/            # 8 Dedicated Feature Pages
│   │   └── services/api.js   # Client API connectors
│   └── package.json
│
└── run_demo.sh               # Single universal script to launch all services
```

---

## 🚀 Quick Start & Live Demo

### 1. Single Command Launch

From the root project directory, run:

```bash
./run_demo.sh
```

This starts:
- **FastAPI Backend API**: `http://localhost:8000` (API Docs: `http://localhost:8000/docs`)
- **React Web Dashboard**: `http://localhost:5173`

### 2. Loading the Browser Extension in Chrome / Edge / Brave

1. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/`).
2. Enable **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked**.
4. Select the `/home/blue/CIH/Guardra/extension` folder.
5. Guardra's shield badge will appear in your toolbar, rating every site you visit in real time!

---

## 🧪 Testing Features Walkthrough

1. **Real-Time Policy Rating**:
   - Open the web dashboard at `http://localhost:5173`.
   - Navigate to **Policy Analyzer**.
   - Test pre-cached or live Indian & global platforms (`swiggy.com`, `zomato.com`, `duckduckgo.com`, `meta.com`, `google.com`).
   - Observe the 6-pillar rubric breakdown and regional DPDP Act 2023 compliance status.
2. **Statutory Deletion Assistant**:
   - Navigate to **Data Rights & Deletion**.
   - Choose a platform or data broker (e.g. Swiggy or Acxiom).
   - Notice the statutory notice pre-filled with Section 12 legal citations, Grievance Officer email, and 30-day compliance timeline.
   - Click **Download PDF Notice** to generate a formatted legal notice.
   - Click **Record & Track Request** to monitor lifecycle status from `Sent` to `Resolved`.
3. **K-Anonymity Credential Audit**:
   - Navigate to **Breach & OSINT Check**.
   - Enter a test password to see the zero-knowledge SHA-1 prefix audit in action.
   - Enter an email to see affected data classes and remediation links.
4. **Privacy Control Hub**:
   - Navigate to **Privacy Control Hub**.
   - Use the direct deep-links to access Google Ad Center, Meta Off-Facebook settings, or X Grok training opt-outs with 1 click.
5. **Regulator Escalation**:
   - Navigate to **Regulator Escalation** to view official complaint drafts addressed to the **Data Protection Board of India (DPBI)** or EU DPAs when companies default on 30-day erasure notices.

---

## ⚖️ Ethical & Legal Guardrails

- **Zero Scraping Violations**: Public disclosures are obtained from standard legal notices; no automated account creation or bot signups are performed.
- **Zero-Knowledge Privacy**: No raw passwords or user credentials are ever transmitted or stored.
- **Privacy By Design**: Minimal database storage strictly restricted to local deletion request tracking.
