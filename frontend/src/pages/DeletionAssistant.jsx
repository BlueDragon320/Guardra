import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  Download, 
  Copy, 
  Mail, 
  Send, 
  RefreshCw 
} from "lucide-react";
import { 
  generateNotice, 
  downloadPdfNotice, 
  submitDeletionRequest, 
  getDeletionRequests, 
  updateRequestStatus,
  getBrokersDirectory 
} from "../services/api";

export default function DeletionAssistant({ initialData }) {
  const [brokers, setBrokers] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // Form State
  const [siteDomain, setSiteDomain] = useState(initialData?.domain || "swiggy.in");
  const [siteName, setSiteName] = useState(initialData?.name || "Swiggy");
  const [legalBasis, setLegalBasis] = useState("dpdp");
  const [userName, setUserName] = useState("Rahul Sharma");
  const [userEmail, setUserEmail] = useState("rahul.sharma@example.com");
  const [userPhone, setUserPhone] = useState("+91 98765 43210");
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [grievanceEmail, setGrievanceEmail] = useState(initialData?.grievance_email || "grievances@swiggy.in");
  
  // Notice Preview State
  const [noticePreview, setNoticePreview] = useState(null);
  const [loadingNotice, setLoadingNotice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDirectoryAndRequests();
  }, []);

  useEffect(() => {
    if (initialData) {
      setSiteDomain(initialData.domain);
      setSiteName(initialData.name);
      if (initialData.grievance_email) setGrievanceEmail(initialData.grievance_email);
    }
  }, [initialData]);

  useEffect(() => {
    refreshPreview();
  }, [siteDomain, siteName, legalBasis, userName, userEmail, userPhone, accountIdentifier, grievanceEmail]);

  const loadDirectoryAndRequests = async () => {
    try {
      const [bList, rList] = await Promise.all([
        getBrokersDirectory(),
        getDeletionRequests()
      ]);
      setBrokers(bList);
      setRequests(rList);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshPreview = async () => {
    if (!siteDomain || !userEmail) return;
    try {
      setLoadingNotice(true);
      const data = await generateNotice({
        site_domain: siteDomain,
        site_name: siteName,
        legal_basis: legalBasis,
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        account_identifier: accountIdentifier,
        grievance_email: grievanceEmail
      });
      setNoticePreview(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNotice(false);
    }
  };

  const selectBroker = (broker) => {
    setSiteDomain(broker.id + ".com");
    setSiteName(broker.name);
    setGrievanceEmail(broker.grievance_email);
    if (broker.region_covered?.includes("India")) {
      setLegalBasis("dpdp");
    } else if (broker.region_covered?.includes("EU")) {
      setLegalBasis("gdpr");
    } else {
      setLegalBasis("ccpa");
    }
  };

  const handleCopy = () => {
    if (!noticePreview) return;
    navigator.clipboard.writeText(noticePreview.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    await downloadPdfNotice({
      site_domain: siteDomain,
      site_name: siteName,
      legal_basis: legalBasis,
      user_name: userName,
      user_email: userEmail,
      user_phone: userPhone,
      account_identifier: accountIdentifier,
      grievance_email: grievanceEmail
    });
  };

  const handleRecordRequest = async () => {
    setSubmitting(true);
    try {
      await submitDeletionRequest({
        site_domain: siteDomain,
        site_name: siteName,
        legal_basis: legalBasis,
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        account_identifier: accountIdentifier,
        grievance_email: grievanceEmail
      });
      await loadDirectoryAndRequests();
      alert(`Request recorded for ${siteName}.`);
    } catch (e) {
      alert("Error saving request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    try {
      await updateRequestStatus(reqId, newStatus, `Updated to ${newStatus}`);
      await loadDirectoryAndRequests();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Statutory Data Erasure Assistant</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Generate legally binding data deletion requests under India DPDP Act 2023 (Section 12), GDPR Art. 17, and CCPA.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Parameters Form */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 space-y-4 lg:col-span-5 transition-colors">
          <div className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Target Fiduciary / Company</div>

          {/* Quick Broker Selector */}
          <div>
            <span className="text-[11px] text-zinc-500 block mb-1.5">Quick catalog:</span>
            <div className="flex gap-1.5 flex-wrap">
              {brokers.slice(0, 6).map((b) => (
                <button
                  key={b.id}
                  onClick={() => selectBroker(b)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    siteName === b.name
                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-400 dark:border-zinc-600"
                      : "bg-zinc-50 dark:bg-[#09090b] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-[#27272a] hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">Company</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">Domain</label>
                <input
                  type="text"
                  value={siteDomain}
                  onChange={(e) => setSiteDomain(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">Grievance / DPO Email</label>
              <input
                type="email"
                value={grievanceEmail}
                onChange={(e) => setGrievanceEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">Legal Framework</label>
              <select
                value={legalBasis}
                onChange={(e) => setLegalBasis(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500"
              >
                <option value="dpdp">India: DPDP Act 2023 (Section 12 Erasure)</option>
                <option value="gdpr">European Union: GDPR Article 17</option>
                <option value="ccpa">California: CCPA § 1798.105</option>
              </select>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-[#27272a]">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block mb-2">Your Credentials</span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 font-mono focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 flex flex-col justify-between space-y-3 lg:col-span-7 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Generated Statutory Notice</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{legalBasis}</span>
            </div>

            <div className="bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded-md p-3.5 font-mono text-[11px] text-zinc-800 dark:text-zinc-300 leading-relaxed max-h-[340px] overflow-y-auto whitespace-pre-wrap select-text">
              {noticePreview?.body || "Generating..."}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-[#27272a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-zinc-50 dark:bg-[#09090b] hover:bg-zinc-100 dark:hover:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-[#18181b] hover:bg-zinc-200 dark:hover:bg-[#202024] border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                PDF Notice
              </button>
            </div>

            <div className="flex items-center gap-2">
              {noticePreview?.mailto_url && (
                <a
                  href={noticePreview.mailto_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-zinc-50 dark:bg-[#09090b] hover:bg-zinc-100 dark:hover:bg-[#18181b] border border-zinc-200 dark:border-[#27272a] text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
                >
                  <Mail className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                  Mailto
                </a>
              )}

              <button
                onClick={handleRecordRequest}
                disabled={submitting}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
              >
                <Send className="w-3 h-3" />
                {submitting ? "Saving..." : "Record Request"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Tracker Table */}
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 space-y-3 transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#27272a]">
          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-300">Tracked Deletion Requests</span>
          <button
            onClick={loadDirectoryAndRequests}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500 bg-zinc-50 dark:bg-[#09090b] rounded-md border border-zinc-200 dark:border-[#27272a]">
            No deletion requests currently recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-[#09090b] text-zinc-500 text-[10px] font-mono border-b border-zinc-200 dark:border-[#27272a]">
                <tr>
                  <th className="p-2.5">Platform</th>
                  <th className="p-2.5">Basis</th>
                  <th className="p-2.5">Grievance Recipient</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-[#27272a]">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-[#18181b] transition-colors">
                    <td className="p-2.5 font-medium text-zinc-800 dark:text-zinc-200">{r.site_name}</td>
                    <td className="p-2.5 font-mono text-[10px] text-zinc-500 uppercase">{r.legal_basis}</td>
                    <td className="p-2.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{r.grievance_email}</td>
                    <td className="p-2.5 text-zinc-500 text-[11px]">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="p-2.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className="bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded px-1.5 py-0.5 text-[10px] text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-zinc-500"
                      >
                        <option value="Sent">Sent</option>
                        <option value="Acknowledged">Acknowledged</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Escalated">Escalated</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
