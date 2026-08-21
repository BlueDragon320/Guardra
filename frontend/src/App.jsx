import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import PolicyAnalyzer from "./pages/PolicyAnalyzer";
import DeletionAssistant from "./pages/DeletionAssistant";
import BreachMonitor from "./pages/BreachMonitor";
import ControlHub from "./pages/ControlHub";
import IdentityWizard from "./pages/IdentityWizard";
import EducationHub from "./pages/EducationHub";
import Regulators from "./pages/Regulators";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDomain, setSelectedDomain] = useState("swiggy.com");
  const [deletionData, setDeletionData] = useState(null);
  
  // Theme state: defaults to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("guardra_theme") || "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("guardra_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("guardra_theme", nextTheme);
      return nextTheme;
    });
  };

  const handleScanDomain = (domain) => {
    setSelectedDomain(domain);
    setActiveTab("policy-analyzer");
  };

  const handleTriggerDeletion = (data) => {
    setDeletionData(data);
    setActiveTab("deletion-assistant");
  };

  return (
    <div className="min-h-screen flex bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-150">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Navbar 
          onSearchDomain={handleScanDomain} 
          activeTab={activeTab} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />

        <main className="flex-1 pb-16">
          {activeTab === "dashboard" && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              onScanDomain={handleScanDomain} 
            />
          )}

          {activeTab === "policy-analyzer" && (
            <PolicyAnalyzer 
              selectedDomain={selectedDomain} 
              onTriggerDeletion={handleTriggerDeletion} 
            />
          )}

          {activeTab === "deletion-assistant" && (
            <DeletionAssistant 
              initialData={deletionData} 
            />
          )}

          {activeTab === "breach-monitor" && (
            <BreachMonitor />
          )}

          {activeTab === "control-hub" && (
            <ControlHub />
          )}

          {activeTab === "identity-wizard" && (
            <IdentityWizard />
          )}

          {activeTab === "education-hub" && (
            <EducationHub />
          )}

          {activeTab === "regulators" && (
            <Regulators />
          )}
        </main>
      </div>
    </div>
  );
}
