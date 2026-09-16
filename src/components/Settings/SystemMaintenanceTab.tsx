import React, { useState, useEffect } from 'react';
import { useInertia } from '../../context/InertiaContext';
import { UIcon } from '../Common/UIcon';

export const SystemMaintenanceTab: React.FC = () => {
  const { 
    parts, 
    oemOrders, 
    receipts, 
    resetAllDataToDefaults, 
    setFlashMessage 
  } = useInertia();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [backendLatency, setBackendLatency] = useState<number | null>(null);
  const [isPingingBackend, setIsPingingBackend] = useState(false);

  const checkBackendConnection = async (showToast = false) => {
    setIsPingingBackend(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        await res.json();
        const latency = Math.round(performance.now() - start);
        setBackendLatency(latency);
        setBackendStatus('connected');
        if (showToast) {
          setFlashMessage('success', `Backend server connected! HTTP 200 OK (${latency}ms latency)`);
        }
      } else {
        setBackendStatus('error');
        if (showToast) {
          setFlashMessage('error', 'Backend returned an invalid status code.');
        }
      }
    } catch {
      setBackendStatus('error');
      if (showToast) {
        setFlashMessage('error', 'Failed to connect to backend server.');
      }
    } finally {
      setIsPingingBackend(false);
    }
  };

  useEffect(() => {
    checkBackendConnection(false);
  }, []);

  const handleExportFullJSON = () => {
    setIsExporting(true);
    setTimeout(() => {
      const backupData = {
        metadata: {
          organization: 'Heavy Machinery Spare Parts',
          exportTimestamp: new Date().toISOString(),
          version: '2.4.0-PROD'
        },
        inventory: parts,
        oemPurchaseOrders: oemOrders,
        posReceipts: receipts
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Full_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setFlashMessage('success', 'Full database snapshot successfully exported.');
    }, 600);
  };

  const handleExportCatalogCSV = () => {
    const headers = ['Part Number', 'Name', 'Manufacturer', 'Category', 'Stock Qty', 'Unit Cost USD', 'Retail Price USD', 'Location'];
    const rows = parts.map(p => [
      p.part_number,
      `"${p.name.replace(/"/g, '""')}"`,
      p.brand,
      p.category,
      p.stock_quantity,
      p.unit_cost ?? 0,
      p.unit_price ?? 0,
      p.warehouse_bin || 'Main Store'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFlashMessage('success', 'Spare parts inventory catalog exported as CSV.');
  };

  const handleConfirmReset = () => {
    if (resetInput.trim() !== 'RESET') {
      setFlashMessage('error', 'Please type RESET to confirm factory reinitialization.');
      return;
    }
    resetAllDataToDefaults();
    setConfirmResetOpen(false);
    setResetInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Database Snapshot & Export Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-black text-[#111111] tracking-tight">
            Database Snapshots & Catalog Data Exports
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate offline audit copies and raw machine-readable datasets for accounting or disaster recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* JSON Full Backup */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-bold text-xs">
                  <UIcon name="download" className="text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#111111]">Full JSON Snapshot</h4>
                  <span className="text-[11px] text-slate-500">Complete parts, purchase orders, and till receipts</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                Includes all {parts.length} spare parts, {oemOrders.length} factory shipments, and {receipts.length} sales till slips with metadata.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportFullJSON}
              disabled={isExporting}
              className="w-full py-2.5 bg-[#111111] hover:bg-[#222222] text-[#F6AF31] text-xs font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <UIcon name="download" className="text-sm" />
              <span>{isExporting ? 'Generating JSON...' : 'Export Complete Backup (JSON)'}</span>
            </button>
          </div>

          {/* CSV Catalog Export */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  <UIcon name="file-spreadsheet" className="text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#111111]">Inventory Catalog (CSV / Excel)</h4>
                  <span className="text-[11px] text-slate-500">Fast spreadsheet format for inventory auditors</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                Ready for import into spreadsheet software. Includes part numbers, manufacturers, shelf locations, and cost bases.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCatalogCSV}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <UIcon name="file-spreadsheet" className="text-sm" />
              <span>Export Parts Sheet (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend Server Connectivity & Health */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <UIcon name="server" className="text-base text-slate-700" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#111111] uppercase tracking-tight">
                Backend API Server
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Node.js Express backend proxying REST API endpoints on port 3000
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => checkBackendConnection(true)}
            disabled={isPingingBackend}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#111111] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <UIcon name="refresh" className={`text-xs ${isPingingBackend ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
            <span>{isPingingBackend ? 'Testing Connection...' : 'Test Backend Connection'}</span>
          </button>
        </div>

        {/* Big Data, Small Label stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-mono font-black text-xl text-emerald-600">
              {backendStatus === 'connected' ? 'HTTP 200 OK' : backendStatus === 'checking' ? 'Checking...' : 'Error'}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">API Health Status</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-mono font-black text-xl text-[#111111]">
              {backendLatency !== null ? `${backendLatency} ms` : '—'}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Round-Trip Latency</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-mono font-black text-xl text-[#111111] truncate">
              /api/health
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Backend Route Target</div>
          </div>
        </div>
      </div>

      {/* Operational Diagnostics (Big Data, Small Label) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-base font-black text-[#111111] tracking-tight">
            Operational Diagnostics
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-mono font-black text-2xl text-[#111111] tracking-tight">
              {parts.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Catalog SKUs
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-mono font-black text-2xl text-[#111111] tracking-tight">
              {oemOrders.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Factory Ingest Orders
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-mono font-black text-2xl text-[#111111] tracking-tight">
              {receipts.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Sales Cash Receipts
            </div>
          </div>
        </div>
      </div>

      {/* Factory Reset */}
      <div className="bg-red-50/60 rounded-3xl border border-red-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-red-700">
          <UIcon name="triangle-warning" className="text-base text-red-600" />
          <h3 className="text-sm font-black text-red-900 tracking-tight">
            Reinitialize System Records
          </h3>
        </div>

        <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
          Reset all inventory levels, sales receipts, and purchase orders back to default clean factory demo seed state. This cannot be undone once executed.
        </p>

        <div>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <UIcon name="trash" className="text-sm" />
            <span>Reinitialize Factory Default Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <UIcon name="shield-exclamation" className="text-xl" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-[#111111]">
                Confirm Factory Reinitialization
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will purge all custom parts, recent sales slips, and local overrides. Type <strong className="text-red-600 font-mono">RESET</strong> below to authorize.
              </p>
            </div>

            <div>
              <input
                type="text"
                value={resetInput}
                onChange={e => setResetInput(e.target.value)}
                placeholder="Type RESET here"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-center font-mono font-black text-[#111111] focus:bg-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmResetOpen(false);
                  setResetInput('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleConfirmReset}
                disabled={resetInput.trim() !== 'RESET'}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${
                  resetInput.trim() === 'RESET'
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
