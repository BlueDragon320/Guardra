import React, { useState, useEffect } from "react";
import { Sliders, ExternalLink } from "lucide-react";
import { getPrivacyPlatforms } from "../services/api";

export default function ControlHub() {
  const [platforms, setPlatforms] = useState([]);
  const [completedControls, setCompletedControls] = useState({});

  useEffect(() => {
    getPrivacyPlatforms().then(setPlatforms).catch(console.error);
    const saved = localStorage.getItem("guardra_completed_controls");
    if (saved) {
      try { setCompletedControls(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const toggleControl = (controlName) => {
    const next = { ...completedControls, [controlName]: !completedControls[controlName] };
    setCompletedControls(next);
    localStorage.setItem("guardra_completed_controls", JSON.stringify(next));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Privacy Control Hub</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Direct deep-links into ad tracking, location history, and AI data training settings across major platforms.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="space-y-4">
        {platforms.map((plat) => (
          <div key={plat.id} className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-4 space-y-3 transition-colors shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{plat.platform}</span>
              <span className="text-[10px] font-mono text-zinc-500">{plat.category}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {plat.controls.map((ctrl, idx) => {
                const isDone = !!completedControls[ctrl.name];
                return (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-md flex flex-col justify-between space-y-2 text-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-zinc-900 dark:text-zinc-200">{ctrl.name}</span>
                        <button
                          onClick={() => toggleControl(ctrl.name)}
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border transition-colors ${
                            isDone
                              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border-zinc-400 dark:border-zinc-600"
                              : "bg-white dark:bg-[#121215] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-[#27272a] hover:text-zinc-900 dark:hover:text-zinc-200"
                          }`}
                        >
                          {isDone ? "Done" : "Mark"}
                        </button>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                        {ctrl.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-[#27272a] flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">{ctrl.action}</span>
                      <a
                        href={ctrl.direct_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 bg-white dark:bg-[#121215] hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-zinc-300 text-[11px] rounded flex items-center gap-1 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
