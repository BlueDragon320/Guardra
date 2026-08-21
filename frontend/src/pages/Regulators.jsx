import React, { useState, useEffect } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { getRegulators } from "../services/api";

export default function Regulators() {
  const [regulators, setRegulators] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  
  const [companyName, setCompanyName] = useState("Target Platform Pvt Ltd");
  const [companyDomain, setCompanyDomain] = useState("example.com");
  const [officerEmail, setOfficerEmail] = useState("grievances@example.com");
  const [userName, setUserName] = useState("Rahul Sharma");
  const [userEmail, setUserEmail] = useState("rahul.sharma@example.com");
  const [requestDate, setRequestDate] = useState("2026-07-15");
  const [complaintText, setComplaintText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getRegulators().then((data) => {
      setRegulators(data);
      if (data.length > 0) setSelectedReg(data[0]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    generateComplaintDraft();
  }, [selectedReg, companyName, companyDomain, officerEmail, userName, userEmail, requestDate]);

  const generateComplaintDraft = () => {
    const regName = selectedReg?.name || "Data Protection Authority";
    const text = `To:
The Registrar / Adjudicating Officer
${regName}
Email: ${selectedReg?.email || "enforcement@regulator.gov"}

From:
Data Principal: ${userName}
Contact Email: ${userEmail}

Subject: FORMAL STATUTORY COMPLAINT under ${selectedReg?.law || "Data Protection Act"} against ${companyName} (${companyDomain}) for Failure to Fulfill Personal Data Erasure Request

Dear Authority,

I am formally lodging a complaint before the ${regName} against ${companyName} (${companyDomain}) on the following grounds:

1. Factual Background:
On ${requestDate}, I served a formal notice for the erasure of my personal data to the Grievance Officer of ${companyName} at ${officerEmail}.

2. Statutory Default:
The Data Fiduciary failed to respond or complete erasure within the thirty (30) day statutory timeline.

3. Relief Sought:
I request the Authority to:
  a) Direct ${companyName} to erase all personal data concerning the complainant;
  b) Order written confirmation of compliance;
  c) Initiate inquiry into non-compliance under statutory penalty provisions.

Sincerely,

${userName}
Email: ${userEmail}`;

    setComplaintText(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(complaintText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Regulator Directory & Escalation</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Directory of data protection supervisory authorities and formal complaint generation.
        </p>
      </div>

      {/* Regulators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regulators.map((reg) => (
          <div
            key={reg.id}
            onClick={() => setSelectedReg(reg)}
            className={`p-4 rounded-lg border cursor-pointer transition-colors space-y-2 text-xs shadow-sm ${
              selectedReg?.id === reg.id
                ? "bg-zinc-100 dark:bg-[#18181b] border-zinc-400 dark:border-zinc-500"
                : "bg-white dark:bg-[#121215] border-zinc-200 dark:border-[#27272a] hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">{reg.name}</span>
              <span className="text-[10px] font-mono text-zinc-500">{reg.region}</span>
            </div>
            <div className="text-zinc-700 dark:text-zinc-400 font-medium">{reg.law}</div>
            <p className="text-zinc-600 dark:text-zinc-500 text-[11px] leading-snug">{reg.mandate}</p>

            <div className="pt-2 border-t border-zinc-100 dark:border-[#27272a] flex items-center justify-between">
              <span className="font-mono text-zinc-700 dark:text-zinc-400 text-[11px]">{reg.email}</span>
              <a
                href={reg.website}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-800 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1 text-[11px]"
              >
                <span>Portal</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Complaint Generator */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 space-y-3 transition-colors shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-300">
            Complaint Draft for {selectedReg?.name || "Regulator"}
          </span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded transition-colors flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            {copied ? "Copied" : "Copy Text"}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company Name"
            className="bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded px-2.5 py-1 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500"
          />
          <input
            type="text"
            value={companyDomain}
            onChange={(e) => setCompanyDomain(e.target.value)}
            placeholder="Domain"
            className="bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded px-2.5 py-1 text-zinc-900 dark:text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
          />
          <input
            type="email"
            value={officerEmail}
            onChange={(e) => setOfficerEmail(e.target.value)}
            placeholder="Officer Email"
            className="bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded px-2.5 py-1 text-zinc-900 dark:text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
          />
          <input
            type="date"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            className="bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded px-2.5 py-1 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded p-3 font-mono text-[11px] text-zinc-800 dark:text-zinc-300 leading-relaxed max-h-[220px] overflow-y-auto whitespace-pre-wrap select-text">
          {complaintText}
        </div>
      </div>
    </div>
  );
}
