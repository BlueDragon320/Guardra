import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function EducationHub() {
  const [openModule, setOpenModule] = useState(0);

  const modules = [
    {
      id: "brokers",
      title: "1. Data Broker Ecosystem",
      summary: "How secondary consumer data accumulators build and monetize personal profiles.",
      content: `Data brokers (such as Acxiom, LexisNexis, and Experian) acquire information from mobile SDK telemetry, public court filings, credit bureaus, and real-time ad exchanges.

Mechanics:
• Cross-Device Linking: Brokers associate your IP address, device IDs, and hashed emails into a persistent Master Person Index.
• Profiling: Users are grouped into commercial segments for credit propensity scoring, insurance risk modeling, and targeted advertising.`
    },
    {
      id: "targeting",
      title: "2. Real-Time Bidding (RTB) Auctions",
      summary: "Telemetry broadcast mechanics during website page loads.",
      content: `When a web page loads, scripts broadcast device fingerprints, location data, and browsing context to demand-side ad platforms within 100 milliseconds.

Even when an ad bidder loses an auction, they often retain the broadcast telemetry to update existing shadow profiles.`
    },
    {
      id: "dpdp_law",
      title: "3. India DPDP Act 2023 Provisions",
      summary: "Statutory rights under the Digital Personal Data Protection Act, 2023.",
      content: `The DPDP Act 2023 establishes legal rights for Data Principals in India:

• Section 6(4): Right to withdraw consent with the same ease with which it was given.
• Section 12: Right to correction, completion, updating, and erasure of personal data.
• Section 13: Right of Grievance Redressal before an in-house Grievance Officer within 30 days.
• Section 13(3): Right to escalate unresolved grievances directly to the Data Protection Board of India (DPBI).`
    },
    {
      id: "stack",
      title: "4. Recommended Privacy Tools",
      summary: "Open-source tools to replace tracking-heavy defaults.",
      content: `Recommended tools:

• Browser: Mozilla Firefox (Strict Protection) or LibreWolf / Brave.
• Content Blocker: uBlock Origin.
• Encrypted DNS: NextDNS or Quad9.
• Password Manager: Bitwarden or KeePassXC.
• Search: DuckDuckGo or Brave Search.
• Mail: Proton Mail.`
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Privacy Education</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Plain-language documentation on tracking mechanics and statutory legal rights.
        </p>
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {modules.map((m, idx) => {
          const isOpen = openModule === idx;
          return (
            <div
              key={m.id}
              className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg overflow-hidden transition-colors shadow-sm"
            >
              <button
                onClick={() => setOpenModule(isOpen ? -1 : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#18181b] transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{m.title}</div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-500 mt-0.5">{m.summary}</div>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-zinc-100 dark:border-[#27272a] text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
