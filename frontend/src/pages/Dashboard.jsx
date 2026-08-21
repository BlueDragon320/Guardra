import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ChevronRight, 
  Download, 
  Activity,
  Sliders,
  Shield,
  X 
} from "lucide-react";
import { 
  getFootprintData, 
  toggleFootprintAction, 
  getCachedPolicies, 
  getDeletionRequests, 
  triggerExtensionDownload,
  checkPasswordPwned,
  getLiveBrowserFeed
} from "../services/api";

export default function Dashboard({ setActiveTab, onScanDomain }) {
  const [footprint, setFootprint] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [requests, setRequests] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Workflow Modal State
  const [activeModalAction, setActiveModalAction] = useState(null);
  
  // Sub-states for specific modals
  const [totpChecked, setTotpChecked] = useState({ banking: false, email: false, passwordManager: false });
  const [aliasRecorded, setAliasRecorded] = useState("");
  const [googleToggles, setGoogleToggles] = useState({ adCenter: false, locationHistory: false, voiceRecords: false });
  const [metaToggles, setMetaToggles] = useState({ offFacebook: false, partnerData: false });
  const [brokerSuppressed, setBrokerSuppressed] = useState({ acxiom: false, whitepages: false, lexisnexis: false });
  const [testPassword, setTestPassword] = useState("");
  const [pwdResult, setPwdResult] = useState(null);
  const [testingPwd, setTestingPwd] = useState(false);

  useEffect(() => {
    loadData();
    // Poll live browser feed from extension every 2.5s
    const interval = setInterval(() => {
      getLiveBrowserFeed().then(setLiveFeed).catch(() => {});
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fp, pols, reqs, feed] = await Promise.all([
        getFootprintData(),
        getCachedPolicies(),
        getDeletionRequests(),
        getLiveBrowserFeed()
      ]);
      setFootprint(fp);
      setPolicies(pols.slice(0, 6));
      setRequests(reqs);
      setLiveFeed(feed);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    setActiveModalAction(action);
  };

  const completeAction = async (actionId) => {
    try {
      const isAlreadyCompleted = footprint?.actions?.find(a => a.id === actionId)?.completed;
      if (!isAlreadyCompleted) {
        const updated = await toggleFootprintAction(actionId);
        setFootprint(updated);
      }
      setActiveModalAction(null);
    } catch (e) {
      console.error("Failed to complete action", e);
    }
  };

  const handleUnmark = async (actionId) => {
    try {
      const updated = await toggleFootprintAction(actionId);
      setFootprint(updated);
      setActiveModalAction(null);
    } catch (e) {
      console.error("Failed to unmark action", e);
    }
  };

  const handleTestPwd = async (e) => {
    e.preventDefault();
    if (!testPassword) return;
    setTestingPwd(true);
    try {
      const res = await checkPasswordPwned(testPassword);
      setPwdResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTestingPwd(false);
    }
  };

  if (loading && !footprint) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-xs text-zinc-500 font-mono">Loading...</div>
      </div>
    );
  }

  const score = footprint?.score || 52;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Guardra Privacy Suite
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time policy ratings, automated cookie rejection, and statutory data erasure.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleActionClick({ id: "install_extension", title: "Install Guardra Extension" })}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Install Extension
          </button>
          <button
            onClick={() => setActiveTab("policy-analyzer")}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#18181b] dark:hover:bg-[#202024] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-zinc-300 rounded-md text-xs font-medium transition-colors"
          >
            Scan Policy
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Privacy Score Card */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Verified Hygiene Score</span>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{footprint?.completed_count}/{footprint?.total_actions} Completed</span>
            </div>

            <div className="my-3">
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                {score}<span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">/100</span>
              </div>
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                {footprint?.level}
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-100 dark:border-[#27272a] leading-relaxed">
              {footprint?.recommendation}
            </p>
          </div>
        </div>

        {/* Action Checklist */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 lg:col-span-2 space-y-3 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
            <div>
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Verified Hygiene Checklist</span>
              <span className="text-[11px] text-zinc-400 block">Click any item to open its interactive verification workflow</span>
            </div>
            <button 
              onClick={() => setActiveTab("control-hub")}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1"
            >
              Platform Hub <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {footprint?.actions.map((act) => (
              <div
                key={act.id}
                onClick={() => handleActionClick(act)}
                className={`p-2.5 rounded-md border cursor-pointer transition-colors flex items-start gap-2.5 ${
                  act.completed
                    ? "bg-zinc-50 dark:bg-[#18181b] border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                    : "bg-white dark:bg-[#09090b] border-zinc-200 dark:border-[#27272a] hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-800 dark:text-zinc-300"
                }`}
              >
                <div className="mt-0.5 text-zinc-500">
                  {act.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${act.completed ? "line-through text-zinc-400 dark:text-zinc-500" : "text-zinc-800 dark:text-zinc-200"}`}>
                      {act.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">+{act.points}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Browser Telemetry & Automated Actions Feed */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 space-y-3 transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Live Chromium Activity & Automated Actions</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Extension Sync Active</span>
        </div>

        {liveFeed.length === 0 ? (
          <div className="text-center py-5 text-xs text-zinc-500 bg-zinc-50 dark:bg-[#09090b] rounded-md border border-zinc-200 dark:border-[#27272a]">
            Navigate around websites in Chromium to see live tracker detections and automated cookie rejections.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {liveFeed.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-2 bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-400">{item.timestamp}</span>
                  <div>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.domain}</span>
                    <span className="text-[11px] text-zinc-500 ml-2">
                      {item.auto_actions && item.auto_actions.length > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">⚡ {item.auto_actions.join("; ")}</span>
                      ) : (
                        item.details
                      )}
                    </span>
                  </div>
                </div>
                {item.trackers_blocked > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {item.trackers_blocked} Trackers
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Second Row: Policies & Deletions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scanned Sites */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 space-y-3 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Scanned Policies</span>
            <button
              onClick={() => setActiveTab("policy-analyzer")}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {policies.map((site) => (
              <div
                key={site.domain}
                onClick={() => onScanDomain(site.domain)}
                className="p-2.5 bg-zinc-50 dark:bg-[#09090b] hover:bg-zinc-100 dark:hover:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] hover:border-zinc-400 dark:hover:border-zinc-600 rounded-md transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-xs font-bold flex items-center justify-center">
                    {site.grade}
                  </span>
                  <div>
                    <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{site.name}</div>
                    <div className="text-[10px] font-mono text-zinc-500">{site.domain}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {site.compliance?.dpdp?.compliant ? "DPDP Officer" : "No DPO"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deletion Tracker */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 flex flex-col justify-between space-y-3 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a] mb-3">
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Erasure Requests</span>
              <button
                onClick={() => setActiveTab("deletion-assistant")}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-8 bg-zinc-50 dark:bg-[#09090b] rounded-md border border-zinc-200 dark:border-[#27272a] text-xs text-zinc-500">
                No active erasure requests logged.
              </div>
            ) : (
              <div className="space-y-1.5">
                {requests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-2.5 bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-md flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">{req.site_name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{req.grievance_email}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-[#27272a] flex items-center justify-between text-[11px] text-zinc-500">
            <span>Escalation: Data Protection Board of India</span>
            <button 
              onClick={() => setActiveTab("regulators")}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:underline"
            >
              Directory &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE WORKFLOW MODALS FOR GENUINE PROCESS COMPLETION               */}
      {/* ========================================================================= */}
      {activeModalAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121215] border border-zinc-300 dark:border-[#27272a] rounded-lg max-w-lg w-full p-5 space-y-4 shadow-xl text-zinc-900 dark:text-zinc-100 transition-colors">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#27272a]">
              <div>
                <h3 className="text-sm font-semibold">{activeModalAction.title}</h3>
                <span className="text-[11px] text-zinc-500">Interactive Verification Workflow</span>
              </div>
              <button 
                onClick={() => setActiveModalAction(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. EXTENSION INSTALLATION WORKFLOW */}
            {activeModalAction.id === "install_extension" && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Complete these steps to install and verify the Guardra browser extension in Chromium:
                </p>
                <div className="space-y-2 bg-zinc-50 dark:bg-[#09090b] p-3 rounded border border-zinc-200 dark:border-[#27272a]">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-zinc-500">1.</span>
                    <div className="flex-1">
                      <span>Download the extension ZIP package.</span>
                      <div className="mt-1">
                        <button
                          onClick={() => triggerExtensionDownload("https://google.com")}
                          className="px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded text-[11px] font-medium flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download guardra-extension.zip
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-zinc-200 dark:border-[#27272a]">
                    <span className="font-mono text-zinc-500">2.</span>
                    <div>
                      Unzip the file, open <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">chrome://extensions</code> in Chromium, enable <b>Developer mode</b>, and click <b>Load unpacked</b>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-zinc-200 dark:border-[#27272a]">
                    <span className="font-mono text-zinc-500">3.</span>
                    <div>
                      Verify the shield badge appears in your browser toolbar.
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {footprint?.actions?.find(a => a.id === "install_extension")?.completed ? (
                    <button
                      onClick={() => handleUnmark("install_extension")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Unmark as completed
                    </button>
                  ) : <div />}
                  <button
                    onClick={() => completeAction("install_extension")}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium"
                  >
                    I Have Loaded the Extension &rarr; Complete
                  </button>
                </div>
              </div>
            )}

            {/* 2. TOTP / 2FA VERIFICATION WORKFLOW */}
            {activeModalAction.id === "enable_2fa" && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Hardware keys and Authenticator apps (TOTP) protect your core accounts from credential stuffing and SIM-swapping.
                </p>
                <div className="space-y-2 bg-zinc-50 dark:bg-[#09090b] p-3 rounded border border-zinc-200 dark:border-[#27272a]">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 block mb-1">Verify 2FA enabled on:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={totpChecked.banking}
                      onChange={(e) => setTotpChecked({ ...totpChecked, banking: e.target.checked })}
                      className="rounded border-zinc-400"
                    />
                    <span>Primary Banking & Payment Accounts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={totpChecked.email}
                      onChange={(e) => setTotpChecked({ ...totpChecked, email: e.target.checked })}
                      className="rounded border-zinc-400"
                    />
                    <span>Primary Email Accounts (Google, Proton, Apple ID)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={totpChecked.passwordManager}
                      onChange={(e) => setTotpChecked({ ...totpChecked, passwordManager: e.target.checked })}
                      className="rounded border-zinc-400"
                    />
                    <span>Password Vault Master Account (Bitwarden / 1Password)</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {footprint?.actions?.find(a => a.id === "enable_2fa")?.completed ? (
                    <button
                      onClick={() => handleUnmark("enable_2fa")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Unmark
                    </button>
                  ) : <div />}
                  <button
                    disabled={!totpChecked.banking && !totpChecked.email && !totpChecked.passwordManager}
                    onClick={() => completeAction("enable_2fa")}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium disabled:opacity-50"
                  >
                    Confirm 2FA Enabled &rarr; Complete
                  </button>
                </div>
              </div>
            )}

            {/* 3. EMAIL COMPARTMENTALIZATION WORKFLOW */}
            {activeModalAction.id === "setup_email_alias" && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Email masking replaces your primary inbox on e-commerce and subscription platforms with disposable aliases.
                </p>
                <div className="space-y-2 bg-zinc-50 dark:bg-[#09090b] p-3 rounded border border-zinc-200 dark:border-[#27272a]">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 block mb-1">Pick a provider & create an alias:</span>
                  <div className="flex gap-2">
                    <a
                      href="https://relay.firefox.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1 px-2 text-center bg-zinc-200 dark:bg-zinc-800 rounded text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
                    >
                      Firefox Relay &rarr;
                    </a>
                    <a
                      href="https://simplelogin.io"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1 px-2 text-center bg-zinc-200 dark:bg-zinc-800 rounded text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
                    >
                      SimpleLogin &rarr;
                    </a>
                    <a
                      href="https://duckduckgo.com/email"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1 px-2 text-center bg-zinc-200 dark:bg-zinc-800 rounded text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
                    >
                      DuckDuckGo &rarr;
                    </a>
                  </div>
                  <div className="pt-2">
                    <label className="text-[11px] text-zinc-500 block mb-1">Enter your generated alias (e.g. shop.x9@mozmail.com):</label>
                    <input
                      type="text"
                      value={aliasRecorded}
                      onChange={(e) => setAliasRecorded(e.target.value)}
                      placeholder="shop.alias@relay.firefox.com"
                      className="w-full bg-white dark:bg-[#121215] border border-zinc-300 dark:border-[#27272a] rounded px-2 py-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {footprint?.actions?.find(a => a.id === "setup_email_alias")?.completed ? (
                    <button
                      onClick={() => handleUnmark("setup_email_alias")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Unmark
                    </button>
                  ) : <div />}
                  <button
                    disabled={!aliasRecorded.trim()}
                    onClick={() => completeAction("setup_email_alias")}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium disabled:opacity-50"
                  >
                    Confirm Alias Setup &rarr; Complete
                  </button>
                </div>
              </div>
            )}

            {/* 4. GOOGLE OPTOUT WORKFLOW */}
            {activeModalAction.id === "optout_google" && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Open Google settings portals to disable ad personalization and location history tracking:
                </p>
                <div className="space-y-2 bg-zinc-50 dark:bg-[#09090b] p-3 rounded border border-zinc-200 dark:border-[#27272a]">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={googleToggles.adCenter}
                        onChange={(e) => setGoogleToggles({ ...googleToggles, adCenter: e.target.checked })}
                      />
                      <span>Turn off Personalized Ads</span>
                    </label>
                    <a href="https://myadcenter.google.com/controls" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-0.5 text-[11px]">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-[#27272a]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={googleToggles.locationHistory}
                        onChange={(e) => setGoogleToggles({ ...googleToggles, locationHistory: e.target.checked })}
                      />
                      <span>Pause Location History / Timeline</span>
                    </label>
                    <a href="https://myactivity.google.com/locationhistory" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-0.5 text-[11px]">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {footprint?.actions?.find(a => a.id === "optout_google")?.completed ? (
                    <button
                      onClick={() => handleUnmark("optout_google")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Unmark
                    </button>
                  ) : <div />}
                  <button
                    disabled={!googleToggles.adCenter && !googleToggles.locationHistory}
                    onClick={() => completeAction("optout_google")}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium disabled:opacity-50"
                  >
                    Confirm Opt-Outs Executed &rarr; Complete
                  </button>
                </div>
              </div>
            )}

            {/* 5. META OPTOUT WORKFLOW */}
            {activeModalAction.id === "optout_meta" && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Disconnect third-party websites and apps from transmitting browsing events to Meta:
                </p>
                <div className="space-y-2 bg-zinc-50 dark:bg-[#09090b] p-3 rounded border border-zinc-200 dark:border-[#27272a]">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metaToggles.offFacebook}
                        onChange={(e) => setMetaToggles({ ...metaToggles, offFacebook: e.target.checked })}
                      />
                      <span>Clear & Disconnect Off-Facebook Activity</span>
                    </label>
                    <a href="https://accountscenter.facebook.com/info_and_permissions/off_facebook_activity" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-0.5 text-[11px]">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-[#27272a]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metaToggles.partnerData}
                        onChange={(e) => setMetaToggles({ ...metaToggles, partnerData: e.target.checked })}
                      />
                      <span>Set Partner Data Targeting to Not Allowed</span>
                    </label>
                    <a href="https://accountscenter.facebook.com/ad_preferences" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-0.5 text-[11px]">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {footprint?.actions?.find(a => a.id === "optout_meta")?.completed ? (
                    <button
                      onClick={() => handleUnmark("optout_meta")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Unmark
                    </button>
                  ) : <div />}
                  <button
                    disabled={!metaToggles.offFacebook && !metaToggles.partnerData}
                    onClick={() => completeAction("optout_meta")}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium disabled:opacity-50"
                  >
                    Confirm Meta Opt-Out &rarr; Complete
                  </button>
                </div>
              </div>
            )}

            {/* 6. DATA BROKER SUPPRESSION WORKFLOW */}
            {activeModalAction.id === "optout_data_brokers" && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Suppress your personal records at major consumer data aggregators:
                </p>
                <div className="space-y-2 bg-zinc-50 dark:bg-[#09090b] p-3 rounded border border-zinc-200 dark:border-[#27272a]">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brokerSuppressed.acxiom}
                        onChange={(e) => setBrokerSuppressed({ ...brokerSuppressed, acxiom: e.target.checked })}
                      />
                      <span>Acxiom Opt-Out Form Submitted</span>
                    </label>
                    <a href="https://isapps.acxiom.com/optout/optout.aspx" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-0.5 text-[11px]">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-[#27272a]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brokerSuppressed.whitepages}
                        onChange={(e) => setBrokerSuppressed({ ...brokerSuppressed, whitepages: e.target.checked })}
                      />
                      <span>Whitepages Suppression Request</span>
                    </label>
                    <a href="https://www.whitepages.com/suppression-requests" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-0.5 text-[11px]">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {footprint?.actions?.find(a => a.id === "optout_data_brokers")?.completed ? (
                    <button
                      onClick={() => handleUnmark("optout_data_brokers")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Unmark
                    </button>
                  ) : <div />}
                  <button
                    disabled={!brokerSuppressed.acxiom && !brokerSuppressed.whitepages}
                    onClick={() => completeAction("optout_data_brokers")}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium disabled:opacity-50"
                  >
                    Confirm Broker Suppressions &rarr; Complete
                  </button>
                </div>
              </div>
            )}

            {/* 7. PASSWORDS AUDIT WORKFLOW */}
            {activeModalAction.id === "passwords_secured" && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Run a live zero-knowledge K-Anonymity check on your passwords to ensure zero breach occurrences:
                </p>
                <form onSubmit={handleTestPwd} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      placeholder="Enter a password to audit..."
                      className="flex-1 bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded px-2.5 py-1.5 text-xs font-mono"
                    />
                    <button
                      type="submit"
                      disabled={testingPwd || !testPassword}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium"
                    >
                      {testingPwd ? "Auditing..." : "Audit"}
                    </button>
                  </div>
                </form>

                {pwdResult && (
                  <div className="p-2.5 bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{pwdResult.pwned ? "Compromised Password" : "Clean & Secure Password"}</span>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{pwdResult.message}</p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  {footprint?.actions?.find(a => a.id === "passwords_secured")?.completed ? (
                    <button
                      onClick={() => handleUnmark("passwords_secured")}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Unmark
                    </button>
                  ) : <div />}
                  <button
                    onClick={() => completeAction("passwords_secured")}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium"
                  >
                    Confirm Credentials Audited &rarr; Complete
                  </button>
                </div>
              </div>
            )}

            {/* 8. DELETION RESOLUTION WORKFLOW */}
            {activeModalAction.id === "resolved_deletion" && (
              <div className="space-y-3 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Exercise statutory data erasure under Section 12 of the DPDP Act 2023 or GDPR Article 17:
                </p>
                <div className="p-3 bg-zinc-50 dark:bg-[#09090b] rounded border border-zinc-200 dark:border-[#27272a] space-y-2">
                  <div className="text-zinc-700 dark:text-zinc-300">
                    Active requests in database: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{requests.length}</span>
                  </div>
                  {requests.length === 0 ? (
                    <p className="text-[11px] text-zinc-500">
                      You haven't generated any statutory deletion requests yet. Go to Data Erasure to generate a formal notice for Swiggy, Zomato, or any custom platform.
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Active statutory deletion requests detected in database.
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveModalAction(null);
                      setActiveTab("deletion-assistant");
                    }}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline flex items-center gap-1"
                  >
                    Open Deletion Assistant &rarr;
                  </button>
                  <button
                    onClick={() => completeAction("resolved_deletion")}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded text-xs font-medium"
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
