import React, { useState, useEffect } from "react";
import { Search, Sun, Moon } from "lucide-react";
import { fetchHealth } from "../services/api";

export default function Navbar({ onSearchDomain, activeTab, theme, toggleTheme }) {
  const [query, setQuery] = useState("");
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchDomain(query.trim());
      setQuery("");
    }
  };

  const titles = {
    dashboard: "Overview",
    "policy-analyzer": "Policy Rating & Compliance",
    "deletion-assistant": "Data Rights & Erasure",
    "breach-monitor": "Breach & Credential Check",
    "control-hub": "Privacy Control Hub",
    "identity-wizard": "Identity Compartments",
    "education-hub": "Education",
    regulators: "Regulator Directory",
  };

  return (
    <header className="h-14 bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-[#27272a] px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-150">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{titles[activeTab] || "Guardra"}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search domain (e.g. swiggy.com)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 bg-zinc-50 dark:bg-[#121215] border border-zinc-300 dark:border-[#27272a] rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-2.5 top-2.5" />
        </form>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="p-1.5 rounded-md bg-zinc-100 dark:bg-[#121215] hover:bg-zinc-200 dark:hover:bg-[#1c1c20] border border-zinc-200 dark:border-[#27272a] text-zinc-600 dark:text-zinc-400 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-zinc-300" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700" />
          )}
        </button>

        {/* Backend Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] text-[11px] text-zinc-600 dark:text-zinc-400">
          <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span>{backendOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
    </header>
  );
}
