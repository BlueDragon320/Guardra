import React, { useState, useEffect } from "react";
import { 
  Search, 
  Mail, 
  ExternalLink 
} from "lucide-react";
import { getSiteRating, getCachedPolicies } from "../services/api";

export default function PolicyAnalyzer({ selectedDomain, onTriggerDeletion }) {
  const [inputUrl, setInputUrl] = useState(selectedDomain || "swiggy.com");
  const [rating, setRating] = useState(null);
  const [cachedList, setCachedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCachedPolicies().then(setCachedList).catch(() => {});
    if (selectedDomain) {
      setInputUrl(selectedDomain);
      handleAnalyze(selectedDomain);
    } else {
      handleAnalyze("swiggy.com");
    }
  }, [selectedDomain]);

  const handleAnalyze = async (domainToScan) => {
    const target = domainToScan || inputUrl;
    if (!target.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getSiteRating(target.trim());
      setRating(data);
    } catch (err) {
      setError("Could not analyze policy for this domain.");
    } finally {
      setLoading(false);
    }
  };

  const rubricLabels = {
    data_sharing: "Third-Party Data Sharing",
    retention: "Data Retention Limits",
    tracking_cookies: "Cookies & Tracker Density",
    user_rights: "User Rights & Erasure Flow",
    breach_history: "Breach History & Safeguards",
    readability: "Plain-Language Clarity"
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Privacy Policy Analysis</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Evaluate site privacy policies against DPDP Act 2023, GDPR, and data sharing standards.
        </p>
      </div>

      {/* Search Input & Quick Selectors */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-4 space-y-3 transition-colors">
        <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter domain (e.g. swiggy.com, meta.com, duckduckgo.com)..."
              className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md pl-8 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-2.5 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md text-xs font-medium transition-colors"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-100 dark:border-[#27272a]">
          <span className="text-[11px] text-zinc-500">Quick tests:</span>
          {["swiggy.com", "zomato.com", "duckduckgo.com", "meta.com", "google.com", "apple.com", "reddit.com"].map((dom) => (
            <button
              key={dom}
              onClick={() => {
                setInputUrl(dom);
                handleAnalyze(dom);
              }}
              className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                inputUrl === dom
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-400 dark:border-zinc-600"
                  : "bg-zinc-50 dark:bg-[#09090b] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-[#27272a] hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-zinc-100 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-800 dark:text-zinc-300 text-xs">
          {error}
        </div>
      )}

      {/* Analysis Results Display */}
      {rating && (
        <div className="space-y-5">
          {/* Main Verdict Card */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{rating.grade}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{rating.score}/100</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{rating.name}</h2>
                  <span className="text-xs font-mono text-zinc-500">({rating.domain})</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
                  {rating.summary}
                </p>
              </div>
            </div>

            <button
              onClick={() => onTriggerDeletion({
                domain: rating.domain,
                name: rating.name,
                grievance_email: rating.compliance?.dpdp?.grievance_email || rating.compliance?.gdpr?.dpo_contact || `privacy@${rating.domain}`
              })}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#18181b] dark:hover:bg-[#202024] border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Mail className="w-3.5 h-3.5" />
              Generate Notice
            </button>
          </div>

          {/* Regional Compliance Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* India DPDP */}
            <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg space-y-2 text-xs transition-colors">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">DPDP Act 2023 (India)</span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  {rating.compliance?.dpdp?.compliant ? "Disclosed" : "Undisclosed"}
                </span>
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-500">Officer: </span>
                <span className="text-zinc-800 dark:text-zinc-200">{rating.compliance?.dpdp?.grievance_officer || "Not listed"}</span>
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-500">Contact: </span>
                <span className="text-zinc-800 dark:text-zinc-200 font-mono">{rating.compliance?.dpdp?.grievance_email || "N/A"}</span>
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-500">SLA: </span>
                <span className="text-zinc-800 dark:text-zinc-200">{rating.compliance?.dpdp?.redressal_period_days || 30} Days</span>
              </div>
            </div>

            {/* EU GDPR */}
            <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg space-y-2 text-xs transition-colors">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">GDPR (EU)</span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  {rating.compliance?.gdpr?.compliant ? "Art. 17 Ready" : "Standard"}
                </span>
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-500">DPO: </span>
                <span className="text-zinc-800 dark:text-zinc-200 font-mono">{rating.compliance?.gdpr?.dpo_contact || "External Legal"}</span>
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-500">Erasure Rights: </span>
                <span className="text-zinc-800 dark:text-zinc-200">{rating.compliance?.gdpr?.erasure_art17_disclosed ? "Disclosed" : "Implied"}</span>
              </div>
            </div>

            {/* CCPA */}
            <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg space-y-2 text-xs transition-colors">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
                <span className="font-medium text-zinc-800 dark:text-zinc-200">CCPA (California)</span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  {rating.compliance?.ccpa?.compliant ? "Active" : "Standard"}
                </span>
              </div>
              <div className="text-zinc-500 dark:text-zinc-400">
                <span className="text-zinc-400 dark:text-zinc-500">Do-Not-Sell: </span>
                <span className="text-zinc-800 dark:text-zinc-200">{rating.compliance?.ccpa?.do_not_sell ? "Supported" : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* 6-Pillar Rubric Breakdown */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 space-y-3 transition-colors">
            <h3 className="text-xs font-medium text-zinc-800 dark:text-zinc-300">6-Pillar Rubric Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rating.rubric && Object.entries(rating.rubric).map(([key, item]) => (
                <div key={key} className="p-3 bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-md space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-800 dark:text-zinc-300">{rubricLabels[key] || key}</span>
                    <span className="font-mono text-zinc-500 dark:text-zinc-400">{item.score}/100</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-600 dark:bg-zinc-400" style={{ width: `${item.score}%` }} />
                  </div>
                  <p className="text-[11px] text-zinc-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Clauses */}
          {rating.key_clauses && rating.key_clauses.length > 0 && (
            <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 space-y-2 transition-colors">
              <h3 className="text-xs font-medium text-zinc-800 dark:text-zinc-300 mb-2">Identified Policy Clauses</h3>
              <div className="space-y-2">
                {rating.key_clauses.map((clause, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-md text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans"
                  >
                    "{clause.text}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
