import React from "react";
import { 
  UserCheck, 
  ExternalLink, 
  CheckCircle2 
} from "lucide-react";

export default function IdentityWizard() {
  const tiers = [
    {
      id: "tier1",
      tier: "Tier 1: Core & Sensitive",
      badge: "High Security",
      description: "Banking, income tax, government IDs, and primary password manager master access.",
      rules: [
        "Dedicated unshared email (e.g. Proton Mail / encrypted mailbox)",
        "Hardware security key or TOTP authenticator app",
        "Never use for commercial e-commerce or social signups"
      ],
      targets: ["Banking", "Government / DigiLocker", "Password Vault"]
    },
    {
      id: "tier2",
      tier: "Tier 2: Professional",
      badge: "Work Identity",
      description: "GitHub source repositories, professional development, and corporate communication.",
      rules: [
        "Work domain or professional custom email",
        "2FA enabled, restrict third-party OAuth apps"
      ],
      targets: ["GitHub / GitLab", "LinkedIn", "Work Communication"]
    },
    {
      id: "tier3",
      tier: "Tier 3: Shopping & Delivery",
      badge: "Commercial",
      description: "Food delivery, quick commerce, and streaming platforms that frequently share telemetry.",
      rules: [
        "Masked email aliases (Firefox Relay or SimpleLogin)",
        "Revoke alias if service experiences a breach"
      ],
      targets: ["Swiggy / Zomato", "Amazon / Flipkart", "Streaming"]
    },
    {
      id: "tier4",
      tier: "Tier 4: Disposable",
      badge: "Ephemeral",
      description: "One-off downloads, forum signups, promotional newsletter trials.",
      rules: [
        "Throwaway email alias (@duck.com or temporary email)",
        "Never reuse credentials"
      ],
      targets: ["Forums / Reddit", "Promotions", "Trials"]
    }
  ];

  const aliasProviders = [
    {
      name: "Firefox Relay",
      provider: "Mozilla",
      features: "Free email masks, forwards to primary inbox, blocks email trackers.",
      url: "https://relay.firefox.com"
    },
    {
      name: "SimpleLogin",
      provider: "Proton",
      features: "Open-source, unlimited aliases with Proton Pass, PGP support.",
      url: "https://simplelogin.io"
    },
    {
      name: "DuckDuckGo Email Protection",
      provider: "DuckDuckGo",
      features: "Free @duck.com aliases, strips ad tracking pixels.",
      url: "https://duckduckgo.com/email"
    },
    {
      name: "Apple Hide My Email",
      provider: "Apple",
      features: "Built into iOS/macOS Safari, creates unique iCloud masks.",
      url: "https://support.apple.com/HT210425"
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Identity Compartmentalization</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Separate your digital identity into 4 distinct tiers to prevent cross-site profile correlation.
        </p>
      </div>

      {/* 4-Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiers.map((t) => (
          <div key={t.id} className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-4 space-y-3 transition-colors shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{t.tier}</span>
              <span className="text-[10px] font-mono text-zinc-500">{t.badge}</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t.description}
            </p>

            <ul className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
              {t.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-zinc-400 dark:text-zinc-500 font-mono">-</span>
                  <span className="leading-snug">{r}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-zinc-100 dark:border-[#27272a] flex flex-wrap gap-1">
              {t.targets.map((tgt, i) => (
                <span key={i} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-[#09090b] text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-[#27272a]">
                  {tgt}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Alias Providers */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-4 space-y-3 transition-colors shadow-sm">
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Recommended Email Masking Providers</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {aliasProviders.map((prov, i) => (
            <div key={i} className="p-3 bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-md flex flex-col justify-between space-y-2 text-xs">
              <div>
                <div className="font-medium text-zinc-900 dark:text-zinc-200">{prov.name}</div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">{prov.features}</p>
              </div>

              <a
                href={prov.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1 bg-white dark:bg-[#121215] hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-zinc-300 text-[11px] rounded text-center block transition-colors"
              >
                Website &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
