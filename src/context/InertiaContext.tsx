import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  InertiaPageProps, 
  InertiaAuthProps, 
  InertiaFlashProps, 
  SparePart,
  RecentTransaction,
  ClientAccount,
  CurrencyCode,
  SaleReceipt,
  OEMSupplier,
  OEMPurchaseOrder,
  OEMPurchaseOrderItem,
  InquiryItem,
  CommercialOrder
} from '../types';
import { 
  INITIAL_OWNER, 
  INITIAL_SPARE_PARTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_CLIENTS,
  INITIAL_RECEIPTS,
  INITIAL_OEM_SUPPLIERS,
  INITIAL_OEM_ORDERS,
  INITIAL_INQUIRIES,
  INITIAL_ORDERS
} from '../data/initialData';
import { getSeriesForCategory } from '../data/partTaxonomy';

const UGX_EXCHANGE_RATE = 3750; // 1 USD = 3,750 UGX

export const generateNextKaratId = (existingParts: SparePart[]): string => {
  let maxNum = 100;
  existingParts.forEach(p => {
    const rawId = p.id || p.part_number || '';
    const match = rawId.match(/^KA(\d{3})$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });
  const nextNum = maxNum + 1;
  return `KA${nextNum}`;
};

interface InertiaContextType {
  props: InertiaPageProps;
  isAuthenticated: boolean;
  currentUser: User | null;
  activeView: string;
  setActiveView: (view: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  updateUser: (userData: Partial<User>) => void;
  resetAllDataToDefaults: () => void;
  formatMoney: (amountInUSD: number, options?: { showCode?: boolean; round?: boolean }) => string;
  formatMoneyShort: (amountInUSD: number) => string;
  getConvertedAmount: (amountInUSD: number) => number;
  parts: SparePart[];
  transactions: RecentTransaction[];
  clients: ClientAccount[];
  receipts: SaleReceipt[];
  activeReceipt: SaleReceipt | null;
  setActiveReceipt: (receipt: SaleReceipt | null) => void;
  deleteReceipt: (receiptId: string) => void;
  selectedPartForSale: SparePart | null;
  startSaleWithPart: (part: SparePart) => void;
  clearSelectedPartForSale: () => void;
  completeSale: (saleData: Omit<SaleReceipt, 'id' | 'receipt_number' | 'timestamp' | 'date' | 'time'>) => SaleReceipt;
  addModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  addPart: (part: Omit<SparePart, 'id'>) => void;
  addMultipleParts: (partsList: Array<Omit<SparePart, 'id'>>) => void;
  updatePart: (updatedPart: SparePart) => void;
  updatePartStock: (partId: string, newStock: number) => void;
  deletePart: (partId: string) => void;
  addTransaction: (tx: Omit<RecentTransaction, 'id'>) => void;
  oemOrders: OEMPurchaseOrder[];
  suppliers: OEMSupplier[];
  addOEMOrder: (order: Omit<OEMPurchaseOrder, 'id' | 'order_date'>) => OEMPurchaseOrder;
  updateOEMOrderStatus: (id: string, status: OEMPurchaseOrder['status'], extra?: { tracking_number?: string; eta?: string; notes?: string }) => void;
  receiveOEMOrderShipment: (orderId: string, receiverName?: string) => void;
  deleteOEMOrder: (id: string) => void;
  inquiries: InquiryItem[];
  orders: CommercialOrder[];
  addInquiry: (inquiry: Omit<InquiryItem, 'id' | 'created_at'>) => InquiryItem;
  updateInquiryStatus: (id: string, status: InquiryItem['status'], extra?: Partial<InquiryItem>) => void;
  deleteInquiry: (id: string) => void;
  convertInquiryToOrder: (inquiryId: string) => CommercialOrder;
  addOrder: (order: Omit<CommercialOrder, 'id' | 'date'>) => CommercialOrder;
  updateOrderStatus: (id: string, status: CommercialOrder['fulfillment_status'], extra?: Partial<CommercialOrder>) => void;
  deleteOrder: (id: string) => void;
  setFlashMessage: (type: 'success' | 'error' | 'info', message: string) => void;
  clearFlash: () => void;
}

const InertiaContext = createContext<InertiaContextType | null>(null);

export const InertiaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication state - check localStorage or default to false to show Login First as requested
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('karat_auth');
      return savedAuth === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('karat_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : INITIAL_OWNER;
      return parsedUser?.name === 'KARAT Administrator'
        ? { ...parsedUser, name: 'Arafat' }
        : parsedUser;
    } catch {
      return INITIAL_OWNER;
    }
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [dateRange, setDateRange] = useState<string>('29 Jun, 2025 - 29 August, 2025');
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('karat_currency');
      return (saved === 'UGX' || saved === 'USD') ? saved : 'USD';
    } catch {
      return 'USD';
    }
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('karat_exchange_rate');
      return saved ? Number(saved) : UGX_EXCHANGE_RATE;
    } catch {
      return UGX_EXCHANGE_RATE;
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('karat_theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    try {
      localStorage.setItem('karat_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light');
  };

  const setExchangeRate = (rate: number) => {
    setExchangeRateState(rate);
    try {
      localStorage.setItem('karat_exchange_rate', String(rate));
    } catch {}
  };

  const updateUser = (userData: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated: User = { ...prev, ...userData };
      try {
        localStorage.setItem('karat_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('karat_currency', newCurrency);
    } catch {
      // ignore
    }
  };

  const getConvertedAmount = (amount: number): number => {
    // 1:1 direct pricing: the exact price placed on the item is what appears systemwide
    return amount;
  };

  const formatMoney = (amount: number, options?: { showCode?: boolean; round?: boolean }): string => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return currency === 'UGX' ? 'UGX 0' : '$0';
    }
    const formatted = options?.round 
      ? Math.round(amount).toLocaleString() 
      : Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    if (currency === 'UGX') {
      return options?.showCode !== false ? `UGX ${formatted}` : formatted;
    }
    return options?.showCode !== false ? `$${formatted}` : formatted;
  };

  const formatMoneyShort = (amount: number): string => {
    if (isNaN(amount) || amount === null || amount === undefined) return '$0';
    const prefix = currency === 'UGX' ? 'UGX ' : '$';
    if (amount >= 1_000_000_000) return `${prefix}${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `${prefix}${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${prefix}${(amount / 1_000).toFixed(0)}k`;
    return `${prefix}${Math.round(amount).toLocaleString()}`;
  };

  const [parts, setParts] = useState<SparePart[]>(() => {
    try {
      const saved = localStorage.getItem('karat_parts_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) => ({
          ...p,
          unit: p.unit || (p.name?.toLowerCase().includes('kit') ? 'KIT' : p.name?.toLowerCase().includes('set') ? 'SET' : p.name?.toLowerCase().includes('assembly') || p.name?.toLowerCase().includes('pump') ? 'ASSY' : 'PCS'),
          taxes: p.taxes || '18% VAT',
          tax_rate: p.tax_rate ?? 18,
          unit_cost: p.unit_cost !== undefined ? p.unit_cost : Math.round((p.unit_price || 0) * 0.65),
          registered_date: p.registered_date || '2026-03-01',
          model: p.model || (p.machinery_models && p.machinery_models.length > 0 ? p.machinery_models.join(', ') : 'Universal Fleet'),
          series: p.series || getSeriesForCategory(p.category)
        }));
      }
      return INITIAL_SPARE_PARTS;
    } catch {
      return INITIAL_SPARE_PARTS;
    }
  });

  const [receipts, setReceipts] = useState<SaleReceipt[]>(() => {
    try {
      const saved = localStorage.getItem('karat_receipts');
      return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
    } catch {
      return INITIAL_RECEIPTS;
    }
  });

  const [activeReceipt, setActiveReceipt] = useState<SaleReceipt | null>(null);
  const [selectedPartForSale, setSelectedPartForSale] = useState<SparePart | null>(null);

  // Sync parts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karat_parts_v3', JSON.stringify(parts));
    } catch {}
  }, [parts]);

  // Sync receipts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karat_receipts', JSON.stringify(receipts));
    } catch {}
  }, [receipts]);

  const [transactions, setTransactions] = useState<RecentTransaction[]>(INITIAL_TRANSACTIONS);

  const [oemOrders, setOemOrders] = useState<OEMPurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem('karat_oem_orders');
      return saved ? JSON.parse(saved) : INITIAL_OEM_ORDERS;
    } catch {
      return INITIAL_OEM_ORDERS;
    }
  });

  const [suppliers] = useState<OEMSupplier[]>(INITIAL_OEM_SUPPLIERS);

  // Sync OEM orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karat_oem_orders', JSON.stringify(oemOrders));
    } catch {}
  }, [oemOrders]);

  const [inquiries, setInquiries] = useState<InquiryItem[]>(() => {
    try {
      const saved = localStorage.getItem('karat_inquiries');
      return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
    } catch {
      return INITIAL_INQUIRIES;
    }
  });

  const [orders, setOrders] = useState<CommercialOrder[]>(() => {
    try {
      const saved = localStorage.getItem('karat_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Sync inquiries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karat_inquiries', JSON.stringify(inquiries));
    } catch {}
  }, [inquiries]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karat_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const [clients] = useState<ClientAccount[]>(INITIAL_CLIENTS);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const [flash, setFlash] = useState<InertiaFlashProps>({
    success: null,
    error: null,
    info: null,
  });

  const authProps: InertiaAuthProps = {
    user: isAuthenticated ? currentUser : null,
    isAuthenticated,
  };

  const pageProps: InertiaPageProps = {
    auth: authProps,
    flash: flash,
    errors: {},
  };

  const setFlashMessage = (type: 'success' | 'error' | 'info', message: string) => {
    setFlash({
      success: type === 'success' ? message : null,
      error: type === 'error' ? message : null,
      info: type === 'info' ? message : null,
    });
  };

  const clearFlash = () => {
    setFlash({ success: null, error: null, info: null });
  };

  useEffect(() => {
    if (flash.success || flash.error || flash.info) {
      const timer = setTimeout(() => {
        setFlash({ success: null, error: null, info: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const login = (identifier: string, _password?: string): boolean => {
    // Authenticate user
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      setFlashMessage('error', 'Please enter your username.');
      return false;
    }

    const isKaratAdmin = cleanId === 'karat';
    const ownerUser: User = {
      ...INITIAL_OWNER,
      name: isKaratAdmin ? 'Arafat' : INITIAL_OWNER.name,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@karat.co.ug`,
    };

    setIsAuthenticated(true);
    setCurrentUser(ownerUser);
    try {
      localStorage.setItem('karat_auth', 'true');
      localStorage.setItem('karat_user', JSON.stringify(ownerUser));
    } catch {
      // LocalStorage fallback
    }

    setFlashMessage('success', 'Welcome back to Karat Heavy Machinery Spare Parts.');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('karat_auth');
      localStorage.removeItem('karat_user');
    } catch {
      // fallback
    }
    setFlashMessage('success', 'You have been securely signed out of KARAT.');
  };

  const addPart = (newPartData: Omit<SparePart, 'id'>) => {
    const assignedId = newPartData.part_number && newPartData.part_number.startsWith('KA')
      ? newPartData.part_number
      : generateNextKaratId(parts);
    
    const newPart: SparePart = {
      ...newPartData,
      id: assignedId,
      part_number: assignedId,
      series: newPartData.series || getSeriesForCategory(newPartData.category),
      unit: newPartData.unit || 'PCS',
      taxes: newPartData.taxes || '18% VAT',
      tax_rate: newPartData.tax_rate ?? 18,
      tax_amount: Number(newPartData.tax_amount) || 0,
      transport_cost: Number(newPartData.transport_cost) || 0,
      unit_cost: Number(newPartData.unit_cost) || 0,
      unit_price: Number(newPartData.unit_price) || 0,
      registered_date: new Date().toISOString().slice(0, 10),
      model: newPartData.model || (newPartData.machinery_models?.join(', ') || ''),
    };
    setParts(prev => [newPart, ...prev]);
    setFlashMessage('success', `Product [${newPart.id}] ${newPart.name} added.`);
  };

  const addMultipleParts = (partsList: Array<Omit<SparePart, 'id'>>) => {
    let currentParts = [...parts];
    const createdParts: SparePart[] = [];

    // calculate starting max KA number
    let maxNum = 100;
    currentParts.forEach(p => {
      const rawId = p.id || p.part_number || '';
      const match = rawId.match(/^KA(\d{3,4})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    for (const item of partsList) {
      let assignedId = item.part_number && item.part_number.startsWith('KA') && !currentParts.some(p => p.id === item.part_number)
        ? item.part_number
        : '';
      
      if (!assignedId) {
        maxNum += 1;
        assignedId = `KA${maxNum}`;
      }

      const stockQty = Number(item.stock_quantity) || 1;
      const minAlert = Number(item.min_stock_alert) || 1;
      const status: SparePart['status'] = stockQty <= minAlert ? 'Low Stock' : 'In Stock';

      const newPart: SparePart = {
        ...item,
        id: assignedId,
        part_number: assignedId,
        series: item.series || getSeriesForCategory(item.category),
        unit: item.unit || 'PCS',
        taxes: item.taxes || '18% VAT',
        tax_rate: item.tax_rate ?? 18,
        tax_amount: Number(item.tax_amount) || 0,
        transport_cost: Number(item.transport_cost) || 0,
        unit_cost: Number(item.unit_cost) || 0,
        unit_price: Number(item.unit_price) || 0,
        registered_date: new Date().toISOString().slice(0, 10),
        model: item.model || (item.machinery_models?.join(', ') || ''),
        stock_quantity: stockQty,
        min_stock_alert: minAlert,
        status: item.status || status,
      };
      createdParts.push(newPart);
      currentParts.push(newPart);
    }

    setParts(prev => [...createdParts, ...prev]);
    setFlashMessage('success', `Bulk import complete: ${createdParts.length} spare parts successfully uploaded into KARAT.`);
  };

  const updatePart = (updatedPart: SparePart) => {
    const enrichedPart = {
      ...updatedPart,
      series: updatedPart.series || getSeriesForCategory(updatedPart.category),
    };
    setParts(prev => prev.map(p => {
      if (p.id === enrichedPart.id) {
        const stockQty = Number(enrichedPart.stock_quantity) || 0;
        const minAlert = Number(enrichedPart.min_stock_alert) || 1;
        const status: SparePart['status'] =
          stockQty === 0 ? 'Out of Stock' : (stockQty <= minAlert ? 'Low Stock' : 'In Stock');
        return {
          ...enrichedPart,
          stock_quantity: stockQty,
          min_stock_alert: minAlert,
          status,
        };
      }
      return p;
    }));
    setFlashMessage('success', `Spare part [${enrichedPart.id}] ${enrichedPart.name} updated.`);
  };

  const updatePartStock = (partId: string, newStock: number) => {
    setParts(prev => prev.map(p => {
      if (p.id === partId) {
        const status: SparePart['status'] = 
          newStock === 0 ? 'Out of Stock' : (newStock <= p.min_stock_alert ? 'Low Stock' : 'In Stock');
        return { ...p, stock_quantity: newStock, status };
      }
      return p;
    }));
    setFlashMessage('success', `Stock for part ${partId} updated to ${newStock} units.`);
  };

  const deletePart = (partId: string) => {
    setParts(prev => prev.filter(p => p.id !== partId));
    setFlashMessage('success', `Part ${partId} removed from catalog.`);
  };

  const addTransaction = (txData: Omit<RecentTransaction, 'id'>) => {
    const newTx: RecentTransaction = {
      ...txData,
      id: `TX-${900 + transactions.length + 1}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    setFlashMessage('success', `Transaction recorded: $${newTx.amount.toLocaleString()} USD`);
  };

  const addOEMOrder = (orderData: Omit<OEMPurchaseOrder, 'id' | 'order_date'>): OEMPurchaseOrder => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const poNumber = 8842 + oemOrders.length;
    const poId = `PO-OEM-${poNumber}`;

    const newPO: OEMPurchaseOrder = {
      ...orderData,
      id: poId,
      order_date: dateStr,
    };

    setOemOrders(prev => [newPO, ...prev]);
    setFlashMessage('success', `OEM Purchase Order ${poId} dispatched to ${newPO.supplier_name}.`);
    return newPO;
  };

  const updateOEMOrderStatus = (
    id: string, 
    status: OEMPurchaseOrder['status'], 
    extra?: { tracking_number?: string; eta?: string; notes?: string }
  ) => {
    setOemOrders(prev => prev.map(order => {
      if (order.id === id) {
        return {
          ...order,
          status,
          tracking_number: extra?.tracking_number !== undefined ? extra.tracking_number : order.tracking_number,
          eta: extra?.eta !== undefined ? extra.eta : order.eta,
          notes: extra?.notes !== undefined ? extra.notes : order.notes,
        };
      }
      return order;
    }));
    setFlashMessage('success', `OEM Purchase Order ${id} updated to ${status}.`);
  };

  const receiveOEMOrderShipment = (orderId: string, receiverName?: string) => {
    const po = oemOrders.find(o => o.id === orderId);
    if (!po) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const grnNum = `GRN-${now.getFullYear()}-0${420 + Math.floor(Math.random() * 80)}`;
    const receivedOfficer = receiverName || currentUser?.name || 'Hassan (Yard Supervisor)';

    // 1. Update OEM order status
    setOemOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'Received & Stocked' as const,
          received_date: dateStr,
          received_by: receivedOfficer,
          grn_number: grnNum,
          items: o.items.map(it => ({
            ...it,
            quantity_received: it.quantity_ordered
          }))
        };
      }
      return o;
    }));

    // 2. Automatically increment stock in parts catalog
    let totalItemsAdded = 0;
    setParts(prevParts => {
      const updated = [...prevParts];
      po.items.forEach(poItem => {
        const existingIdx = updated.findIndex(p => 
          (poItem.part_id && p.id === poItem.part_id) || 
          p.part_number === poItem.part_number || 
          (poItem.oem_number && p.oem_number === poItem.oem_number)
        );

        if (existingIdx >= 0) {
          const part = updated[existingIdx];
          const newQty = part.stock_quantity + poItem.quantity_ordered;
          const newStatus: SparePart['status'] = newQty <= 0 ? 'Out of Stock' : (newQty <= part.min_stock_alert ? 'Low Stock' : 'In Stock');
          updated[existingIdx] = {
            ...part,
            stock_quantity: newQty,
            status: newStatus,
          };
          totalItemsAdded += poItem.quantity_ordered;
        } else {
          const nextId = generateNextKaratId(updated);
          updated.push({
            id: nextId,
            part_number: poItem.part_number,
            oem_number: poItem.oem_number,
            name: poItem.name,
            brand: (poItem.brand as any) || 'Caterpillar',
            category: 'OEM Restock Ingest',
            machinery_models: ['Heavy Equipment Fleet'],
            stock_quantity: poItem.quantity_ordered,
            min_stock_alert: 2,
            unit_cost: poItem.unit_cost,
            unit_price: Math.round(poItem.unit_cost * 1.6),
            warehouse_bin: poItem.target_bin || 'Yard 4 Ingest Bay',
            status: 'In Stock'
          });
          totalItemsAdded += poItem.quantity_ordered;
        }
      });
      return updated;
    });

    // 3. Log a Purchase transaction
    addTransaction({
      name: po.supplier_name,
      subtitle: `${po.id} • ${grnNum} Stock Shelved`,
      type: 'purchase',
      date: dateStr,
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'Successful',
      amount: po.total_cost,
      currency: currency,
      iconType: 'caterpillar',
    });

    setFlashMessage('success', `Shipment ${po.id} verified and stocked! GRN ${grnNum} generated. Added ${totalItemsAdded} units to inventory.`);
  };

  const deleteOEMOrder = (id: string) => {
    setOemOrders(prev => prev.filter(o => o.id !== id));
    setFlashMessage('success', `OEM Order ${id} deleted.`);
  };

  const addInquiry = (inquiryData: Omit<InquiryItem, 'id' | 'created_at'>): InquiryItem => {
    const nextNum = 9480 + inquiries.length + Math.floor(Math.random() * 10);
    const newInquiry: InquiryItem = {
      ...inquiryData,
      id: `INQ-${nextNum}`,
      created_at: new Date().toISOString().split('T')[0],
      status: inquiryData.status || 'Draft',
    };
    setInquiries(prev => [newInquiry, ...prev]);
    setFlashMessage('success', `Inquiry ${newInquiry.id} created successfully.`);
    return newInquiry;
  };

  const updateInquiryStatus = (id: string, status: InquiryItem['status'], extra?: Partial<InquiryItem>) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status, ...extra } : inq));
    setFlashMessage('success', `Inquiry ${id} status updated to ${status}.`);
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(inq => inq.id !== id));
    setFlashMessage('success', `Inquiry ${id} deleted.`);
  };

  const convertInquiryToOrder = (inquiryId: string): CommercialOrder => {
    const inq = inquiries.find(i => i.id === inquiryId);
    const orderNum = `ORD-2026-0${88 + orders.length}`;
    const newOrder: CommercialOrder = {
      id: orderNum,
      po_reference: `PO-${inq?.customer_company?.substring(0, 5).toUpperCase() || 'CUST'}-${Math.floor(1000 + Math.random() * 9000)}`,
      inquiry_id: inquiryId,
      customer_name: inq?.customer_name || 'Customer',
      customer_company: inq?.customer_company,
      customer_phone: inq?.customer_phone,
      customer_email: inq?.customer_email,
      equipment_model: inq?.equipment_model || 'Universal Fleet',
      delivery_site: inq?.delivery_site || 'Kampala Depot (Yard 4 - Industrial Area)',
      delivery_method: 'Warehouse Pickup (Yard 4 - Industrial Area)',
      items: inq?.items || [],
      subtotal: inq?.quoted_amount || 0,
      total_amount: inq?.quoted_amount || 0,
      payment_status: '30-Day Credit Account',
      fulfillment_status: 'Processing & Packing',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      notes: inq?.notes,
    };
    setOrders(prev => [newOrder, ...prev]);
    setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: 'Converted to Order', converted_order_id: newOrder.id } : i));
    setFlashMessage('success', `Inquiry ${inquiryId} converted to Commercial Order ${newOrder.id}.`);
    return newOrder;
  };

  const addOrder = (orderData: Omit<CommercialOrder, 'id' | 'date'>): CommercialOrder => {
    const orderNum = `ORD-2026-0${89 + orders.length}`;
    const newOrder: CommercialOrder = {
      ...orderData,
      id: orderNum,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };
    setOrders(prev => [newOrder, ...prev]);
    setFlashMessage('success', `Commercial Order ${newOrder.id} registered successfully.`);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: CommercialOrder['fulfillment_status'], extra?: Partial<CommercialOrder>) => {
    setOrders(prev => prev.map(ord => ord.id === id ? { ...ord, fulfillment_status: status, ...extra } : ord));
    setFlashMessage('success', `Order ${id} status updated to ${status}.`);
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(ord => ord.id !== id));
    setFlashMessage('success', `Order ${id} deleted.`);
  };

  const startSaleWithPart = (part: SparePart) => {
    setSelectedPartForSale(part);
    setActiveView('pos');
  };

  const clearSelectedPartForSale = () => {
    setSelectedPartForSale(null);
  };

  const completeSale = (saleData: Omit<SaleReceipt, 'id' | 'receipt_number' | 'timestamp' | 'date' | 'time'>): SaleReceipt => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const nextReceiptNum = 816 + receipts.length;
    const receiptNumber = `RCT-2026-0${nextReceiptNum}`;

    const newReceipt: SaleReceipt = {
      ...saleData,
      id: receiptNumber,
      receipt_number: receiptNumber,
      date: dateStr,
      time: timeStr,
      timestamp: now.getTime(),
    };

    // 1. Deduct stock quantity in real-time from inventory
    setParts(prevParts => {
      const updated = prevParts.map(p => {
        const soldItem = saleData.items.find(
          it => it.part_id === p.id || it.part_number === p.id || it.part_number === p.part_number
        );
        if (soldItem) {
          const newStock = Math.max(0, p.stock_quantity - soldItem.quantity);
          const status: SparePart['status'] =
            newStock === 0 ? 'Out of Stock' : (newStock <= p.min_stock_alert ? 'Low Stock' : 'In Stock');
          return {
            ...p,
            stock_quantity: newStock,
            status,
          };
        }
        return p;
      });
      return updated;
    });

    // 2. Add receipt to receipts list
    setReceipts(prev => [newReceipt, ...prev]);

    // 3. Log transaction
    const primaryItem = saleData.items[0];
    const itemsSummary = primaryItem 
      ? (saleData.items.length === 1 
          ? primaryItem.name 
          : `${primaryItem.name} + ${saleData.items.length - 1} more`)
      : 'Machinery Parts Sale';

    const newTx: RecentTransaction = {
      id: `TX-${900 + transactions.length + 1}`,
      name: saleData.customer_name || 'Walk-in Customer',
      subtitle: `${itemsSummary} • ${receiptNumber}`,
      type: 'sale',
      date: dateStr,
      time: timeStr,
      status: 'Successful',
      amount: saleData.grand_total,
      currency: saleData.currency,
      iconType: 'caterpillar',
    };
    setTransactions(prev => [newTx, ...prev]);

    // 4. Set active receipt for viewing/printing
    setActiveReceipt(newReceipt);

    setFlashMessage(
      'success',
      `Sale complete! Receipt #${receiptNumber} generated for ${saleData.customer_name}. Stock deducted.`
    );

    return newReceipt;
  };

  const deleteReceipt = (receiptId: string) => {
    const receipt = receipts.find(item => item.id === receiptId);
    if (!receipt) return;

    setParts(prevParts => prevParts.map(part => {
      const restoredQuantity = receipt.items
        .filter(item => item.part_id === part.id || item.part_number === part.id || item.part_number === part.part_number)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (restoredQuantity === 0) return part;

      const newStock = part.stock_quantity + restoredQuantity;
      return {
        ...part,
        stock_quantity: newStock,
        status: newStock <= part.min_stock_alert ? 'Low Stock' : 'In Stock',
      };
    }));

    setReceipts(prev => prev.filter(item => item.id !== receiptId));
    setTransactions(prev => prev.filter(transaction => (
      transaction.type !== 'sale' || !transaction.subtitle?.includes(receipt.receipt_number)
    )));
    setActiveReceipt(current => current?.id === receiptId ? null : current);
    setFlashMessage('success', `Receipt ${receipt.receipt_number} deleted and stock restored.`);
  };

  const resetAllDataToDefaults = () => {
    try {
      localStorage.removeItem('karat_parts');
      localStorage.removeItem('karat_parts_v3');
      localStorage.removeItem('karat_receipts');
      localStorage.removeItem('karat_oem_orders');
      localStorage.removeItem('karat_inquiries');
      localStorage.removeItem('karat_orders');
      localStorage.removeItem('karat_exchange_rate');
      localStorage.removeItem('karat_store_settings');
    } catch {}
    setParts(INITIAL_SPARE_PARTS);
    setReceipts(INITIAL_RECEIPTS);
    setOemOrders(INITIAL_OEM_ORDERS);
    setInquiries(INITIAL_INQUIRIES);
    setOrders(INITIAL_ORDERS);
    setExchangeRateState(UGX_EXCHANGE_RATE);
    setFlashMessage('success', 'All system records and inventory reset to factory defaults.');
  };

  return (
    <InertiaContext.Provider
      value={{
        props: pageProps,
        isAuthenticated,
        currentUser,
        activeView,
        setActiveView,
        dateRange,
        setDateRange,
        currency,
        setCurrency,
        exchangeRate,
        setExchangeRate,
        theme,
        toggleTheme,
        updateUser,
        resetAllDataToDefaults,
        formatMoney,
        formatMoneyShort,
        getConvertedAmount,
        parts,
        transactions,
        clients,
        receipts,
        activeReceipt,
        setActiveReceipt,
        deleteReceipt,
        selectedPartForSale,
        startSaleWithPart,
        clearSelectedPartForSale,
        completeSale,
        addModalOpen,
        setAddModalOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        login,
        logout,
        addPart,
        addMultipleParts,
        updatePart,
        updatePartStock,
        deletePart,
        addTransaction,
        oemOrders,
        suppliers,
        addOEMOrder,
        updateOEMOrderStatus,
        receiveOEMOrderShipment,
        deleteOEMOrder,
        inquiries,
        orders,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        convertInquiryToOrder,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        setFlashMessage,
        clearFlash,
      }}
    >
      {children}
    </InertiaContext.Provider>
  );
};

export function usePage<T = InertiaPageProps>() {
  const context = useContext(InertiaContext);
  if (!context) {
    throw new Error('usePage must be used within an InertiaProvider');
  }
  return {
    props: context.props as unknown as T,
  };
}

export function useInertia() {
  const context = useContext(InertiaContext);
  if (!context) {
    throw new Error('useInertia must be used within an InertiaProvider');
  }
  return context;
}

export function useForm<T extends Record<string, unknown>>(initialData: T) {
  const [data, setDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [processing, setProcessing] = useState(false);
  const [recentlySuccessful, setRecentlySuccessful] = useState(false);

  const setData = (keyOrObject: keyof T | Partial<T>, value?: unknown) => {
    if (typeof keyOrObject === 'string' || typeof keyOrObject === 'number' || typeof keyOrObject === 'symbol') {
      setDataState(prev => ({ ...prev, [keyOrObject]: value }));
    } else if (typeof keyOrObject === 'object' && keyOrObject !== null) {
      setDataState(prev => ({ ...prev, ...keyOrObject }));
    }
  };

  const reset = () => {
    setDataState(initialData);
    setErrors({});
  };

  return {
    data,
    setData,
    errors,
    processing,
    setProcessing,
    recentlySuccessful,
    setRecentlySuccessful,
    reset,
  };
}
