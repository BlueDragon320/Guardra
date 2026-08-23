import React, { useState, useEffect } from "react";
import { 
  Database, 
  Search, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Shield, 
  Cookie, 
  Activity, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Sliders, 
  Server,
  Filter,
  ArrowUpDown,
  Lock,
  Unlock,
  EyeOff
} from "lucide-react";
import { 
  getAdminStats, 
  getAdminWebsites, 
  getWebsiteDetail, 
  addAdminWebsite, 
  rescanWebsite, 
  deleteAdminWebsite, 
  updateWebsiteCookies,
  getGlobalCookieRules,
  createGlobalCookieRule,
  deleteGlobalCookieRule,
  refreshTop5000,
  getTop5000Status,
  getAdminAuditLog
} from "../services/api";

export default function AdminDashboard({ onScanDomain }) {
  const [activeSubTab, setActiveSubTab] = useState("websites"); // "websites" | "cookies" | "top5000" | "audit"
  const [stats, setStats] = useState(null);
  const [backendConnected, setBackendConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Websites table state
  const [websites, setWebsites] = useState([]);
  const [totalWebsites, setTotalWebsites] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("overall_score");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals & details
  const [selectedSite, setSelectedSite] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Web Service");
  const [addingSite, setAddingSite] = useState(false);

  // Global cookie rules
  const [cookieRules, setCookieRules] = useState([]);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRulePattern, setNewRulePattern] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState("analytics");
  const [newRuleAction, setNewRuleAction] = useState("block");
  const [newRuleDesc, setNewRuleDesc] = useState("");

  // Top 5000 pipeline
  const [topStatus, setTopStatus] = useState(null);
  const [refreshingTop, setRefreshingTop] = useState(false);

  // Audit log
  const [auditLogs, setAuditLogs] = useState([]);

  // Load initial stats & website directory
  useEffect(() => {
    loadStats();
    loadWebsites();
  }, [page, sortBy, sortOrder, gradeFilter, categoryFilter, sourceFilter]);

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadWebsites();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load active tab data
  useEffect(() => {
    if (activeSubTab === "cookies") loadCookieRules();
    if (activeSubTab === "top5000") loadTopStatus();
    if (activeSubTab === "audit") loadAuditLogs();
  }, [activeSubTab]);

  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
      setBackendConnected(true);
    } catch (err) {
      console.error(err);
      setBackendConnected(false);
    }
  };

  const loadWebsites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminWebsites({
        page,
        pageSize,
        sortBy,
        sortOrder,
        gradeFilter: gradeFilter || undefined,
        categoryFilter: categoryFilter || undefined,
        sourceFilter: sourceFilter || undefined,
        search: search || undefined
      });
      setWebsites(data?.items || []);
      setTotalWebsites(data?.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load websites");
    } finally {
      setLoading(false);
    }
  };

  const loadCookieRules = async () => {
    try {
      const data = await getGlobalCookieRules();
      setCookieRules(data || []);
    } catch (err) {
      console.error(err);
      setCookieRules([]);
    }
  };

  const loadTopStatus = async () => {
    try {
      const data = await getTop5000Status();
      setTopStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await getAdminAuditLog(1, 50);
      setAuditLogs(data?.items || []);
    } catch (err) {
      console.error(err);
      setAuditLogs([]);
    }
  };

  const handleOpenDetail = async (domain) => {
    try {
      setDetailLoading(true);
      const data = await getWebsiteDetail(domain);
      setSelectedSite(data);
    } catch (err) {
      alert("Error loading site details: " + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRescan = async (domain) => {
    try {
      await rescanWebsite(domain);
      loadStats();
      loadWebsites();
      if (selectedSite && selectedSite.domain === domain) {
        handleOpenDetail(domain);
      }
    } catch (err) {
      alert("Error rescanning site: " + err.message);
    }
  };

  const handleDeleteSite = async (domain) => {
    if (!window.confirm(`Are you sure you want to delete ${domain} from the database?`)) return;
    try {
      await deleteAdminWebsite(domain);
      if (selectedSite && selectedSite.domain === domain) {
        setSelectedSite(null);
      }
      loadStats();
      loadWebsites();
    } catch (err) {
      alert("Error deleting site: " + err.message);
    }
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    try {
      setAddingSite(true);
      await addAdminWebsite({
        domain: newDomain.trim(),
        name: newName.trim() || undefined,
        category: newCategory
      });
      setNewDomain("");
      setNewName("");
      setShowAddModal(false);
      loadStats();
      loadWebsites();
    } catch (err) {
      alert("Error adding website: " + err.message);
    } finally {
      setAddingSite(false);
    }
  };

  const handleCookieActionToggle = async (cookieName, newAction) => {
    if (!selectedSite) return;
    try {
      const currentPrefs = selectedSite.cookie_preferences || [];
      const updatedPrefs = [
        ...currentPrefs.filter(p => p.cookie_name !== cookieName),
        { cookie_name: cookieName, action: newAction }
      ];
      await updateWebsiteCookies(selectedSite.domain, updatedPrefs);
      handleOpenDetail(selectedSite.domain);
    } catch (err) {
      alert("Error updating cookie preference: " + err.message);
    }
  };

  const handleCreateCookieRule = async (e) => {
    e.preventDefault();
    if (!newRulePattern.trim()) return;
    try {
      await createGlobalCookieRule({
        cookie_pattern: newRulePattern.trim(),
        cookie_category: newRuleCategory,
        default_action: newRuleAction,
        description: newRuleDesc.trim() || undefined
      });
      setShowAddRuleModal(false);
      setNewRulePattern("");
      setNewRuleDesc("");
      loadCookieRules();
    } catch (err) {
      alert("Error adding rule: " + err.message);
    }
  };

  const handleDeleteCookieRule = async (ruleId) => {
    try {
      await deleteGlobalCookieRule(ruleId);
      loadCookieRules();
    } catch (err) {
      alert("Error deleting rule: " + err.message);
    }
  };

  const handleTriggerTop5000 = async () => {
    try {
      setRefreshingTop(true);
      await refreshTop5000();
      loadTopStatus();
    } catch (err) {
      alert("Pipeline: " + err.message);
    } finally {
      setRefreshingTop(false);
    }
  };

  const getGradeBadge = (grade, score, color) => {
    let bg = "bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700";
    if (grade?.startsWith("A")) bg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    else if (grade?.startsWith("B")) bg = "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30";
    else if (grade?.startsWith("C")) bg = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    else if (grade?.startsWith("D")) bg = "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
    else if (grade?.startsWith("F")) bg = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30";

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${bg}`}>
        <span>{grade || "N/A"}</span>
        {score !== undefined && <span className="text-[10px] opacity-75">({Math.round(score)})</span>}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Connection Status Banner */}
      {!backendConnected ? (
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 px-4 py-3 rounded-md text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🟠</span>
            <span className="font-medium">Standalone / Offline Mode (Start backend on port 8000 for live pipeline)</span>
          </div>
          <button onClick={() => { loadStats(); loadWebsites(); }} className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors">
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-md text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🟢</span>
            <span className="font-medium">Live Backend Connected</span>
          </div>
          <button onClick={() => { loadStats(); loadWebsites(); }} className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded transition-colors flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#27272a]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            Admin Intelligence & Control Hub
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage analyzed websites, live score calibrations, automated cookie blocking & 5,000 top domains dataset.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stats?.is_fallback ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" title="Backend on port 8000 offline. Running in standalone fallback mode.">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Standalone / Offline Mode</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Live Server Connected</span>
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Website</span>
          </button>
          <button
            onClick={() => { loadStats(); loadWebsites(); }}
            className="p-1.5 bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-300 dark:border-zinc-700 transition-colors"
            title="Refresh All Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
              <span>Websites in DB</span>
              <Server className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.total_websites}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {stats.total_top_5000} top-ranked domains
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
              <span>Average Privacy Score</span>
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.avg_score} <span className="text-xs font-normal text-zinc-500">/ 100</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Across all stored policies</div>
          </div>

          <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
              <span>Grade Distribution</span>
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {Object.entries(stats.grade_distribution || {}).map(([grade, count]) => (
                <span key={grade} className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700">
                  <strong className="text-zinc-900 dark:text-zinc-100">{grade}:</strong> {count}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs">
              <span>Ingestion Sources</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1 mt-1 font-mono">
              {Object.entries(stats.source_distribution || {}).map(([src, count]) => (
                <div key={src} className="flex justify-between">
                  <span className="capitalize">{src}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-[#27272a] gap-2">
        <button
          onClick={() => setActiveSubTab("websites")}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === "websites"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Websites Directory ({totalWebsites})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("cookies")}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === "cookies"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Cookie className="w-3.5 h-3.5" />
          <span>Global Cookie Rules ({cookieRules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("top5000")}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === "top5000"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Top 5,000 Pipeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab("audit")}
          className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeSubTab === "audit"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Websites Table */}
      {activeSubTab === "websites" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-[#121215] p-3 rounded-lg border border-zinc-200 dark:border-[#27272a]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search domain or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Grades</option>
              <option value="A+">Grade A+</option>
              <option value="A">Grade A</option>
              <option value="B+">Grade B+</option>
              <option value="B">Grade B</option>
              <option value="C+">Grade C+</option>
              <option value="C">Grade C</option>
              <option value="D+">Grade D+</option>
              <option value="D">Grade D</option>
              <option value="F">Grade F</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300"
            >
              <option value="">All Ingestion Sources</option>
              <option value="cached">Pre-cached</option>
              <option value="auto_scan">Auto-Scanned (Extension)</option>
              <option value="admin">Admin Added</option>
              <option value="top_list">Top 5,000 Dataset</option>
            </select>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 py-1.5 px-2 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300"
              >
                <option value="overall_score">Sort by Score</option>
                <option value="domain">Sort by Domain</option>
                <option value="last_analyzed_at">Sort by Date</option>
                <option value="scan_count">Sort by Scan Count</option>
              </select>

              <button
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                className="p-1.5 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-md text-xs font-mono"
                title="Toggle sort order"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-[#18181b] border-b border-zinc-200 dark:border-[#27272a] text-zinc-500 dark:text-zinc-400 font-medium select-none">
                  <tr>
                    <th className="px-4 py-2.5">Website / Domain</th>
                    <th className="px-3 py-2.5">Privacy Grade</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Source</th>
                    <th className="px-3 py-2.5">Scans</th>
                    <th className="px-3 py-2.5">Last Analyzed</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-[#27272a]">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-zinc-500">
                        <RefreshCw className="w-4 h-4 animate-spin inline mr-2 text-indigo-500" />
                        Loading websites data...
                      </td>
                    </tr>
                  ) : (websites || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-zinc-500">
                        No websites match your filter.
                      </td>
                    </tr>
                  ) : (
                    (websites || []).map((site) => (
                      <tr key={site.domain} className="hover:bg-zinc-50 dark:hover:bg-[#18181b] transition-colors">
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => handleOpenDetail(site.domain)}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left flex items-center gap-1.5 group"
                          >
                            <span>{site.name || site.domain}</span>
                            <span className="text-[11px] font-normal text-zinc-400 font-mono">({site.domain})</span>
                            <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          {getGradeBadge(site.grade, site.overall_score, site.grade_color)}
                        </td>
                        <td className="px-3 py-2.5 text-zinc-600 dark:text-zinc-400">
                          {site.category || "General"}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 capitalize">
                            {site.source || "manual"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-zinc-500">
                          {site.scan_count || 1}
                        </td>
                        <td className="px-3 py-2.5 text-zinc-500 font-mono text-[11px]">
                          {site.last_analyzed_at ? site.last_analyzed_at.slice(0, 10) : "N/A"}
                        </td>
                        <td className="px-4 py-2.5 text-right space-x-1">
                          <button
                            onClick={() => handleOpenDetail(site.domain)}
                            className="p-1 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="View Full Scoring & Cookie Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRescan(site.domain)}
                            className="p-1 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            title="Force Live Rescan"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSite(site.domain)}
                            className="p-1 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete Website"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b] flex items-center justify-between text-xs text-zinc-500">
              <span>Showing {(websites || []).length} of {totalWebsites} websites</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="font-mono">Page {page} of {Math.max(1, Math.ceil(totalWebsites / pageSize))}</span>
                <button
                  disabled={page >= Math.ceil(totalWebsites / pageSize)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Global Cookie Rules */}
      {activeSubTab === "cookies" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-[#121215] p-3 rounded-lg border border-zinc-200 dark:border-[#27272a]">
            <div>
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Global Tracker & Cookie Disabling Engine</h3>
              <p className="text-[11px] text-zinc-500">Rules applied across all websites to automatically sanitize tracking cookies unless ignored.</p>
            </div>
            <button
              onClick={() => setShowAddRuleModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Global Rule</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-[#18181b] border-b border-zinc-200 dark:border-[#27272a] text-zinc-500 font-medium">
                <tr>
                  <th className="px-4 py-2.5">Pattern Match</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Default Action</th>
                  <th className="px-3 py-2.5">Description</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-[#27272a]">
                {(cookieRules || []).map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-4 py-2.5 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {rule.cookie_pattern}
                    </td>
                    <td className="px-3 py-2.5 capitalize text-zinc-600 dark:text-zinc-400">
                      {rule.cookie_category || "analytics"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        rule.default_action === "block" ? "bg-red-500/10 text-red-600 border border-red-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}>
                        {rule.default_action}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-zinc-500 text-[11px]">
                      {rule.description || "System rule"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDeleteCookieRule(rule.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Top 5000 Pipeline */}
      {activeSubTab === "top5000" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#121215] p-5 rounded-lg border border-zinc-200 dark:border-[#27272a] space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-500" />
                  Top 5,000 Global Websites Dataset Pipeline
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Automated background worker that downloads daily research-grade Tranco domain rankings and batch analyzes policy ratings and cookie telemetry.
                </p>
              </div>

              <button
                onClick={handleTriggerTop5000}
                disabled={topStatus?.status === "running" || refreshingTop}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-xs font-medium flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${topStatus?.status === "running" ? "animate-spin" : ""}`} />
                <span>{topStatus?.status === "running" ? "Pipeline Running..." : "Trigger Top 5000 Sync"}</span>
              </button>
            </div>

            {/* Pipeline Status Cards */}
            {topStatus && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-zinc-50 dark:bg-[#18181b] rounded border border-zinc-200 dark:border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Status</span>
                  <div className="text-sm font-bold font-mono uppercase text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {topStatus.status}
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-[#18181b] rounded border border-zinc-200 dark:border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Scanned</span>
                  <div className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {topStatus.scanned} / {topStatus.total}
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-[#18181b] rounded border border-zinc-200 dark:border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Skipped (Fresh)</span>
                  <div className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {topStatus.skipped}
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-[#18181b] rounded border border-zinc-200 dark:border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Errors</span>
                  <div className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {topStatus.errors}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Log */}
      {activeSubTab === "audit" && (
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-[#18181b] border-b border-zinc-200 dark:border-[#27272a] text-zinc-500">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">Action</th>
                <th className="px-3 py-2.5">Target</th>
                <th className="px-4 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-[#27272a]">
              {(auditLogs || []).map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 font-mono text-zinc-400 text-[11px]">
                    {log.performed_at ? log.performed_at.slice(0, 19).replace("T", " ") : ""}
                  </td>
                  <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100 uppercase text-[10px]">
                    {log.action}
                  </td>
                  <td className="px-3 py-2 font-mono text-indigo-500">
                    {log.target || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-zinc-500 font-mono text-[11px]">
                    {typeof log.details === "object" ? JSON.stringify(log.details) : log.details || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Website Full Details Modal (When website name is clicked) */}
      {selectedSite && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121215] border border-zinc-300 dark:border-[#27272a] rounded-xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-zinc-200 dark:border-[#27272a] pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedSite.name || selectedSite.domain}
                  </h2>
                  {getGradeBadge(selectedSite.grade, selectedSite.overall_score, selectedSite.grade_color)}
                  <span className="text-xs text-zinc-400 font-mono">({selectedSite.domain})</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Category: <strong className="text-zinc-700 dark:text-zinc-300">{selectedSite.category || "General"}</strong> • 
                  Source: <strong className="text-zinc-700 dark:text-zinc-300">{selectedSite.source}</strong> • 
                  Last Scanned: <strong className="text-zinc-700 dark:text-zinc-300">{selectedSite.last_analyzed_at?.slice(0, 19).replace("T", " ")}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedSite(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* 6-Pillar Score Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                6-Pillar Privacy Rubric Evaluation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(selectedSite.pillar_scores || {}).map(([pillarKey, pData]) => (
                  <div key={pillarKey} className="p-3 bg-zinc-50 dark:bg-[#18181b] rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">
                        {pillarKey.replace("_", " ")}
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {pData.score} / 100
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${pData.score >= 80 ? "bg-emerald-500" : pData.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${pData.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight">{pData.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Statutory Compliance */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Statutory Compliance Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* DPDP India */}
                <div className="p-3 bg-zinc-50 dark:bg-[#18181b] rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                    <span>India DPDP Act 2023</span>
                    {selectedSite.compliance?.dpdp?.compliant ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Officer: {selectedSite.compliance?.dpdp?.grievance_officer || "Not disclosed"}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {selectedSite.compliance?.dpdp?.grievance_email || "No email detected"}
                  </p>
                </div>

                {/* GDPR EU */}
                <div className="p-3 bg-zinc-50 dark:bg-[#18181b] rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                    <span>EU GDPR (Art. 17)</span>
                    {selectedSite.compliance?.gdpr?.compliant ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    DPO Contact: {selectedSite.compliance?.gdpr?.dpo_contact || "Not disclosed"}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Erasure: {selectedSite.compliance?.gdpr?.erasure_art17_disclosed ? "Disclosed" : "Vague"}
                  </p>
                </div>

                {/* CCPA */}
                <div className="p-3 bg-zinc-50 dark:bg-[#18181b] rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                    <span>California CCPA</span>
                    {selectedSite.compliance?.ccpa?.compliant ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Do Not Sell: {selectedSite.compliance?.ccpa?.do_not_sell ? "Supported" : "Not mentioned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cookie Manager: Disable Unnecessary Cookies & Ignore Option */}
            <div className="space-y-3 p-4 bg-zinc-100 dark:bg-[#18181b] rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Cookie className="w-4 h-4 text-amber-500" />
                    Per-Site Cookie Governance & Exemption Engine
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Set specific cookies to <strong>Block</strong> (disabled), <strong>Allow</strong> (essential), or <strong>Ignore</strong> (whitelist / bypass disabling).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Bulk disable all non-essential
                      const cookies = selectedSite.cookie_data || [];
                      const nonEssential = cookies.filter(c => c.category !== "essential");
                      const prefs = nonEssential.map(c => ({ cookie_name: c.name, action: "block" }));
                      updateWebsiteCookies(selectedSite.domain, prefs).then(() => handleOpenDetail(selectedSite.domain));
                    }}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-medium"
                  >
                    Block All Unnecessary
                  </button>
                  <button
                    onClick={() => {
                      // Bulk ignore
                      const cookies = selectedSite.cookie_data || [];
                      const prefs = cookies.map(c => ({ cookie_name: c.name, action: "ignore" }));
                      updateWebsiteCookies(selectedSite.domain, prefs).then(() => handleOpenDetail(selectedSite.domain));
                    }}
                    className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded text-[11px] font-medium"
                  >
                    Ignore All Disabling
                  </button>
                </div>
              </div>

              {/* Cookies List */}
              <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-[#18181b] border-b border-zinc-200 dark:border-zinc-700 text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Cookie Name</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Classification</th>
                      <th className="px-3 py-2 text-right">Policy Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {(selectedSite.cookie_data && selectedSite.cookie_data.length > 0) ? (
                      selectedSite.cookie_data.map((ck) => {
                        const existingPref = (selectedSite.cookie_preferences || []).find(p => p.cookie_name === ck.name);
                        const currentAction = existingPref ? existingPref.action : (ck.category === "essential" ? "allow" : "block");

                        return (
                          <tr key={ck.name}>
                            <td className="px-3 py-2 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                              {ck.name}
                            </td>
                            <td className="px-3 py-2 capitalize text-zinc-600 dark:text-zinc-400">
                              {ck.category || "Unknown"}
                            </td>
                            <td className="px-3 py-2">
                              {ck.isTracking ? (
                                <span className="text-red-500 font-semibold text-[10px]">Tracker Cookie</span>
                              ) : (
                                <span className="text-emerald-500 font-semibold text-[10px]">Essential / Functional</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex rounded-md shadow-sm border border-zinc-300 dark:border-zinc-700 overflow-hidden text-[10px] font-mono">
                                <button
                                  onClick={() => handleCookieActionToggle(ck.name, "block")}
                                  className={`px-2 py-1 ${currentAction === "block" ? "bg-red-600 text-white font-bold" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"}`}
                                >
                                  Block
                                </button>
                                <button
                                  onClick={() => handleCookieActionToggle(ck.name, "allow")}
                                  className={`px-2 py-1 ${currentAction === "allow" ? "bg-emerald-600 text-white font-bold" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"}`}
                                >
                                  Allow
                                </button>
                                <button
                                  onClick={() => handleCookieActionToggle(ck.name, "ignore")}
                                  className={`px-2 py-1 ${currentAction === "ignore" ? "bg-amber-600 text-white font-bold" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"}`}
                                  title="Ignore rule: Do NOT disable this cookie"
                                >
                                  Ignore
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-4 text-center text-zinc-400">
                          No cookie telemetry recorded yet. Live browsing via extension will auto-populate cookies for this domain.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  onScanDomain(selectedSite.domain);
                  setSelectedSite(null);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                <span>Open in Policy Analyzer</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRescan(selectedSite.domain)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rescan Now</span>
                </button>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121215] border border-zinc-300 dark:border-[#27272a] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                Add Website to Database
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWebsite} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Domain Name (Required)</label>
                <input
                  type="text"
                  placeholder="e.g. reddit.com, swiggy.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Brand Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Reddit Inc."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300"
                >
                  <option value="Web Service">Web Service</option>
                  <option value="Social Media">Social Media</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Search & Big Tech">Search & Big Tech</option>
                  <option value="Fintech & Payments">Fintech & Payments</option>
                  <option value="Quick Commerce & Delivery">Quick Commerce & Delivery</option>
                  <option value="Education">Education</option>
                  <option value="Developer Tools">Developer Tools</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingSite}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium disabled:opacity-50"
                >
                  {addingSite ? "Scanning..." : "Scan & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Cookie Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121215] border border-zinc-300 dark:border-[#27272a] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Add Global Cookie Pattern Rule
              </h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCookieRule} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cookie Pattern (Prefix or Exact)</label>
                <input
                  type="text"
                  placeholder="e.g. _ga*, cto_, _fbp"
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-md font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300"
                >
                  <option value="analytics">Analytics</option>
                  <option value="advertising">Advertising</option>
                  <option value="social_media">Social Media</option>
                  <option value="essential">Essential</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Default Action</label>
                <select
                  value={newRuleAction}
                  onChange={(e) => setNewRuleAction(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300"
                >
                  <option value="block">Block (Disable Unnecessary)</option>
                  <option value="allow">Allow</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Google Analytics legacy cookie"
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#18181b] border border-zinc-300 dark:border-zinc-700 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium"
                >
                  Save Global Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
