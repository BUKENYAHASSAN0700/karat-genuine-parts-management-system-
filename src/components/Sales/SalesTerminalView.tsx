import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  DollarSign, 
  User, 
  Phone, 
  Building2, 
  Truck, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RotateCcw, 
  Layers, 
  CreditCard, 
  Wallet, 
  ArrowRight,
  TrendingUp,
  FileText,
  Tag,
  Percent,
  Check,
  Package,
  Clock,
  Sparkles,
  Barcode,
  History
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { SparePart, SaleReceiptItem, SaleReceipt } from '../../types';
import { ReceiptModal } from './ReceiptModal';

interface CartItem {
  part: SparePart;
  quantity: number;
  custom_unit_price: number; // in USD
}

export const SalesTerminalView: React.FC = () => {
  const { 
    parts, 
    currentUser, 
    formatMoney, 
    currency, 
    completeSale, 
    receipts, 
    activeReceipt, 
    setActiveReceipt,
    selectedPartForSale,
    clearSelectedPartForSale,
    setFlashMessage
  } = useInertia();

  // Active Tab: 'pos' (active sale register), 'sold-items' (itemized parts sold history), or 'receipts' (receipts archive)
  const [activeTab, setActiveTab] = useState<'pos' | 'sold-items' | 'receipts'>('pos');

  // Catalog filtering & searching
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState(true);

  // Cart Register State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer & Transaction Information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Mobile Money' | 'Bank Wire' | 'Card' | 'Credit Account'>('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Discount & Tax Settings
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0); // 0%, 5%, 18%

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<SaleReceipt | null>(null);

  // History search filters
  const [historySearch, setHistorySearch] = useState('');
  const [soldItemsSearch, setSoldItemsSearch] = useState('');
  const [soldItemsBrand, setSoldItemsBrand] = useState('All');

  // Pre-load part into cart if arrived via "Sell Part" shortcut
  useEffect(() => {
    if (selectedPartForSale) {
      handleAddToCart(selectedPartForSale);
      clearSelectedPartForSale();
      setActiveTab('pos');
    }
  }, [selectedPartForSale]);

  // If an active receipt was generated in context, open it
  useEffect(() => {
    if (activeReceipt) {
      setViewingReceipt(activeReceipt);
      setIsReceiptOpen(true);
    }
  }, [activeReceipt]);

  // Frequent Customer presets for fast 1-click checkout
  const frequentClients = [
    { name: 'Roko Construction Ltd', phone: '+256 772 458 912', equipment: 'CAT 349D Excavator' },
    { name: 'Victoria Nile Earthworks', phone: '+256 701 883 291', equipment: 'Komatsu PC200-8' },
    { name: 'Sahara Mining Group', phone: '+256 782 109 443', equipment: 'Volvo EC480D' },
    { name: 'Titan Earthmoving', phone: '+256 752 901 120', equipment: 'CAT 330D' },
    { name: 'Walk-in Counter Customer', phone: '', equipment: 'Heavy Equipment' },
  ];

  const handleSelectClientPreset = (client: typeof frequentClients[0]) => {
    setCustomerName(client.name);
    setCustomerPhone(client.phone);
    setCustomerCompany(client.name === 'Walk-in Counter Customer' ? '' : client.name);
    setEquipmentModel(client.equipment);
  };

  // Filter Parts for Catalog
  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      if (inStockOnly && p.stock_quantity <= 0) return false;
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

      if (!catalogSearch.trim()) return true;
      const q = catalogSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.part_number.toLowerCase().includes(q) ||
        p.oem_number.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.machinery_models.some(m => m.toLowerCase().includes(q)) ||
        p.warehouse_bin.toLowerCase().includes(q)
      );
    });
  }, [parts, catalogSearch, selectedBrand, selectedCategory, inStockOnly]);

  const categories = useMemo(() => {
    const set = new Set(parts.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, [parts]);

  const brands = ['All', 'Caterpillar', 'Komatsu', 'Volvo', 'Hitachi', 'Hyundai', 'Doosan'];

  // Add Part to Cart
  const handleAddToCart = (part: SparePart) => {
    if (part.stock_quantity <= 0) {
      setFlashMessage('error', `Cannot add ${part.name}: Currently out of stock in warehouse.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.part.id === part.id);
      if (existing) {
        if (existing.quantity >= part.stock_quantity) {
          setFlashMessage('error', `Maximum warehouse stock limit reached (${part.stock_quantity} available units).`);
          return prev;
        }
        return prev.map(item =>
          item.part.id === part.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { part, quantity: 1, custom_unit_price: part.unit_price }];
    });
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (partId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.part.id === partId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.part.stock_quantity) {
            setFlashMessage('error', `Stock limit: only ${item.part.stock_quantity} available for ${item.part.name}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Update Unit Price Override
  const handleUpdatePrice = (partId: string, newPriceUSD: number) => {
    setCart(prev =>
      prev.map(item =>
        item.part.id === partId
          ? { ...item, custom_unit_price: Math.max(0, newPriceUSD) }
          : item
      )
    );
  };

  // Remove from Cart
  const handleRemoveFromCart = (partId: string) => {
    setCart(prev => prev.filter(item => item.part.id !== partId));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setDiscountValue(0);
    setCashTendered('');
  };

  // Financial Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.custom_unit_price * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return Math.min(subtotal, (subtotal * (discountValue || 0)) / 100);
    }
    return Math.min(subtotal, discountValue || 0);
  }, [subtotal, discountType, discountValue]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Estimated gross margin for seller awareness
  const totalCost = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.part.unit_cost * item.quantity), 0);
  }, [cart]);
  const grossProfit = Math.max(0, grandTotal - totalCost);
  const marginPercent = grandTotal > 0 ? ((grossProfit / grandTotal) * 100).toFixed(1) : '0';

  // Cash change calculation
  const numericTendered = parseFloat(cashTendered) || 0;
  const changeDue = numericTendered > grandTotal ? numericTendered - grandTotal : 0;

  // Complete Sale and issue receipt
  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setFlashMessage('error', 'The sale cart is empty. Add at least one spare part from the catalog.');
      return;
    }

    if (!customerName.trim()) {
      setFlashMessage('error', 'Please enter a customer or fleet company name for this receipt.');
      return;
    }

    // Verify stock availability for all items
    for (const item of cart) {
      const currentPart = parts.find(p => p.id === item.part.id);
      if (!currentPart || currentPart.stock_quantity < item.quantity) {
        setFlashMessage('error', `Insufficient stock for ${item.part.name}. Only ${currentPart?.stock_quantity || 0} remaining.`);
        return;
      }
    }

    const saleItems: SaleReceiptItem[] = cart.map(item => ({
      part_id: item.part.id,
      part_number: item.part.part_number,
      oem_number: item.part.oem_number,
      name: item.part.name,
      brand: item.part.brand,
      category: item.part.category,
      quantity: item.quantity,
      unit_price: item.custom_unit_price,
      total_price: item.custom_unit_price * item.quantity,
      warehouse_bin: item.part.warehouse_bin,
    }));

    const saleRecord = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim() || undefined,
      customer_company: customerCompany.trim() || undefined,
      equipment_model: equipmentModel.trim() || undefined,
      items: saleItems,
      subtotal,
      discount_amount: discountAmount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      payment_method: paymentMethod,
      payment_reference: paymentReference.trim() || undefined,
      payment_status: 'Paid' as const,
      amount_tendered: paymentMethod === 'Cash' && numericTendered > 0 ? numericTendered : grandTotal,
      change_due: paymentMethod === 'Cash' ? changeDue : 0,
      notes: notes.trim() || undefined,
      cashier_name: currentUser?.name || 'Hassan (Owner)',
      currency: currency,
    };

    const newReceipt = completeSale(saleRecord);

    // Reset register for next customer
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerCompany('');
    setEquipmentModel('');
    setCashTendered('');
    setPaymentReference('');
    setNotes('');
    setDiscountValue(0);

    // Show generated receipt in modal immediately
    setViewingReceipt(newReceipt);
    setIsReceiptOpen(true);
  };

  // Filter receipts for receipts archive tab
  const filteredReceipts = useMemo(() => {
    if (!historySearch.trim()) return receipts;
    const q = historySearch.toLowerCase();
    return receipts.filter(r => 
      r.receipt_number.toLowerCase().includes(q) ||
      r.customer_name.toLowerCase().includes(q) ||
      (r.customer_company && r.customer_company.toLowerCase().includes(q)) ||
      (r.equipment_model && r.equipment_model.toLowerCase().includes(q)) ||
      r.items.some(it => it.name.toLowerCase().includes(q) || it.part_number.toLowerCase().includes(q) || it.oem_number.toLowerCase().includes(q))
    );
  }, [receipts, historySearch]);

  // Flatten all itemized sold parts across all receipts for detailed history
  const allSoldItems = useMemo(() => {
    const list: Array<SaleReceiptItem & {
      receipt_id: string;
      receipt_number: string;
      customer_name: string;
      customer_company?: string;
      customer_phone?: string;
      equipment_model?: string;
      date: string;
      time: string;
      timestamp: number;
      payment_method: string;
      payment_reference?: string;
      cashier_name?: string;
      fullReceipt: SaleReceipt;
    }> = [];

    receipts.forEach(r => {
      r.items.forEach(item => {
        list.push({
          ...item,
          receipt_id: r.id,
          receipt_number: r.receipt_number,
          customer_name: r.customer_name,
          customer_company: r.customer_company,
          customer_phone: r.customer_phone,
          equipment_model: r.equipment_model,
          date: r.date,
          time: r.time,
          timestamp: r.timestamp,
          payment_method: r.payment_method,
          payment_reference: r.payment_reference,
          cashier_name: r.cashier_name,
          fullReceipt: r,
        });
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [receipts]);

  // Filter sold items history
  const filteredSoldItems = useMemo(() => {
    return allSoldItems.filter(item => {
      const matchesBrand = soldItemsBrand === 'All' || item.brand.toLowerCase() === soldItemsBrand.toLowerCase();
      if (!matchesBrand) return false;
      if (!soldItemsSearch.trim()) return true;
      const q = soldItemsSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.part_number.toLowerCase().includes(q) ||
        item.oem_number.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.customer_name.toLowerCase().includes(q) ||
        (item.customer_company && item.customer_company.toLowerCase().includes(q)) ||
        (item.equipment_model && item.equipment_model.toLowerCase().includes(q)) ||
        item.receipt_number.toLowerCase().includes(q)
      );
    });
  }, [allSoldItems, soldItemsSearch, soldItemsBrand]);

  const totalItemsSold = useMemo(() => {
    return receipts.reduce((acc, r) => acc + r.items.reduce((s, it) => s + it.quantity, 0), 0);
  }, [receipts]);

  return (
    <div className="space-y-5">
      {/* Module Title & Navigation Tabs Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-extrabold shadow-sm shrink-0">
              <Receipt className="w-5 h-5 text-[#F6AF31]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
                  Point of Sale & Selling Terminal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#22A06B]/15 text-[#22A06B]">
                  Live Register
                </span>
              </div>
              <p className="text-xs text-[#111111]/60 mt-0.5">
                Select parts from catalog, verify warehouse stock, apply fleet discounts, and manage real-time sold parts history.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs: Sell Register, Sold Items History, Receipts Archive */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F7F6F3] text-[#111111] hover:bg-slate-200/70 border border-slate-200/80'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-[#F6AF31]" />
            <span>Sell Products</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#F6AF31] text-[#111111] text-[10px] font-black flex items-center justify-center">
                {cart.reduce((s, it) => s + it.quantity, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sold-items')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'sold-items'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F7F6F3] text-[#111111] hover:bg-slate-200/70 border border-slate-200/80'
            }`}
          >
            <History className="w-4 h-4 text-[#111111]/70" />
            <span>Sold Items History</span>
            <span className="px-2 py-0.5 rounded-full bg-[#22A06B]/15 text-[#22A06B] text-[10px] font-mono font-black">
              {totalItemsSold} Sold
            </span>
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'receipts'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F7F6F3] text-[#111111] hover:bg-slate-200/70 border border-slate-200/80'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#111111]/70" />
            <span>Sales Receipts</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200/90 text-[10px] font-mono text-[#111111] font-bold">
              {receipts.length}
            </span>
          </button>
        </div>
      </div>

      {/* ===================== TAB 1: ACTIVE SELL TERMINAL ===================== */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: Live Catalog Search & Spare Parts Selector (7 columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-[#111111] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#F6AF31]" />
                  <span>Spare Parts Catalog</span>
                </h2>
                <p className="text-[11px] text-[#111111]/50">
                  Showing {filteredParts.length} available items • Click to add to customer cart
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-[#111111] font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#111111] accent-[#111111] cursor-pointer"
                  />
                  <span>In-stock only</span>
                </label>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#111111]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search part name, KA... code, OEM (CAT, Komatsu), model, or bin..."
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#111111] placeholder:text-[#111111]/40 outline-none focus:border-[#111111] transition"
              />
              {catalogSearch && (
                <button
                  onClick={() => setCatalogSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111111]/40 hover:text-[#111111]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F7F6F3] text-[#111111]/70 hover:bg-slate-200/70 border border-slate-200/80'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* Parts Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredParts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-[#111111]/50 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-[#111111]/30 stroke-[1.5]" />
                  <p className="text-xs font-semibold">No spare parts matching your filter.</p>
                  <button
                    onClick={() => {
                      setCatalogSearch('');
                      setSelectedBrand('All');
                      setSelectedCategory('All');
                      setInStockOnly(false);
                    }}
                    className="text-xs font-bold text-[#111111] underline hover:text-[#F6AF31]"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                filteredParts.map(part => {
                  const inCartItem = cart.find(item => item.part.id === part.id);
                  const isOutOfStock = part.stock_quantity <= 0;
                  const isLowStock = part.stock_quantity > 0 && part.stock_quantity <= part.min_stock_alert;

                  return (
                    <div
                      key={part.id}
                      className={`p-3.5 rounded-2xl border transition flex flex-col justify-between space-y-2.5 ${
                        inCartItem 
                          ? 'border-[#111111] bg-amber-50/25 shadow-2xs' 
                          : isOutOfStock
                          ? 'border-slate-200 bg-slate-50 opacity-60'
                          : 'border-slate-200/90 bg-white hover:border-slate-400 hover:shadow-2xs'
                      }`}
                    >
                      <div>
                        {/* Part ID & Brand Badge */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-slate-100 text-[#111111] border border-slate-200/80">
                            {part.part_number}
                          </span>
                          <span className="text-[10px] font-bold text-[#111111]/70 px-2 py-0.5 rounded-full bg-slate-100">
                            {part.brand}
                          </span>
                        </div>

                        {/* Part Name */}
                        <h3 className="text-xs font-extrabold text-[#111111] mt-1.5 line-clamp-2 leading-snug" title={part.name}>
                          {part.name}
                        </h3>

                        {/* OEM & Category */}
                        <div className="text-[10px] font-mono text-[#111111]/60 mt-0.5 flex items-center gap-1.5 truncate">
                          <span>OEM: {part.oem_number}</span>
                        </div>

                        {/* Bin Location */}
                        <div className="text-[9px] text-[#111111]/50 mt-1 flex items-center gap-1 truncate">
                          <span className="font-semibold text-[#111111]/70">Bin:</span> {part.warehouse_bin}
                        </div>
                      </div>

                      {/* Bottom Row: Stock, Price, Add Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-black font-mono text-[#111111]">
                            {formatMoney(part.unit_price)}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {isOutOfStock ? (
                              <span className="text-[9px] font-bold text-[#DC2626] uppercase">Out of Stock</span>
                            ) : (
                              <span className={`text-[9px] font-bold ${isLowStock ? 'text-amber-600' : 'text-[#22A06B]'}`}>
                                {part.stock_quantity} left in stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add / In-Cart controls */}
                        {isOutOfStock ? (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-400 text-[11px] font-bold cursor-not-allowed"
                          >
                            Out
                          </button>
                        ) : inCartItem ? (
                          <div className="flex items-center gap-1 bg-[#111111] text-white p-1 rounded-xl">
                            <button
                              onClick={() => handleUpdateQuantity(part.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-xs">
                              {inCartItem.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(part.id, 1)}
                              disabled={inCartItem.quantity >= part.stock_quantity}
                              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(part)}
                            className="px-3 py-1.5 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-[11px] font-extrabold flex items-center gap-1 transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Active Register, Customer Details & Checkout (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#F6AF31] text-[#111111] flex items-center justify-center font-black text-xs">
                  {cart.reduce((s, it) => s + it.quantity, 0)}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#111111]">Current Customer Order</h2>
                  <p className="text-[10px] text-[#111111]/50">Invoice & Cash Register</p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-[11px] font-bold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>

            {/* Quick Client Autocomplete Presets */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1.5">
                Quick Select Contractor / Fleet Account
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {frequentClients.map(client => (
                  <button
                    key={client.name}
                    type="button"
                    onClick={() => handleSelectClientPreset(client)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F7F6F3] hover:bg-[#111111] hover:text-white text-[#111111]/80 border border-slate-200 whitespace-nowrap transition cursor-pointer"
                  >
                    {client.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleCompleteSale} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Roko Construction / Alex"
                    className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                    Phone / Contact
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +256 772 458 912"
                    className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                    Equipment / Machine Model
                  </label>
                  <input
                    type="text"
                    value={equipmentModel}
                    onChange={(e) => setEquipmentModel(e.target.value)}
                    placeholder="e.g. CAT 349D Excavator"
                    className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-bold outline-none focus:border-[#111111]"
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="Mobile Money">📱 Mobile Money (MTN / Airtel)</option>
                    <option value="Bank Wire">🏦 Bank Wire / EFT Transfer</option>
                    <option value="Card">💳 Credit / Debit Card</option>
                    <option value="Credit Account">📑 Fleet Credit / On Account</option>
                  </select>
                </div>
              </div>

              {/* Extra Payment Reference (if Mobile Money, Wire, or Card) */}
              {paymentMethod !== 'Cash' && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                    Payment Reference / Transaction ID
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder={
                      paymentMethod === 'Mobile Money'
                        ? 'e.g. MOMO-984210'
                        : paymentMethod === 'Bank Wire'
                        ? 'e.g. WIRE-8491-STANBIC'
                        : 'Reference or Slip Number'
                    }
                    className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-mono outline-none focus:border-[#111111]"
                  />
                </div>
              )}

              {/* Cart Items Table */}
              <div className="border border-slate-200 rounded-2xl p-3 bg-[#FAFAF8] space-y-2">
                <span className="text-[10px] uppercase font-extrabold text-[#111111]/50 tracking-wider block">
                  Cart Line Items ({cart.length})
                </span>

                {cart.length === 0 ? (
                  <div className="py-8 text-center text-[#111111]/40 text-xs">
                    <ShoppingCart className="w-7 h-7 mx-auto mb-2 text-[#111111]/20 stroke-[1.5]" />
                    <p className="font-semibold">Cart is currently empty.</p>
                    <p className="text-[11px] text-[#111111]/40 mt-0.5">
                      Select spare parts from the catalog on the left to begin this customer sale.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200/70 max-h-56 overflow-y-auto pr-1">
                    {cart.map(item => (
                      <div key={item.part.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-[#111111] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {item.part.part_number}
                            </span>
                            <span className="text-xs font-bold text-[#111111] truncate block" title={item.part.name}>
                              {item.part.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#111111]/60 font-mono mt-0.5">
                            {formatMoney(item.custom_unit_price)} each • Max: {item.part.stock_quantity}
                          </div>
                        </div>

                        {/* Quantity Counter & Line Subtotal */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.part.id, -1)}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-5 text-center font-mono font-bold text-xs text-[#111111]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.part.id, 1)}
                              disabled={item.quantity >= item.part.stock_quantity}
                              className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold transition disabled:opacity-30 cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="text-right w-20">
                            <span className="text-xs font-black font-mono text-[#111111] block">
                              {formatMoney(item.custom_unit_price * item.quantity)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.part.id)}
                            className="text-slate-400 hover:text-[#DC2626] transition p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Discounts & Tax Adjustments */}
              {cart.length > 0 && (
                <div className="p-3 bg-[#F7F6F3] rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                        Discount (USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discountValue || ''}
                        onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#111111] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                        Tax / VAT Rate
                      </label>
                      <select
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#111111] outline-none"
                      >
                        <option value="0">0% (Tax Exempt)</option>
                        <option value="5">5% (Regional Tax)</option>
                        <option value="18">18% (Standard VAT)</option>
                      </select>
                    </div>
                  </div>

                  {/* Cash Tendered & Change Due (If Cash Payment) */}
                  {paymentMethod === 'Cash' && (
                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                          Cash Tendered ({currency})
                        </label>
                        <input
                          type="number"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                          placeholder={grandTotal.toString()}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#111111] outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                          Change Due
                        </span>
                        <div className="font-mono font-bold text-xs py-1.5 px-2 bg-white rounded-xl border border-slate-200 text-[#22A06B]">
                          {formatMoney(changeDue)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Internal Notes */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#111111]/50 block mb-1">
                      Sale / Warranty Notes (Printed on receipt)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Urgent repair order. Warranty valid 30 days."
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-[#111111] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Grand Total Summary Display */}
              <div className="border-t-2 border-[#111111] pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#111111]/70">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-[#111111]">{formatMoney(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#22A06B]">
                    <span>Discount:</span>
                    <span className="font-mono font-bold">-{formatMoney(discountAmount)}</span>
                  </div>
                )}

                {taxAmount > 0 && (
                  <div className="flex justify-between text-[#111111]/70">
                    <span>Tax ({taxRate}%):</span>
                    <span className="font-mono font-bold text-[#111111]">{formatMoney(taxAmount)}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-black uppercase text-[#111111]">Grand Total Due:</span>
                    <span className="text-[10px] text-[#111111]/50 block">
                      Profit Margin: ~{marginPercent}% ({formatMoney(grossProfit)} profit)
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono text-[#111111]">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Big Checkout Button */}
              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#F6AF31] hover:bg-[#e5a028] disabled:bg-slate-200 disabled:text-slate-400 text-[#111111] font-black text-sm flex items-center justify-center gap-2.5 shadow-md transition active:scale-98 cursor-pointer disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 text-[#111111] stroke-[2.5]" />
                <span>Complete Sale & Issue Receipt</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#111111] text-white text-xs font-mono font-bold">
                  {formatMoney(grandTotal)}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: ITEMIZED SOLD ITEMS HISTORY ===================== */}
      {activeTab === 'sold-items' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-bold text-xs shrink-0">
                  <History className="w-4 h-4 text-[#F6AF31]" />
                </div>
                <h2 className="text-lg font-extrabold text-[#111111] tracking-tight">
                  Sold Spare Parts & Itemized History
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#22A06B]/15 text-[#22A06B]">
                  {filteredSoldItems.reduce((acc, it) => acc + it.quantity, 0)} Units Logged
                </span>
              </div>
              <p className="text-xs text-[#111111]/60 mt-1">
                Detailed audit trail of all spare parts sold, stock deductions, customer contractor details, and unit sale prices.
              </p>
            </div>

            {/* Search Input for Sold Items */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#111111]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={soldItemsSearch}
                onChange={(e) => setSoldItemsSearch(e.target.value)}
                placeholder="Search sold part name, KA ID, OEM, customer, machine..."
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-[#111111] placeholder:text-[#111111]/40 outline-none focus:border-[#111111]"
              />
              {soldItemsSearch && (
                <button
                  onClick={() => setSoldItemsSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111111]/40 hover:text-[#111111] text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Brand Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-[#111111]/50 mr-1 shrink-0">Filter Brand:</span>
            {['All', 'Caterpillar', 'Komatsu', 'Volvo', 'Hitachi', 'Hyundai', 'Doosan'].map(brand => (
              <button
                key={brand}
                onClick={() => setSoldItemsBrand(brand)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition shrink-0 cursor-pointer ${
                  soldItemsBrand === brand
                    ? 'bg-[#111111] text-white shadow-2xs'
                    : 'bg-[#F7F6F3] text-[#111111]/70 hover:bg-slate-200/70 border border-slate-200/80'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Sold Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-extrabold text-[#111111]/60 tracking-wider">
                  <th className="py-3 px-3">KA ID</th>
                  <th className="py-3 px-3">Spare Part Name</th>
                  <th className="py-3 px-3">OEM / Brand</th>
                  <th className="py-3 px-3 text-center">Qty Sold</th>
                  <th className="py-3 px-3 text-right">Unit Price</th>
                  <th className="py-3 px-3 text-right">Total Price</th>
                  <th className="py-3 px-3">Customer / Fleet</th>
                  <th className="py-3 px-3">Machine Model</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Receipt #</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSoldItems.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[#111111]/40">
                      No sold items found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSoldItems.map(item => (
                    <tr key={`${item.receipt_id}-${item.part_id}-${item.part_number}`} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-black text-[#111111] px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80">
                          {item.part_number}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#111111] max-w-[200px] leading-tight">
                          {item.name}
                        </div>
                        <span className="text-[10px] text-[#111111]/50 block mt-0.5">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-[#111111] block">
                          {item.oem_number}
                        </span>
                        <span className="text-[10px] text-[#111111]/60 font-semibold">
                          {item.brand}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-[#111111] text-white">
                          {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-medium text-[#111111]/70">
                        {formatMoney(item.unit_price)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-black font-mono text-[#111111]">
                        {formatMoney(item.total_price)}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#111111]">{item.customer_name}</div>
                        {item.customer_phone && (
                          <div className="text-[10px] text-[#111111]/60">{item.customer_phone}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-[#111111]/80 font-medium whitespace-nowrap">
                        {item.equipment_model || '—'}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-[#111111]">{item.date}</div>
                        <div className="text-[10px] text-[#111111]/50 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {item.time}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => {
                            setViewingReceipt(item.fullReceipt);
                            setIsReceiptOpen(true);
                          }}
                          className="font-mono text-[10px] font-bold text-[#111111] hover:text-[#F6AF31] underline decoration-slate-300 underline-offset-2 transition cursor-pointer"
                          title="Click to view full receipt"
                        >
                          {item.receipt_number}
                        </button>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setViewingReceipt(item.fullReceipt);
                            setIsReceiptOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#111111] hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 mx-auto transition cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-[#F6AF31]" />
                          <span>Reprint</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: RECEIPTS ARCHIVE ===================== */}
      {(activeTab === 'receipts' || activeTab === 'history') && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-[#111111] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F6AF31]" />
                <span>Sales Receipts & Invoices Archive</span>
              </h2>
              <p className="text-xs text-[#111111]/60 mt-0.5">
                All issued sales receipts with customer, items breakdown, payment method, and 1-click reprinting.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#111111]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search receipt #, customer, parts..."
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-[#111111] placeholder:text-[#111111]/40 outline-none focus:border-[#111111]"
              />
            </div>
          </div>

          {/* Receipts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-extrabold text-[#111111]/60 tracking-wider">
                  <th className="py-3 px-3">Receipt No.</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Customer / Fleet</th>
                  <th className="py-3 px-3">Equipment</th>
                  <th className="py-3 px-3">Items Sold</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#111111]/40">
                      No sales receipts found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map(receipt => (
                    <tr key={receipt.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-black text-[#111111] px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80">
                          {receipt.receipt_number}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-semibold text-[#111111]">{receipt.date}</div>
                        <div className="text-[10px] text-[#111111]/50 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" /> {receipt.time}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#111111]">{receipt.customer_name}</div>
                        {receipt.customer_phone && (
                          <div className="text-[10px] text-[#111111]/60">{receipt.customer_phone}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-[#111111]/80 font-medium">
                        {receipt.equipment_model || '—'}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#111111]">
                          {receipt.items.reduce((sum, it) => sum + it.quantity, 0)} units
                        </span>
                        <span className="text-[10px] text-[#111111]/60 block truncate max-w-[180px]" title={receipt.items.map(it => it.name).join(', ')}>
                          {receipt.items.map(it => it.name).join(', ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22A06B]/15 text-[#22A06B]">
                          {receipt.payment_method}
                        </span>
                        {receipt.payment_reference && (
                          <span className="text-[9px] font-mono text-[#111111]/60 block mt-0.5">
                            {receipt.payment_reference}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right font-black font-mono text-[#111111] text-sm">
                        {formatMoney(receipt.grand_total)}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setViewingReceipt(receipt);
                            setIsReceiptOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#111111] hover:bg-black text-white text-[11px] font-bold flex items-center gap-1.5 mx-auto transition cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-[#F6AF31]" />
                          <span>Reprint</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        receipt={viewingReceipt}
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setActiveReceipt(null);
        }}
        onNewSale={() => {
          setActiveTab('pos');
        }}
      />
    </div>
  );
};
