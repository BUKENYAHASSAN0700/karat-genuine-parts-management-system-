import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  AlertOctagon, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  FileText, 
  ArrowRight, 
  ShieldAlert, 
  Package, 
  DollarSign, 
  Warehouse, 
  Cpu, 
  HelpCircle,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { 
  parseAndValidateSpreadsheet, 
  downloadExcelTemplate, 
  downloadCsvTemplate, 
  SpreadsheetValidationResult,
  ParsedPartRow
} from '../../utils/spreadsheetUtils';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
  const { addMultipleParts, currency, formatMoney } = useInertia();

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<SpreadsheetValidationResult | null>(null);
  const [showAllErrors, setShowAllErrors] = useState<boolean>(true);
  const [previewTab, setPreviewTab] = useState<'preview' | 'errors'>('preview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setValidationResult(null);

    try {
      const buffer = await file.arrayBuffer();
      // Parse and strictly validate every row and cell
      const result = parseAndValidateSpreadsheet(buffer);
      
      // Short UX delay for scanning feedback
      setTimeout(() => {
        setValidationResult(result);
        setIsProcessing(false);
        if (!result.isValid) {
          setPreviewTab('errors');
        } else {
          setPreviewTab('preview');
        }
      }, 350);
    } catch (err: any) {
      setIsProcessing(false);
      setValidationResult({
        isValid: false,
        totalRows: 0,
        errors: [
          {
            productName: 'Uploaded File',
            cell: 'A1',
            missingField: 'Valid CSV or Excel spreadsheet structure',
            formattedMessage: `Failed to read spreadsheet file: ${err.message || 'Corrupted or unreadable format.'}`,
            rowNumber: 1,
            columnKey: 'A'
          }
        ],
        firstErrorMessage: `Failed to parse file: ${err.message || 'Invalid format.'}`,
        validParts: []
      });
      setPreviewTab('errors');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
        processFile(file);
      } else {
        alert('Please upload a valid CSV or Excel (.xlsx / .xls) spreadsheet.');
      }
    }
  };

  const handleConfirmImport = () => {
    if (!validationResult || !validationResult.isValid || validationResult.validParts.length === 0) {
      return;
    }

    const partsToAdd = validationResult.validParts.map(item => ({
      name: item.name,
      oem_number: item.oem_number,
      brand: item.brand,
      category: item.category,
      description: item.description,
      stock_quantity: item.stock_quantity,
      min_stock_alert: item.min_stock_alert,
      unit_price: item.unit_price,
      unit_cost: item.unit_cost,
      machinery_models: item.machinery_models,
      warehouse_bin: item.warehouse_bin,
      part_number: item.part_number || '',
      status: item.stock_quantity <= item.min_stock_alert ? ('Low Stock' as const) : ('In Stock' as const),
    }));

    addMultipleParts(partsToAdd);
    handleReset();
    onClose();
  };

  const totalCalculatedUnits = validationResult?.validParts.reduce((acc, p) => acc + p.stock_quantity, 0) || 0;
  const totalCalculatedValuation = validationResult?.validParts.reduce((acc, p) => acc + (p.stock_quantity * p.unit_price), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 sticky -top-5 bg-white z-10 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-[#F6AF31]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#111111]">
                  Bulk Import Inventory (CSV / Excel)
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#F7F6F3] border border-slate-200 text-[10px] font-mono font-bold text-[#111111]">
                  .XLSX &bull; .CSV &bull; .XLS
                </span>
              </div>
              <p className="text-[11px] text-[#111111]/50">
                Upload multiple spare parts with initial stock, categories, OEM codes, and commercial pricing at once
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#F7F6F3] text-[#111111]/70 hover:text-[#111111] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template Download Banner */}
        <div className="bg-[#F7F6F3] border border-slate-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-[#111111]">
                Official KARAT Inventory Template
              </div>
              <p className="text-[11px] text-[#111111]/60">
                Pre-formatted with real heavy machinery spare parts, column headers, and specifications.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#111111] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Excel (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#111111] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>CSV (.csv)</span>
            </button>
          </div>
        </div>

        {/* File Upload Drag & Drop Area */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-[#F6AF31] bg-amber-50/60 scale-[0.99]' 
                : 'border-slate-200 hover:border-[#111111]/40 bg-[#F7F6F3]/40 hover:bg-[#F7F6F3]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-[#111111] flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-7 h-7 text-[#111111]" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-[#111111]">
                  Click to select or drag and drop your spreadsheet here
                </div>
                <p className="text-xs text-[#111111]/50 mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-mono text-[#111111]/70">
                <span>Required columns: Name, OEM #, Brand, Category, Specs, Stock (&ge;1), Alert, Price, Models, Bin</span>
              </div>
            </div>
          </div>
        ) : (
          /* File Selected & Processing State */
          <div className="space-y-3">
            <div className="bg-[#F7F6F3] border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4 text-[#F6AF31]" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#111111] flex items-center gap-2">
                    <span>{selectedFile.name}</span>
                    <span className="text-[10px] text-[#111111]/40 font-mono">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <div className="text-[10px] text-[#111111]/60 font-mono">
                    {isProcessing ? 'Validating cell coordinates & product schemas...' : 'Processing complete.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#111111] transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Change File</span>
                </button>
              </div>
            </div>

            {/* Verification Spinner */}
            {isProcessing && (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#111111] border-t-[#F6AF31] rounded-full animate-spin mx-auto" />
                <div className="text-xs font-bold text-[#111111]">
                  Scanning spreadsheet cells and validating product specifications...
                </div>
                <p className="text-[11px] text-[#111111]/50">
                  Checking required fields, OEM codes, initial stock quantities, and machine compatibility.
                </p>
              </div>
            )}

            {/* Validation Result Scenarios */}
            {!isProcessing && validationResult && (
              <div className="space-y-3">
                {/* 1. FAILURE SCENARIO: Process Terminated & Exact Missing Message */}
                {!validationResult.isValid ? (
                  <div className="space-y-3">
                    {/* Critical Termination Alert Banner */}
                    <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <AlertOctagon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-mono font-black uppercase tracking-wider">
                              PROCESS TERMINATED
                            </span>
                            <span className="text-xs font-mono font-bold text-rose-800">
                              {validationResult.errors.length} {validationResult.errors.length === 1 ? 'Error' : 'Errors'} Detected
                            </span>
                          </div>

                          {/* The exact requested error message: {product name} in cell {A12} is missing {missing information} */}
                          <div className="text-sm font-black text-rose-950 font-mono pt-1 leading-snug">
                            {validationResult.firstErrorMessage}
                          </div>

                          <p className="text-xs text-rose-700 leading-relaxed pt-0.5">
                            The upload has been terminated. KARAT enforces 100% data integrity before adding items to live inventory. Every product must have valid, complete specifications (Name, OEM #, Brand, Category, Initial Stock &ge; 1, Mini Alert &ge; 1, Price &gt; 0, Models, and Bin Location).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Cell Violations Inspector */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <h4 className="font-extrabold text-xs text-[#111111]">
                            Spreadsheet Cell Integrity Audit Report ({validationResult.errors.length} violations)
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAllErrors(prev => !prev)}
                          className="text-[11px] text-[#111111]/60 hover:text-[#111111] flex items-center gap-1 font-semibold"
                        >
                          <span>{showAllErrors ? 'Collapse list' : 'Expand list'}</span>
                          {showAllErrors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {showAllErrors && (
                        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                          {validationResult.errors.map((err, idx) => (
                            <div 
                              key={idx}
                              className="p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded bg-rose-700 text-white shrink-0">
                                  Cell {err.cell}
                                </span>
                                <div className="truncate">
                                  <span className="font-bold text-rose-950 font-mono">
                                    {err.formattedMessage}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] text-rose-700 font-mono whitespace-nowrap bg-white px-2 py-0.5 rounded border border-rose-200">
                                Row {err.rowNumber}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#111111]/60">
                        <span>Correct the cells in your spreadsheet and upload the updated file.</span>
                        <button
                          type="button"
                          onClick={downloadExcelTemplate}
                          className="text-amber-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>View Reference Template</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. SUCCESS SCENARIO: All Data 100% Confirmed & Ready to Import */
                  <div className="space-y-3">
                    {/* Confirmation Banner */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-emerald-950">
                            Spreadsheet Verified: {validationResult.validParts.length} Products Ready for Import
                          </h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-black">
                            100% PASS
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800">
                          Every product row was validated with real information, valid stock levels, categories, OEM specifications, and commercial pricing.
                        </p>
                      </div>
                    </div>

                    {/* Summary Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#F7F6F3] border border-slate-200 rounded-2xl p-3">
                        <div className="text-[10px] uppercase font-bold text-[#111111]/50 font-mono">
                          Products to Add
                        </div>
                        <div className="font-mono font-black text-lg text-[#111111] mt-0.5">
                          {validationResult.validParts.length}
                        </div>
                        <div className="text-[10px] text-[#111111]/60 mt-0.5">
                          Unique Catalog Items
                        </div>
                      </div>

                      <div className="bg-[#F7F6F3] border border-slate-200 rounded-2xl p-3">
                        <div className="text-[10px] uppercase font-bold text-[#111111]/50 font-mono">
                          Total Stock Units
                        </div>
                        <div className="font-mono font-black text-lg text-[#111111] mt-0.5">
                          {totalCalculatedUnits} Units
                        </div>
                        <div className="text-[10px] text-[#111111]/60 mt-0.5">
                          Physical Bin Inventory
                        </div>
                      </div>

                      <div className="bg-[#F7F6F3] border border-slate-200 rounded-2xl p-3">
                        <div className="text-[10px] uppercase font-bold text-[#111111]/50 font-mono">
                          Imported Asset Value
                        </div>
                        <div className="font-mono font-black text-lg text-[#111111] mt-0.5">
                          {formatMoney(totalCalculatedValuation)}
                        </div>
                        <div className="text-[10px] text-[#111111]/60 mt-0.5">
                          Commercial Valuation
                        </div>
                      </div>
                    </div>

                    {/* Verified Data Preview Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      <div className="bg-[#F7F6F3] px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                        <div className="font-bold text-xs text-[#111111] flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#111111]/60" />
                          <span>Product Import Preview (First {Math.min(validationResult.validParts.length, 50)} rows)</span>
                        </div>
                        <span className="text-[10px] text-[#111111]/50 font-mono">
                          Auto-assigned KA IDs will be provisioned
                        </span>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F7F6F3]/60 text-[10px] uppercase font-mono text-[#111111]/60 sticky top-0 border-b border-slate-100">
                            <tr>
                              <th className="px-3 py-2">Row</th>
                              <th className="px-3 py-2">Part Name & OEM</th>
                              <th className="px-3 py-2">Brand & Category</th>
                              <th className="px-3 py-2">Stock / Alert</th>
                              <th className="px-3 py-2">Price</th>
                              <th className="px-3 py-2">Bin Location</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                            {validationResult.validParts.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition">
                                <td className="px-3 py-2 text-[#111111]/40">#{item.rawRowNumber}</td>
                                <td className="px-3 py-2">
                                  <div className="font-bold text-[#111111] font-sans truncate max-w-xs">{item.name}</div>
                                  <div className="text-[10px] text-[#111111]/50">OEM: {item.oem_number}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <span className="font-bold text-[#111111]">{item.brand}</span>
                                  <div className="text-[10px] text-[#111111]/50 truncate max-w-[140px]">{item.category}</div>
                                </td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">
                                    {item.stock_quantity} units
                                  </span>
                                  <span className="text-[10px] text-[#111111]/40 block mt-0.5">Min: {item.min_stock_alert}</span>
                                </td>
                                <td className="px-3 py-2 font-black text-[#111111]">
                                  {formatMoney(item.unit_price)}
                                </td>
                                <td className="px-3 py-2 text-[#111111]/70 truncate max-w-[140px]">
                                  {item.warehouse_bin}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111111]/70 hover:bg-[#F7F6F3] transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {selectedFile && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111111] hover:bg-[#F7F6F3] border border-slate-200 transition"
              >
                Clear File
              </button>
            )}

            {validationResult && validationResult.isValid && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-6 py-2.5 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold shadow-xs transition flex items-center gap-2 active:scale-95"
              >
                <span>Confirm & Import {validationResult.validParts.length} Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
