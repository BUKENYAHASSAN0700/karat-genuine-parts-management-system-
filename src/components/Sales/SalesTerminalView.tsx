import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  History,
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { UIcon } from '../Common/UIcon';
import { useInertia } from '../../context/InertiaContext';
import { SparePart, SaleReceiptItem, SaleReceipt, ReceiptDraft, ReceiptDraftItem } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { SERIES_LIST, getSeriesForCategory, getCategoriesForSeries, MANUFACTURER_BRANDS } from '../../data/partTaxonomy';
import { cleanModelName } from '../../utils/modelUtils';

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
    deleteReceipt,
    receiptDrafts,
    activeDraftId,
    setActiveDraftId,
    saveReceiptDraft,
    updateReceiptDraft,
    deleteReceiptDraft,
    clearAllReceiptDrafts,
    selectedPartForSale,
    clearSelectedPartForSale,
    setFlashMessage
  } = useInertia();

  // Active Tab: 'pos' (active sale register), 'drafts' (receipt drafts CRUD), 'sold-items' (itemized parts sold history), or 'receipts' (receipts archive)
  const [activeTab, setActiveTab] = useState<'pos' | 'drafts' | 'sold-items' | 'receipts'>('pos');

  // Catalog filtering & searching
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedSeries, setSelectedSeries] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState(true);

  // Cart Register State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer & Transaction Information
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [cashierName, setCashierName] = useState(() => currentUser?.name || 'Arafat');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Mobile Money' | 'Bank Wire' | 'Card' | 'Credit Account'>('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Drafts Management State (CRUD)
  const [draftsSearch, setDraftsSearch] = useState('');
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<ReceiptDraft | null>(null);
  const [editDraftName, setEditDraftName] = useState('');
  const [editDraftPhone, setEditDraftPhone] = useState('');
  const [editDraftIssuer, setEditDraftIssuer] = useState('');
  const [editDraftNotes, setEditDraftNotes] = useState('');

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

  // Store refs so unmount effect has access to current state when moving to another page
  const cartRef = useRef(cart);
  const customerNameRef = useRef(customerName);
  const customerPhoneRef = useRef(customerPhone);
  const cashierNameRef = useRef(cashierName);
  const notesRef = useRef(notes);
  const activeDraftIdRef = useRef(activeDraftId);
  const isSaleCompletedRef = useRef(false);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);
  useEffect(() => {
    customerNameRef.current = customerName;
  }, [customerName]);
  useEffect(() => {
    customerPhoneRef.current = customerPhone;
  }, [customerPhone]);
  useEffect(() => {
    cashierNameRef.current = cashierName;
  }, [cashierName]);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  useEffect(() => {
    activeDraftIdRef.current = activeDraftId;
  }, [activeDraftId]);

  // If making a receipt then moving to another page, auto-save the receipt to drafts
  useEffect(() => {
    return () => {
      if (isSaleCompletedRef.current) return;
      const currentCart = cartRef.current;
      if (!currentCart || currentCart.length === 0) return;

      const draftItems: ReceiptDraftItem[] = currentCart.map(item => ({
        part_id: item.part.id,
        part_number: item.part.part_number,
        oem_number: item.part.oem_number || '',
        name: item.part.name,
        brand: item.part.brand,
        category: item.part.category,
        quantity: item.quantity,
        unit_price: item.custom_unit_price,
        total_price: item.custom_unit_price * item.quantity,
        model: cleanModelName(item.part.model || (item.part.machinery_models?.[0] || 'Standard'), item.part.brand),
      }));

      const subtotalVal = currentCart.reduce((acc, item) => acc + (item.custom_unit_price * item.quantity), 0);
      const draftData = {
        customer_name: customerNameRef.current.trim() || 'Walk-in Client',
        customer_phone: customerPhoneRef.current.trim(),
        issued_by: cashierNameRef.current.trim() || currentUser?.name || 'Arafat',
        items: draftItems,
        subtotal: subtotalVal,
        notes: notesRef.current.trim(),
      };

      try {
        const savedDraftsRaw = localStorage.getItem('karat_receipt_drafts');
        const draftsList: ReceiptDraft[] = savedDraftsRaw ? JSON.parse(savedDraftsRaw) : [];
        const existingId = activeDraftIdRef.current;
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        
        const existingIdx = draftsList.findIndex(d => d.id === existingId || d.draft_code === existingId);
        if (existingIdx >= 0) {
          draftsList[existingIdx] = {
            ...draftsList[existingIdx],
            ...draftData,
            updated_at: dateStr,
            timestamp: now.getTime(),
          };
        } else {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          const newDraft: ReceiptDraft = {
            ...draftData,
            id: code,
            draft_code: code,
            created_at: dateStr,
            updated_at: dateStr,
            timestamp: now.getTime(),
          };
          draftsList.unshift(newDraft);
        }
        localStorage.setItem('karat_receipt_drafts', JSON.stringify(draftsList));
      } catch {}

      saveReceiptDraft(draftData, activeDraftIdRef.current || undefined);
    };
  }, []);

  // Filter Parts for Catalog
  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      if (inStockOnly && p.stock_quantity <= 0) return false;
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      const partSeries = p.series || getSeriesForCategory(p.category);
      if (selectedSeries !== 'All' && partSeries !== selectedSeries) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

      if (!catalogSearch.trim()) return true;
      const q = catalogSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.part_number.toLowerCase().includes(q) ||
        p.oem_number.toLowerCase().includes(q) ||
        (p.series && p.series.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.machinery_models.some(m => m.toLowerCase().includes(q)) ||
        p.warehouse_bin.toLowerCase().includes(q)
      );
    });
  }, [parts, catalogSearch, selectedBrand, selectedSeries, selectedCategory, inStockOnly]);

  const categories = useMemo(() => {
    if (selectedSeries !== 'All') {
      return ['All', ...getCategoriesForSeries(selectedSeries)];
    }
    const set = new Set(parts.map(p => p.category));
    return ['All', ...Array.from(set)];
  }, [parts, selectedSeries]);

  const brands = useMemo(() => {
    return Array.from(new Set(['All', ...MANUFACTURER_BRANDS, ...parts.map(p => p.brand)]));
  }, [parts]);

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
    setCustomerName('');
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

  // Cash change calculation
  const numericTendered = parseFloat(cashTendered) || 0;
  const changeDue = numericTendered > grandTotal ? numericTendered - grandTotal : 0;

  // Switch tab with auto-save to drafts if moving away from active cart
  const handleSwitchTab = (newTab: 'pos' | 'drafts' | 'sold-items' | 'receipts') => {
    if (activeTab === 'pos' && newTab !== 'pos' && cart.length > 0) {
      handleSaveAsDraft();
    }
    setActiveTab(newTab);
  };

  // Complete Sale and issue receipt
  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setFlashMessage('error', 'The sale cart is empty. Add at least one spare part from the catalog.');
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
      model: cleanModelName(item.part.model || (item.part.machinery_models?.[0] || 'Standard'), item.part.brand),
    }));

    const saleRecord = {
      customer_name: customerName.trim() || 'Walk-in Client',
      customer_phone: customerPhone.trim(),
      customer_company: customerCompany.trim(),
      items: saleItems,
      subtotal,
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      grand_total: subtotal,
      payment_method: 'Cash' as const,
      payment_status: 'Paid' as const,
      amount_tendered: subtotal,
      change_due: 0,
      cashier_name: cashierName.trim() || currentUser?.name || 'Arafat',
      notes: notes.trim(),
      currency: currency,
    };

    isSaleCompletedRef.current = true;
    const newReceipt = completeSale(saleRecord);

    if (activeDraftId) {
      deleteReceiptDraft(activeDraftId);
      setActiveDraftId(null);
    }

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

  // Drafts CRUD Handlers
  const handleSaveAsDraft = () => {
    if (cart.length === 0) {
      setFlashMessage('error', 'Add at least one spare part to the cart before saving as draft.');
      return;
    }

    const draftItems = cart.map(item => ({
      part_id: item.part.id,
      part_number: item.part.part_number,
      oem_number: item.part.oem_number,
      name: item.part.name,
      brand: item.part.brand,
      category: item.part.category,
      quantity: item.quantity,
      unit_price: item.custom_unit_price,
      total_price: item.custom_unit_price * item.quantity,
      model: cleanModelName(item.part.model || (item.part.machinery_models?.[0] || 'Standard'), item.part.brand),
    }));

    const saved = saveReceiptDraft({
      customer_name: customerName.trim() || 'Walk-in Client',
      customer_phone: customerPhone.trim(),
      issued_by: cashierName.trim() || currentUser?.name || 'Arafat',
      items: draftItems,
      subtotal,
      notes: notes.trim(),
    }, activeDraftId || undefined);

    setActiveDraftId(saved.id);
  };

  const handleResumeDraft = (draft: ReceiptDraft) => {
    const loadedCart: CartItem[] = draft.items.map(it => {
      const livePart = parts.find(p => p.id === it.part_id || p.part_number === it.part_number);
      const basePart: SparePart = livePart || {
        id: it.part_id,
        part_number: it.part_number,
        oem_number: it.oem_number,
        name: it.name,
        brand: (it.brand as any) || 'Caterpillar',
        category: it.category,
        model: cleanModelName(it.model || 'Standard', it.brand),
        machinery_models: [cleanModelName(it.model || 'Standard', it.brand)],
        stock_quantity: 99,
        min_stock_alert: 2,
        unit_cost: Math.round(it.unit_price * 0.65),
        unit_price: it.unit_price,
        warehouse_bin: 'General Storage',
        status: 'In Stock',
      };
      return {
        part: basePart,
        quantity: it.quantity,
        custom_unit_price: it.unit_price,
      };
    });

    setCart(loadedCart);
    setCustomerName(draft.customer_name === 'CASH' || draft.customer_name === 'Walk-in Client' ? '' : draft.customer_name);
    setCustomerPhone(draft.customer_phone || '');
    setCashierName(draft.issued_by || currentUser?.name || 'Arafat');
    setNotes(draft.notes || '');
    setActiveDraftId(draft.id);
    setActiveTab('pos');
    setFlashMessage('info', `Draft #${draft.draft_code} loaded into register. You can make adjustments and complete the sale.`);
  };

  const handleCompleteDraftDirectly = (draft: ReceiptDraft) => {
    // Check stock for draft items
    for (const item of draft.items) {
      const livePart = parts.find(p => p.id === item.part_id || p.part_number === item.part_number);
      if (livePart && livePart.stock_quantity < item.quantity) {
        setFlashMessage('error', `Insufficient stock for ${item.name}. Only ${livePart.stock_quantity} available in warehouse.`);
        return;
      }
    }

    const saleItems: SaleReceiptItem[] = draft.items.map(it => ({
      part_id: it.part_id,
      part_number: it.part_number,
      oem_number: it.oem_number,
      name: it.name,
      brand: it.brand,
      category: it.category,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total_price: it.total_price,
      model: it.model || 'Standard',
    }));

    const saleRecord = {
      customer_name: draft.customer_name || 'Walk-in Client',
      customer_phone: draft.customer_phone || '',
      cashier_name: draft.issued_by || currentUser?.name || 'Arafat',
      items: saleItems,
      subtotal: draft.subtotal,
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      grand_total: draft.subtotal,
      payment_method: 'Cash' as const,
      payment_status: 'Paid' as const,
      amount_tendered: draft.subtotal,
      change_due: 0,
      currency: currency,
      notes: draft.notes,
    };

    const newReceipt = completeSale(saleRecord);
    deleteReceiptDraft(draft.id);
    if (activeDraftId === draft.id) {
      setActiveDraftId(null);
      setCart([]);
    }
    setViewingReceipt(newReceipt);
    setIsReceiptOpen(true);
  };

  const handleOpenQuickEditDraft = (draft: ReceiptDraft) => {
    setEditingDraft(draft);
    setEditDraftName(draft.customer_name);
    setEditDraftPhone(draft.customer_phone || '');
    setEditDraftIssuer(draft.issued_by);
    setEditDraftNotes(draft.notes || '');
  };

  const handleSaveQuickEditDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDraft) return;
    updateReceiptDraft(editingDraft.id, {
      customer_name: editDraftName.trim() || 'Walk-in Client',
      customer_phone: editDraftPhone.trim(),
      issued_by: editDraftIssuer.trim() || 'Arafat',
      notes: editDraftNotes.trim(),
    });
    setEditingDraft(null);
  };

  // Filter drafts for drafts tab
  const filteredDrafts = useMemo(() => {
    if (!draftsSearch.trim()) return receiptDrafts;
    const q = draftsSearch.toLowerCase();
    return receiptDrafts.filter(d =>
      d.draft_code.toLowerCase().includes(q) ||
      d.customer_name.toLowerCase().includes(q) ||
      (d.customer_phone && d.customer_phone.toLowerCase().includes(q)) ||
      (d.issued_by && d.issued_by.toLowerCase().includes(q)) ||
      d.items.some(it => it.name.toLowerCase().includes(q) || it.part_number.toLowerCase().includes(q) || (it.model && it.model.toLowerCase().includes(q)))
    );
  }, [receiptDrafts, draftsSearch]);

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

  const handleDeleteReceipt = (receipt: SaleReceipt) => {
    deleteReceipt(receipt.id);
    setViewingReceipt(current => current?.id === receipt.id ? null : current);
    setIsReceiptOpen(current => current && viewingReceipt?.id === receipt.id ? false : current);
  };

  return (
    <div className="space-y-5">
      {/* Module Title & Navigation Tabs Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight font-poppins">
            Shop
          </h1>
        </div>

        {/* View Switcher Tabs: Sell Register, Drafts, Receipts Archive, Sold Items */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap w-full md:w-auto">
          <button
            onClick={() => handleSwitchTab('pos')}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F7F6F3] text-[#111111] hover:bg-slate-200/70 border border-slate-200/80'
            }`}
          >
            <UIcon name="shopping-cart" className="text-sm text-[#F6AF31]" />
            <span>Sell Products</span>
            {cart.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#F6AF31] text-[#111111] font-mono font-bold text-[10px]">
                {cart.reduce((s, it) => s + it.quantity, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSwitchTab('drafts')}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'drafts'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F7F6F3] text-[#111111] hover:bg-slate-200/70 border border-slate-200/80'
            }`}
            title="Receipt Drafts"
          >
            <FileText className="w-3.5 h-3.5 text-[#F6AF31]" />
            <span>Drafts</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[#111111] font-mono font-bold text-[10px]">
              {receiptDrafts.length}
            </span>
          </button>

          <button
            onClick={() => handleSwitchTab('receipts')}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'receipts'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F7F6F3] text-[#111111] hover:bg-slate-200/70 border border-slate-200/80'
            }`}
            title="Receipts"
          >
            <UIcon name="receipt" className="text-sm opacity-80" />
            <span>Receipts</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[#111111] font-mono font-bold text-[10px]">
              {receipts.length}
            </span>
          </button>

          <button
            onClick={() => handleSwitchTab('sold-items')}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'sold-items'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F7F6F3] text-[#111111] hover:bg-slate-200/70 border border-slate-200/80'
            }`}
            title="Sold Items"
          >
            <UIcon name="time-past" className="text-sm opacity-80" />
            <span>Sold Items</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-[#111111] font-mono font-bold text-[10px]">
              {totalItemsSold}
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
                <h2 className="text-base font-extrabold text-[#111111]">
                  Spare Parts Catalog
                </h2>
                <p className="text-[11px] text-[#111111]/50">
                  Showing {filteredParts.length} available items
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

            {/* Series and Category Cascading Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Filter by Series</label>
                <select
                  value={selectedSeries}
                  onChange={(e) => {
                    setSelectedSeries(e.target.value);
                    setSelectedCategory('All');
                  }}
                  className="w-full bg-[#F7F6F3] hover:bg-slate-100/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] outline-none cursor-pointer"
                >
                  <option value="All">All Series</option>
                  {SERIES_LIST.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#F7F6F3] hover:bg-slate-100/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parts Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1 no-scrollbar">
              {filteredParts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-[#111111]/50 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-[#111111]/30 stroke-[1.5]" />
                  <p className="text-xs font-semibold">
                    {parts.length === 0
                      ? 'No products are available in the catalog.'
                      : 'No spare parts matching your filter.'}
                  </p>
                  {parts.length > 0 && (
                    <button
                      onClick={() => {
                        setCatalogSearch('');
                        setSelectedBrand('All');
                        setSelectedSeries('All');
                        setSelectedCategory('All');
                        setInStockOnly(false);
                      }}
                      className="text-xs font-bold text-[#111111] underline hover:text-[#F6AF31]"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>
              ) : (
                filteredParts.map(part => {
                  const inCartItem = cart.find(item => item.part.id === part.id);
                  const inCartQty = inCartItem ? inCartItem.quantity : 0;
                  const remainingStock = Math.max(0, part.stock_quantity - inCartQty);
                  const isOutOfStock = remainingStock <= 0;
                  const isLowStock = remainingStock > 0 && remainingStock <= part.min_stock_alert;
                  const cleanModel = cleanModelName(part.model || (part.machinery_models && part.machinery_models.length > 0 ? part.machinery_models[0] : 'Standard'), part.brand);

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
                        {/* Part ID - Highlighted manufacturer badge removed */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-slate-100 text-[#111111] border border-slate-200/80">
                            {part.part_number}
                          </span>
                        </div>

                        {/* Part Name */}
                        <h3 className="text-xs font-extrabold text-[#111111] mt-1.5 line-clamp-2 leading-snug" title={part.name}>
                          {part.name}
                        </h3>

                        {/* Series & Category Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-[9px] font-bold text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded">
                            {part.series || getSeriesForCategory(part.category)}
                          </span>
                          <span className="text-[9px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                            {part.category}
                          </span>
                        </div>

                        {/* Machinery Model without company name */}
                        <div className="text-[10px] text-[#111111]/70 mt-1 flex items-center gap-1 truncate font-medium">
                          <span className="font-bold text-[#111111]/80">Model:</span>
                          <span className="truncate">{cleanModel}</span>
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
                              <span className="text-[9px] font-bold text-[#DC2626] uppercase">
                                {part.stock_quantity <= 0 ? 'Out of Stock' : '0 left in stock (In Cart)'}
                              </span>
                            ) : (
                              <span className={`text-[9px] font-bold ${isLowStock ? 'text-amber-600' : 'text-[#22A06B]'}`}>
                                {remainingStock} left in stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Add / In-Cart controls */}
                        {isOutOfStock && !inCartItem ? (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-400 text-[11px] font-bold cursor-not-allowed"
                          >
                            Out
                          </button>
                        ) : inCartItem ? (
                          <div className="flex items-center gap-1 bg-[#111111] text-white p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(part.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-xs">
                              {inCartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(part.id, 1)}
                              disabled={inCartItem.quantity >= part.stock_quantity}
                              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
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

            {/* If currently editing a resumed draft, show indicator banner */}
            {activeDraftId && (
              <div className="bg-[#FFF8E7] border border-[#F6AF31]/50 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F6AF31]" />
                  <div>
                    <span className="font-extrabold text-[#111111] block">
                      Active Draft #{activeDraftId}
                    </span>
                    <span className="text-[10px] text-[#111111]/60">
                      Changes will update this draft or complete into an official receipt.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDraftId(null);
                    handleClearCart();
                    setFlashMessage('info', 'Exited draft editing.');
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-black underline cursor-pointer shrink-0 ml-2"
                >
                  Cancel Draft
                </button>
              </div>
            )}

            {/* Current Order Flow */}
            <form onSubmit={handleCompleteSale} className="space-y-4">
              {/* Customer & Issuer Information */}
              <div className="bg-[#F7F6F3] border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] uppercase font-extrabold text-[#111111]/70 tracking-wider block mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Enter client name..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-extrabold text-[#111111]/70 tracking-wider block mb-1">
                      Client Phone Number
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +256 701 234 567"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-extrabold text-[#111111]/70 tracking-wider block mb-1">
                    Issued By (Receipt Officer)
                  </label>
                  <input
                    type="text"
                    value={cashierName}
                    onChange={e => setCashierName(e.target.value)}
                    placeholder="e.g. Arafat"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                  />
                </div>
              </div>

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
                  <div className="divide-y divide-slate-200/70 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                    {cart.map(item => (
                      <div key={item.part.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-[#111111] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {item.part.part_number}
                            </span>
                            <span className="text-xs font-bold text-[#111111] truncate block" title={item.part.name}>
                              {item.part.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#111111]/60 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>Model: <strong className="text-[#111111]">{cleanModelName(item.part.model || 'Standard', item.part.brand)}</strong></span>
                            <span>•</span>
                            <span>{formatMoney(item.custom_unit_price)} each</span>
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
                            <span className="w-6 text-center font-mono font-bold text-xs text-[#111111]">
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
                            className="text-slate-400 hover:text-[#DC2626] transition p-1 cursor-pointer"
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

              {/* Grand Total Summary Display */}
              <div className="border-t-2 border-[#111111] pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#111111]/70">
                  <span>Total Items:</span>
                  <span className="font-mono font-bold text-[#111111]">
                    {cart.reduce((s, it) => s + it.quantity, 0)} Units
                  </span>
                </div>

                <div className="pt-1">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#111111]">
                    {formatMoney(subtotal)}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    Total Price
                  </div>
                </div>
              </div>

              {/* Action Buttons: Save as Draft & Complete Sale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={cart.length === 0}
                  className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#111111] border border-slate-300 font-extrabold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#F6AF31]" />
                  <span>{activeDraftId ? 'Update Draft' : 'Save as Draft'}</span>
                </button>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full py-3 rounded-2xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
                >
                  <Check className="w-4 h-4" />
                  <span>Complete Sale</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== TAB: RECEIPT DRAFTS (CRUD) ===================== */}
      {activeTab === 'drafts' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-bold text-xs shrink-0">
                  <FileText className="w-4 h-4 text-[#F6AF31]" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#111111] tracking-tight">
                    Order Drafts & Pending Receipts
                  </h2>
                  <p className="text-xs text-[#111111]/60">
                    Manage incomplete orders, hold customer receipts, resume editing, or finalize sales.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Input for Drafts */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#111111]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={draftsSearch}
                  onChange={(e) => setDraftsSearch(e.target.value)}
                  placeholder="Search drafts, client, item..."
                  className="w-full bg-[#F7F6F3] border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-[#111111] placeholder:text-[#111111]/40 outline-none focus:border-[#111111]"
                />
                {draftsSearch && (
                  <button
                    onClick={() => setDraftsSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setActiveDraftId(null);
                  handleClearCart();
                  setActiveTab('pos');
                }}
                className="px-4 py-2 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Draft</span>
              </button>

              {receiptDrafts.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all drafts?')) {
                      clearAllReceiptDrafts();
                    }
                  }}
                  className="px-3 py-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition cursor-pointer border border-slate-200"
                  title="Clear all drafts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Drafts List */}
          {filteredDrafts.length === 0 ? (
            <div className="py-16 text-center text-[#111111]/40 space-y-3">
              <FileText className="w-12 h-12 mx-auto text-[#111111]/20 stroke-[1.5]" />
              <div>
                <p className="font-bold text-sm text-[#111111]/70">No order drafts found</p>
                <p className="text-xs text-[#111111]/50 mt-1 max-w-md mx-auto">
                  {draftsSearch ? 'No drafts match your search filter.' : 'When customer orders are in progress, click "Save as Draft" in the sell terminal to store and manage them here.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveDraftId(null);
                  setActiveTab('pos');
                }}
                className="px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-extrabold hover:bg-black transition cursor-pointer"
              >
                Go to Sell Terminal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => {
                const isExpanded = expandedDraftId === draft.id;
                const totalUnits = draft.items.reduce((s, it) => s + it.quantity, 0);

                return (
                  <div
                    key={draft.id}
                    className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-[#F6AF31]/60 transition shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="px-2.5 py-1 rounded-xl bg-neutral-100 border border-neutral-300 font-mono font-black text-xs text-[#111111]">
                          #{draft.draft_code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[#111111]">
                              {draft.customer_name}
                            </span>
                            {draft.customer_phone && (
                              <span className="text-xs font-mono text-[#111111]/60 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#111111]/40" />
                                {draft.customer_phone}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#111111]/60 flex items-center gap-2 mt-0.5 flex-wrap">
                            <span>Issued By: <strong className="text-[#111111]">{draft.issued_by}</strong></span>
                            <span>•</span>
                            <span>Updated: {draft.updated_at}</span>
                            <span>•</span>
                            <span>{draft.items.length} parts ({totalUnits} units)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                        <div className="text-right mr-2">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Draft Total</span>
                          <span className="text-base font-black font-mono text-[#111111]">
                            {formatMoney(draft.subtotal)}
                          </span>
                        </div>

                        {/* Resume in POS button */}
                        <button
                          onClick={() => handleResumeDraft(draft)}
                          className="px-3.5 py-1.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          title="Resume and edit in register"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-[#F6AF31]" />
                          <span>Resume & Edit</span>
                        </button>

                        {/* Complete Sale directly */}
                        <button
                          onClick={() => handleCompleteDraftDirectly(draft)}
                          className="px-3.5 py-1.5 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                          title="Complete sale immediately and issue receipt"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Complete Sale</span>
                        </button>

                        {/* Quick edit */}
                        <button
                          onClick={() => handleOpenQuickEditDraft(draft)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-black hover:bg-slate-50 transition cursor-pointer"
                          title="Edit client info / remarks"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Expand/collapse items */}
                        <button
                          onClick={() => setExpandedDraftId(isExpanded ? null : draft.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-black hover:bg-slate-50 transition cursor-pointer"
                          title={isExpanded ? 'Collapse items' : 'View itemized parts'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Delete draft */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete Draft #${draft.draft_code}?`)) {
                              deleteReceiptDraft(draft.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Itemized Table */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-100 overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50">
                              <th className="py-2 px-2.5">Part No</th>
                              <th className="py-2 px-2.5">Item Name</th>
                              <th className="py-2 px-2.5">Model</th>
                              <th className="py-2 px-2.5 text-center">Qty</th>
                              <th className="py-2 px-2.5 text-right">Unit Price</th>
                              <th className="py-2 px-2.5 text-right">Total Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {draft.items.map((it, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-mono font-bold text-[#111111]">{it.part_number}</td>
                                <td className="py-2 px-2.5 font-medium">{it.name}</td>
                                <td className="py-2 px-2.5 font-mono font-semibold">{it.model || '-'}</td>
                                <td className="py-2 px-2.5 text-center font-mono font-bold">{it.quantity}</td>
                                <td className="py-2 px-2.5 text-right font-mono">{formatMoney(it.unit_price)}</td>
                                <td className="py-2 px-2.5 text-right font-mono font-bold">{formatMoney(it.total_price)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {draft.notes && (
                          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <strong>Remark / Notes: </strong> {draft.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
              </div>
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

          {/* Sold Items - Mobile Card View */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredSoldItems.length === 0 ? (
              <div className="py-12 text-center text-[#111111]/40 text-xs">
                No sold items found matching your filter criteria.
              </div>
            ) : (
              filteredSoldItems.map(item => (
                <div key={`${item.receipt_id}-${item.part_id}-${item.part_number}`} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#111111]">
                        {item.part_number}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.brand}
                      </span>
                    </div>
                    <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-[#111111] text-white">
                      {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#111111] leading-tight">{item.name}</h4>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">Model: {item.model || 'Heavy Machinery'}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#F7F6F3] p-2.5 rounded-xl border border-slate-200/70">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Customer</div>
                      <div className="font-bold text-[#111111]">{item.customer_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Total Price</div>
                      <div className="font-mono font-black text-sm text-[#111111]">{formatMoney(item.total_price)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.date} {item.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setViewingReceipt(item.fullReceipt);
                          setIsReceiptOpen(true);
                        }}
                        className="text-xs font-bold text-[#111111] hover:text-[#F6AF31] underline decoration-slate-300 transition cursor-pointer"
                      >
                        View Receipt #{item.receipt_number}
                      </button>
                      <button
                        onClick={() => handleDeleteReceipt(item.fullReceipt)}
                        className="w-7 h-7 rounded-lg text-[#DC2626] hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                        title="Delete receipt and restore stock"
                        aria-label={`Delete receipt ${item.receipt_number}`}
                      >
                        <UIcon name="trash" className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sold Items Table - Desktop */}
          <div className="hidden md:block overflow-x-auto no-scrollbar">
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setViewingReceipt(item.fullReceipt);
                              setIsReceiptOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-full bg-[#111111] hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-[#F6AF31]" />
                            <span>Reprint</span>
                          </button>
                          <button
                            onClick={() => handleDeleteReceipt(item.fullReceipt)}
                            className="w-7 h-7 rounded-full text-[#DC2626] hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                            title="Delete receipt and restore stock"
                            aria-label={`Delete receipt ${item.receipt_number}`}
                          >
                            <UIcon name="trash" className="text-xs" />
                          </button>
                        </div>
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
      {activeTab === 'receipts' && (
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

          {/* Receipts - Mobile Card View */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredReceipts.length === 0 ? (
              <div className="py-12 text-center text-[#111111]/40 text-xs">
                No sales receipts found matching your search.
              </div>
            ) : (
              filteredReceipts.map(receipt => (
                <div key={receipt.id} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded bg-[#111111] text-[#F6AF31]">
                      {receipt.receipt_number}
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22A06B]/15 text-[#22A06B]">
                      {receipt.payment_method}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-[#F7F6F3] p-2.5 rounded-xl border border-slate-200/70">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Customer / Fleet</div>
                      <div className="font-bold text-[#111111]">{receipt.customer_name}</div>
                      {receipt.customer_phone && (
                        <div className="text-[10px] text-slate-500">{receipt.customer_phone}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Grand Total</div>
                      <div className="font-mono font-black text-sm text-[#111111]">
                        {formatMoney(receipt.grand_total)}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">
                      {receipt.items.reduce((sum, it) => sum + it.quantity, 0)} units:
                    </span>{' '}
                    <span className="text-slate-500">
                      {receipt.items.map(it => it.name).join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{receipt.date} {receipt.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setViewingReceipt(receipt);
                          setIsReceiptOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#111111] text-[#F6AF31] hover:bg-black font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>View & Print</span>
                      </button>
                      <button
                        onClick={() => handleDeleteReceipt(receipt)}
                        className="w-8 h-8 rounded-xl text-[#DC2626] hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                        title="Delete receipt and restore stock"
                        aria-label={`Delete receipt ${receipt.receipt_number}`}
                      >
                        <UIcon name="trash" className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Receipts Table - Desktop */}
          <div className="hidden md:block overflow-x-auto no-scrollbar">
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setViewingReceipt(receipt);
                              setIsReceiptOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#111111] hover:bg-black text-white text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-[#F6AF31]" />
                            <span>Reprint</span>
                          </button>
                          <button
                            onClick={() => handleDeleteReceipt(receipt)}
                            className="w-7 h-7 rounded-full text-[#DC2626] hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                            title="Delete receipt and restore stock"
                            aria-label={`Delete receipt ${receipt.receipt_number}`}
                          >
                            <UIcon name="trash" className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Edit Draft Modal */}
      {editingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#111111]">
                  Edit Draft #{editingDraft.draft_code}
                </h3>
                <p className="text-xs text-[#111111]/60">Update customer and order details</p>
              </div>
              <button
                onClick={() => setEditingDraft(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEditDraft} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={editDraftName}
                  onChange={e => setEditDraftName(e.target.value)}
                  className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Client Phone Number
                </label>
                <input
                  type="text"
                  value={editDraftPhone}
                  onChange={e => setEditDraftPhone(e.target.value)}
                  placeholder="+256..."
                  className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Issued By
                </label>
                <input
                  type="text"
                  value={editDraftIssuer}
                  onChange={e => setEditDraftIssuer(e.target.value)}
                  className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Remark / Notes
                </label>
                <textarea
                  rows={2}
                  value={editDraftNotes}
                  onChange={e => setEditDraftNotes(e.target.value)}
                  placeholder="Order notes, pickup remarks..."
                  className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDraft(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black transition cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
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
