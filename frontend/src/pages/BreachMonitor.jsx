import React, { useState } from "react";
import { 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  Lock, 
  Search 
} from "lucide-react";
import { checkPasswordPwned, checkEmailExposure } from "../services/api";

export default function BreachMonitor() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordResult, setPasswordResult] = useState(null);
  const [checkingPassword, setCheckingPassword] = useState(false);
  
  const [email, setEmail] = useState("user@example.com");
  const [emailResult, setEmailResult] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleCheckPassword = async (e) => {
    e.preventDefault();
    if (!password) return;
    setCheckingPassword(true);
    try {
      const res = await checkPasswordPwned(password);
      setPasswordResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingPassword(false);
    }
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    setCheckingEmail(true);
    try {
      const res = await checkEmailExposure(email);
      setEmailResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingEmail(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Breach & Credential Check</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
          Zero-knowledge k-anonymity password audit and email exposure check.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* K-Anonymity Password Checker */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 flex flex-col justify-between space-y-4 transition-colors shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                K-Anonymity Password Audit
              </span>
              <span className="text-[10px] font-mono text-zinc-500">SHA-1 Prefix</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
              Only the 5-character prefix of your hashed password is queried against the database. Plain passwords never leave memory.
            </p>

            <form onSubmit={handleCheckPassword} className="space-y-2.5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordResult(null);
                  }}
                  placeholder="Enter password to test..."
                  className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md pl-3 pr-8 py-2 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={checkingPassword || !password}
                className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
              >
                {checkingPassword ? "Checking..." : "Verify via K-Anonymity"}
              </button>
            </form>

            {passwordResult && (
              <div className="mt-3 p-3 rounded-md bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] text-xs space-y-1 text-zinc-800 dark:text-zinc-300">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  {passwordResult.pwned ? "⚠️ Compromised Password" : "✓ No Known Leaks"}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{passwordResult.message}</p>
                {passwordResult.prefix && (
                  <div className="text-[10px] font-mono text-zinc-500 pt-1">
                    Hash prefix transmitted: {passwordResult.prefix}*****
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Email Exposure Checker */}
        <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-[#27272a] rounded-lg p-5 flex flex-col justify-between space-y-4 transition-colors shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                Email Exposure Check
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Breach Directory</span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
              Scan breach directories to see which services exposed your email address.
            </p>

            <form onSubmit={handleCheckEmail} className="space-y-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailResult(null);
                }}
                placeholder="Enter email address..."
                className="w-full bg-zinc-50 dark:bg-[#09090b] border border-zinc-300 dark:border-[#27272a] rounded-md px-3 py-2 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
              />

              <button
                type="submit"
                disabled={checkingEmail || !email}
                className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
              >
                {checkingEmail ? "Scanning..." : "Check Breaches"}
              </button>
            </form>

            {emailResult && (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Breaches Found: <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">{emailResult.breaches_found}</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {emailResult.breaches.map((b, idx) => (
                    <div key={idx} className="p-2 bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-[#27272a] rounded text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{b.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{b.breach_date}</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{b.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
