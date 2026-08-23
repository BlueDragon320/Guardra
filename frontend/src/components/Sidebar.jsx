import React from "react";
import { 
  Shield, 
  Search, 
  Trash2, 
  AlertTriangle, 
  Sliders, 
  UserCheck, 
  BookOpen, 
  Scale, 
  Layers,
  Download,
  ExternalLink
} from "lucide-react";
import { triggerExtensionDownload } from "../services/api";

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", label: "Overview", icon: Layers, badge: null },
    { id: "admin-dashboard", label: "Admin Console", icon: Sliders, badge: "DB" },
    { id: "policy-analyzer", label: "Policy Rating", icon: Search, badge: "DPDP" },
    { id: "deletion-assistant", label: "Data Erasure", icon: Trash2, badge: null },
    { id: "breach-monitor", label: "Breach Check", icon: AlertTriangle, badge: null },
    { id: "control-hub", label: "Privacy Hub", icon: Sliders, badge: null },
    { id: "identity-wizard", label: "Identity Wizard", icon: UserCheck, badge: null },
    { id: "education-hub", label: "Education", icon: BookOpen, badge: null },
    { id: "regulators", label: "Regulator Directory", icon: Scale, badge: null },
  ];

  const handleInstallExtension = () => {
    triggerExtensionDownload("https://google.com");
  };

  return (
    <aside className="w-60 bg-white dark:bg-[#09090b] border-r border-zinc-200 dark:border-[#27272a] flex flex-col h-screen sticky top-0 select-none transition-colors duration-150">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
              Guardra
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">v1.0</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 dark:bg-[#18181b] text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-[#121215]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Extension Install Box */}
      <div className="p-3 m-3 bg-zinc-50 dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-800 dark:text-zinc-200">Browser Extension</span>
          <span className="text-[10px] font-mono text-zinc-500">Manifest V3</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-tight">
          Download ZIP package & install into Chromium.
        </p>
        <button
          onClick={handleInstallExtension}
          className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Extension</span>
        </button>
      </div>
    </aside>
  );
}
