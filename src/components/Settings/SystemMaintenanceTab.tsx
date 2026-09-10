import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  HardDrive, 
  CheckCircle2, 
  FileSpreadsheet,
  Trash2,
  ShieldAlert,
  Server
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

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

  const handleExportFullJSON = () => {
    setIsExporting(true);
    setTimeout(() => {
      const backupData = {
        metadata: {
          organization: 'Karat Heavy Machinery Spare Parts',
          facility: 'Yard 4 Industrial Area Estate, Kampala',
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
      link.download = `KARAT_Full_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setFlashMessage('success', 'Full system JSON database snapshot successfully exported.');
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
      p.warehouse_bin || 'Yard 4'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KARAT_Inventory_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Data Governance
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Database Snapshots & Catalog Data Exports
            </h3>
            <p className="text-xs text-slate-500">
              Generate offline audit copies and raw machine-readable datasets for accounting or IT disaster recovery.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>5 Data Collections Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* JSON Full Backup */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-bold text-xs">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#111111]">Full System JSON Snapshot</h4>
                  <span className="text-[11px] text-slate-500">Complete parts, POs, and till receipts</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                Includes all {parts.length} spare parts, {oemOrders.length} OEM factory shipments, and {receipts.length} POS till slips with metadata.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportFullJSON}
              disabled={isExporting}
              className="w-full py-2.5 bg-[#111111] hover:bg-[#222222] text-[#F6AF31] text-xs font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating JSON...' : 'Export Complete Backup (JSON)'}</span>
            </button>
          </div>

          {/* CSV Catalog Export */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#111111]">Inventory Catalog (CSV / Excel)</h4>
                  <span className="text-[11px] text-slate-500">Fast spreadsheet format for yard auditors</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                Ready for import into Microsoft Excel or Google Sheets. Includes part numbers, OEM manufacturers, shelf locations, and cost bases.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCatalogCSV}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Parts Sheet (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Storage Diagnostics & Environment */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
          Telemetry & Operational Diagnostics
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Parts in Catalog</span>
            <span className="font-mono font-black text-sm text-[#111111]">{parts.length} SKUs</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Factory Ingest Orders</span>
            <span className="font-mono font-black text-sm text-[#111111]">{oemOrders.length} Consignments</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block text-[11px]">POS Cash Receipts</span>
            <span className="font-mono font-black text-sm text-[#111111]">{receipts.length} Slips</span>
          </div>
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="bg-red-50/60 rounded-3xl border border-red-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-red-700">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-black text-red-900 tracking-tight">
            Danger Zone: Reinitialize System Records
          </h3>
        </div>

        <p className="text-xs text-red-800 leading-relaxed max-w-2xl">
          Reset all inventory levels, POS sales receipts, and OEM purchase orders back to default clean factory demo seed state. This cannot be undone once executed.
        </p>

        <div>
          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reinitialize Factory Default Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-[#111111]">
                Confirm Factory Reinitialization
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will purge all custom parts, recent POS sales slips, and local overrides. Type <strong className="text-red-600 font-mono">RESET</strong> below to authorize.
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
                type="button"
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
