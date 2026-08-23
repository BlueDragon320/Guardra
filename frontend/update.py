import sys

file_path = "/home/blue/CIH/Guardra/frontend/src/pages/AdminDashboard.jsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    'const [stats, setStats] = useState(null);',
    'const [stats, setStats] = useState(null);\n  const [backendConnected, setBackendConnected] = useState(true);'
)

content = content.replace(
'''  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };''',
'''  const loadStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
      setBackendConnected(true);
    } catch (err) {
      console.error(err);
      setBackendConnected(false);
    }
  };'''
)

content = content.replace(
'''    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#27272a]">''',
'''    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#27272a]">'''
)

content = content.replace(
'''      setWebsites(data.items || []);
      setTotalWebsites(data.total || 0);''',
'''      setWebsites(data?.items || []);
      setTotalWebsites(data?.total || 0);'''
)

content = content.replace(
'''      const data = await getGlobalCookieRules();
      setCookieRules(data || []);
    } catch (err) {
      console.error(err);
    }''',
'''      const data = await getGlobalCookieRules();
      setCookieRules(data || []);
    } catch (err) {
      console.error(err);
      setCookieRules([]);
    }'''
)

content = content.replace(
'''      const data = await getAdminAuditLog(1, 50);
      setAuditLogs(data.items || []);
    } catch (err) {
      console.error(err);
    }''',
'''      const data = await getAdminAuditLog(1, 50);
      setAuditLogs(data?.items || []);
    } catch (err) {
      console.error(err);
      setAuditLogs([]);
    }'''
)

content = content.replace(
'''                {cookieRules.map((rule) => (''',
'''                {(cookieRules || []).map((rule) => ('''
)

content = content.replace(
'''              {auditLogs.map((log) => (''',
'''              {(auditLogs || []).map((log) => ('''
)

content = content.replace(
'''                  ) : websites.length === 0 ? (''',
'''                  ) : (websites || []).length === 0 ? ('''
)

content = content.replace(
'''                  ) : (
                    websites.map((site) => (''',
'''                  ) : (
                    (websites || []).map((site) => ('''
)

content = content.replace(
'''<span>Showing {websites.length} of {totalWebsites} websites</span>''',
'''<span>Showing {(websites || []).length} of {totalWebsites} websites</span>'''
)

with open(file_path, "w") as f:
    f.write(content)
print("Updated successfully")
