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
  ReceiptDraft,
  OEMSupplier,
  OEMPurchaseOrder,
  OEMPurchaseOrderItem,
  InquiryItem,
  CommercialOrder,
  AppNotification
} from '../types';
import { 
  INITIAL_OWNER, 
  INITIAL_SPARE_PARTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_CLIENTS,
  INITIAL_RECEIPTS,
  INITIAL_RECEIPT_DRAFTS,
  INITIAL_OEM_SUPPLIERS,
  INITIAL_OEM_ORDERS,
  INITIAL_INQUIRIES,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';
import { getSeriesForCategory } from '../data/partTaxonomy';
import { cleanModelName } from '../utils/modelUtils';

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

export const generateSixVarcharReceiptNumber = (existingReceipts: SaleReceipt[] = []): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  let attempts = 0;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
  } while (attempts < 200 && existingReceipts.some(r => r.receipt_number === code));
  return code;
};

export const generateSixVarcharDraftCode = (existingDrafts: ReceiptDraft[] = []): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  let attempts = 0;
  do {
    code = 'D';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
  } while (attempts < 200 && existingDrafts.some(d => d.draft_code === code || d.id === code));
  return code;
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
  convertToBaseUGX: (amount: number) => number;
  parts: SparePart[];
  transactions: RecentTransaction[];
  clients: ClientAccount[];
  receipts: SaleReceipt[];
  activeReceipt: SaleReceipt | null;
  setActiveReceipt: (receipt: SaleReceipt | null) => void;
  deleteReceipt: (receiptId: string) => void;
  receiptDrafts: ReceiptDraft[];
  activeDraftId: string | null;
  setActiveDraftId: (id: string | null) => void;
  saveReceiptDraft: (draftData: Omit<ReceiptDraft, 'id' | 'draft_code' | 'created_at' | 'updated_at' | 'timestamp'>, existingDraftId?: string) => ReceiptDraft;
  updateReceiptDraft: (id: string, updates: Partial<ReceiptDraft>) => void;
  deleteReceiptDraft: (id: string) => void;
  clearAllReceiptDrafts: () => void;
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
  notifications: AppNotification[];
  notificationsEnabled: boolean;
  toggleNotificationsEnabled: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'createdAt' | 'read'>) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;
}

const InertiaContext = createContext<InertiaContextType | null>(null);

const cleanLocation = (val?: string) => {
  if (!val) return 'Section 1 - Shelf 1';
  return val
    .replace(/\bAisle\b/gi, 'Section')
    .replace(/\bCabinet\b/gi, 'Storage')
    .replace(/\bTray\b/gi, 'Box')
    .replace(/\bWarehouse Bin:?\s*/gi, '')
    .replace(/\bSafety Threshold:?\s*/gi, '')
    .trim();
};

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
      if (parsedUser) {
        if (!parsedUser.name || parsedUser.name === 'KARAT Administrator' || parsedUser.name === 'Hassan') {
          parsedUser.name = 'Arafat';
        }
        if (!parsedUser.email || parsedUser.email === 'owner@karat.com') {
          parsedUser.email = 'karat@karat.co.ug';
        }
        if (!parsedUser.avatar) {
          parsedUser.avatar = '/karat.svg';
        }
      }
      return parsedUser;
    } catch {
      return INITIAL_OWNER;
    }
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [dateRange, setDateRange] = useState<string>('29 Jun, 2025 - 29 August, 2025');
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('karat_currency');
      return (saved === 'UGX' || saved === 'USD') ? saved : 'UGX';
    } catch {
      return 'UGX';
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
    const validRate = (typeof rate === 'number' && rate > 0) ? rate : 3750;
    setExchangeRateState(validRate);
    try {
      localStorage.setItem('karat_exchange_rate', String(validRate));
    } catch {}
    addNotification({
      title: 'Exchange Rate Updated',
      message: `Configured exchange rate to 1 USD = ${validRate.toLocaleString()} UGX.`,
      category: 'system',
      linkView: 'settings',
    });
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
    addNotification({
      title: 'Store Profile Updated',
      message: `Store profile details for ${userData.shop_name || 'KARAT'} were updated.`,
      category: 'system',
      linkView: 'settings',
    });
  };

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('karat_currency', newCurrency);
    } catch {
      // ignore
    }
    addNotification({
      title: 'System Currency Changed',
      message: `Operating display currency changed to ${newCurrency}.`,
      category: 'system',
      linkView: 'settings',
    });
  };

  const getConvertedAmount = (amount: number): number => {
    if (isNaN(amount) || amount === null || amount === undefined) return 0;
    const rate = (typeof exchangeRate === 'number' && exchangeRate > 0) ? exchangeRate : 3750;
    if (currency === 'USD') {
      return Number((amount / rate).toFixed(2));
    }
    return amount;
  };

  const convertToBaseUGX = (amount: number): number => {
    if (isNaN(amount) || amount === null || amount === undefined) return 0;
    const rate = (typeof exchangeRate === 'number' && exchangeRate > 0) ? exchangeRate : 3750;
    if (currency === 'USD') {
      return Number((amount * rate).toFixed(2));
    }
    return amount;
  };

  const formatMoney = (amount: number, options?: { showCode?: boolean; round?: boolean }): string => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return currency === 'UGX' ? (options?.showCode !== false ? 'UGX 0' : '0') : (options?.showCode !== false ? '$0.00' : '0.00');
    }

    const rate = (typeof exchangeRate === 'number' && exchangeRate > 0) ? exchangeRate : 3750;
    const isUSD = currency === 'USD';
    const effectiveAmount = isUSD ? (amount / rate) : amount;
    const isNegative = effectiveAmount < 0;
    const absVal = Math.abs(effectiveAmount);

    let formatted: string;
    if (isUSD) {
      if (options?.round) {
        formatted = Math.round(absVal).toLocaleString();
      } else {
        formatted = absVal.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }
      const res = options?.showCode !== false ? `$${formatted}` : formatted;
      return isNegative ? `-${res}` : res;
    } else {
      if (options?.round || Number.isInteger(absVal)) {
        formatted = Math.round(absVal).toLocaleString();
      } else {
        formatted = absVal.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
      const res = options?.showCode !== false ? `UGX ${formatted}` : formatted;
      return isNegative ? `-${res}` : res;
    }
  };

  const formatMoneyShort = (amount: number): string => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return currency === 'UGX' ? 'UGX 0' : '$0';
    }
    const rate = (typeof exchangeRate === 'number' && exchangeRate > 0) ? exchangeRate : 3750;
    const isUSD = currency === 'USD';
    const effectiveAmount = isUSD ? (amount / rate) : amount;
    const isNegative = effectiveAmount < 0;
    const absVal = Math.abs(effectiveAmount);
    const prefix = isUSD ? '$' : 'UGX ';

    let strVal: string;
    if (absVal >= 1_000_000_000) {
      strVal = `${(absVal / 1_000_000_000).toFixed(1)}B`;
    } else if (absVal >= 1_000_000) {
      strVal = `${(absVal / 1_000_000).toFixed(1)}M`;
    } else if (absVal >= 1_000) {
      strVal = `${(absVal / 1_000).toFixed(1)}k`;
    } else {
      strVal = isUSD
        ? absVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : Math.round(absVal).toLocaleString();
    }
    return isNegative ? `-${prefix}${strVal}` : `${prefix}${strVal}`;
  };

  const [parts, setParts] = useState<SparePart[]>(() => {
    try {
      const saved = localStorage.getItem('karat_parts_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filteredParsed = parsed.filter((p: any) => p.id !== 'KA106' && p.warehouse_bin !== 'Aisle 4 - Bay A - Heavy Rack');
        const existingIds = new Set(filteredParsed.map((p: any) => p.id));
        const missing = INITIAL_SPARE_PARTS.filter(p => !existingIds.has(p.id) && p.id !== 'KA106' && p.warehouse_bin !== 'Aisle 4 - Bay A - Heavy Rack');
        const combined = [...filteredParsed, ...missing];
        const cleaned = combined.map((p: any) => ({
          ...p,
          warehouse_bin: cleanLocation(p.warehouse_bin),
          unit: p.unit || (p.name?.toLowerCase().includes('kit') ? 'KIT' : p.name?.toLowerCase().includes('set') ? 'SET' : p.name?.toLowerCase().includes('assembly') || p.name?.toLowerCase().includes('pump') || p.name?.toLowerCase().includes('motor') ? 'ASSY' : 'PCS'),
          taxes: p.taxes || '18% VAT',
          tax_rate: p.tax_rate ?? 18,
          unit_cost: p.unit_cost !== undefined ? p.unit_cost : Math.round((p.unit_price || 0) * 0.65),
          registered_date: p.registered_date || '2026-03-01',
          machinery_models: (p.machinery_models || []).map((m: string) => cleanModelName(m, p.brand)),
          model: cleanModelName(p.model || (p.machinery_models?.[0] || 'Standard'), p.brand),
          series: p.series || getSeriesForCategory(p.category)
        }));
        try {
          localStorage.setItem('karat_parts_v3', JSON.stringify(cleaned));
        } catch {}
        return cleaned;
      }
      return INITIAL_SPARE_PARTS.filter(p => p.id !== 'KA106' && p.warehouse_bin !== 'Aisle 4 - Bay A - Heavy Rack');
    } catch {
      return INITIAL_SPARE_PARTS.filter(p => p.id !== 'KA106' && p.warehouse_bin !== 'Aisle 4 - Bay A - Heavy Rack');
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

  const [receiptDrafts, setReceiptDrafts] = useState<ReceiptDraft[]>(() => {
    try {
      const saved = localStorage.getItem('karat_receipt_drafts');
      return saved ? JSON.parse(saved) : INITIAL_RECEIPT_DRAFTS;
    } catch {
      return INITIAL_RECEIPT_DRAFTS;
    }
  });

  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('karat_receipt_drafts', JSON.stringify(receiptDrafts));
    } catch {}
  }, [receiptDrafts]);

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('karat_notifications_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleNotificationsEnabled = () => {
    setNotificationsEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('karat_notifications_enabled', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('karat_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('karat_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'createdAt' | 'read'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newNotif: AppNotification = {
      ...notifData,
      id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: `${dateStr}, ${timeStr}`,
      createdAt: Date.now(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotificationsCount = notificationsEnabled ? notifications.filter(n => !n.read).length : 0;

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
    addNotification({
      title: 'User Authenticated',
      message: `Administrator session active for ${ownerUser.name}.`,
      category: 'system',
      linkView: 'dashboard',
    });
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
      machinery_models: (newPartData.machinery_models || []).map(m => cleanModelName(m, newPartData.brand)),
      model: cleanModelName(newPartData.model || (newPartData.machinery_models?.[0] || 'Standard'), newPartData.brand),
    };
    setParts(prev => [newPart, ...prev]);
    setFlashMessage('success', `Product [${newPart.id}] ${newPart.name} added.`);
    addNotification({
      title: `Product Added • [${newPart.id}]`,
      message: `Registered ${newPart.name} with ${newPart.stock_quantity} units at ${formatMoney(newPart.unit_price)}.`,
      category: 'stock',
      linkView: 'inventory',
    });
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
    addNotification({
      title: `Bulk Products Imported (${createdParts.length})`,
      message: `Successfully uploaded ${createdParts.length} spare parts to catalog.`,
      category: 'stock',
      linkView: 'inventory',
    });
  };

  const updatePart = (updatedPart: SparePart) => {
    const enrichedPart = {
      ...updatedPart,
      series: updatedPart.series || getSeriesForCategory(updatedPart.category),
      machinery_models: (updatedPart.machinery_models || []).map(m => cleanModelName(m, updatedPart.brand)),
      model: cleanModelName(updatedPart.model || (updatedPart.machinery_models?.[0] || 'Standard'), updatedPart.brand),
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
    addNotification({
      title: `Product Updated • [${enrichedPart.id}]`,
      message: `Updated specs for ${enrichedPart.name}. Current stock: ${enrichedPart.stock_quantity} units.`,
      category: 'stock',
      linkView: 'inventory',
    });
  };

  const updatePartStock = (partId: string, newStock: number) => {
    let partName = partId;
    setParts(prev => prev.map(p => {
      if (p.id === partId) {
        partName = p.name;
        const status: SparePart['status'] = 
          newStock === 0 ? 'Out of Stock' : (newStock <= p.min_stock_alert ? 'Low Stock' : 'In Stock');
        return { ...p, stock_quantity: newStock, status };
      }
      return p;
    }));
    setFlashMessage('success', `Stock for part ${partId} updated to ${newStock} units.`);
    addNotification({
      title: `Stock Level Updated • ${partId}`,
      message: `Adjusted inventory for ${partName} to ${newStock} units.`,
      category: 'stock',
      linkView: 'inventory',
    });
  };

  const deletePart = (partId: string) => {
    const target = parts.find(p => p.id === partId || p.part_number === partId);
    setParts(prev => prev.filter(p => p.id !== partId && String(p.id) !== String(partId) && p.part_number !== partId));
    setFlashMessage('success', `Part ${partId} removed from catalog.`);
    addNotification({
      title: `Product Deleted from Catalog`,
      message: `Spare part [${partId}] ${target ? target.name : ''} was deleted from inventory.`,
      category: 'delete',
      linkView: 'inventory',
    });
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
    addNotification({
      title: `OEM Order Dispatched • ${poId}`,
      message: `Purchase order of ${formatMoney(newPO.total_cost)} dispatched to ${newPO.supplier_name}.`,
      category: 'order',
      linkView: 'restock',
    });
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
    addNotification({
      title: `OEM Order Updated • ${id}`,
      message: `Purchase order ${id} status updated to "${status}".`,
      category: 'order',
      linkView: 'restock',
    });
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
    addNotification({
      title: `OEM Stock Ingested • GRN ${grnNum}`,
      message: `Verified and shelved ${totalItemsAdded} units from order ${po.id} (${po.supplier_name}).`,
      category: 'stock',
      linkView: 'restock',
    });
  };

  const deleteOEMOrder = (id: string) => {
    setOemOrders(prev => prev.filter(o => o.id !== id));
    setFlashMessage('success', `OEM Order ${id} deleted.`);
    addNotification({
      title: `OEM Order Deleted`,
      message: `Purchase order ${id} was deleted from procurement records.`,
      category: 'delete',
      linkView: 'restock',
    });
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
    addNotification({
      title: `Customer Inquiry Logged • ${newInquiry.id}`,
      message: `Logged inquiry for ${newInquiry.customer_name} (${newInquiry.machinery_model || 'Fleet'}). Quoted: ${formatMoney(newInquiry.quoted_amount)}.`,
      category: 'order',
      linkView: 'inquiries',
    });
    return newInquiry;
  };

  const updateInquiryStatus = (id: string, status: InquiryItem['status'], extra?: Partial<InquiryItem>) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status, ...extra } : inq));
    setFlashMessage('success', `Inquiry ${id} status updated to ${status}.`);
    addNotification({
      title: `Inquiry Status Updated • ${id}`,
      message: `Customer inquiry ${id} status changed to "${status}".`,
      category: 'order',
      linkView: 'inquiries',
    });
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(inq => inq.id !== id));
    setFlashMessage('success', `Inquiry ${id} deleted.`);
    addNotification({
      title: `Inquiry Deleted`,
      message: `Customer inquiry ${id} was deleted.`,
      category: 'delete',
      linkView: 'inquiries',
    });
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
      delivery_method: 'Store Pickup (Yard 4 - Industrial Area)',
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
    addNotification({
      title: `Inquiry Converted to Order • ${newOrder.id}`,
      message: `Commercial order created for ${newOrder.customer_name} (${formatMoney(newOrder.total_amount)}).`,
      category: 'order',
      linkView: 'inquiries',
    });
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
    addNotification({
      title: `Commercial Order Created • ${newOrder.id}`,
      message: `Order for ${newOrder.customer_name} registered (${formatMoney(newOrder.total_amount)}).`,
      category: 'order',
      linkView: 'inquiries',
    });
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: CommercialOrder['fulfillment_status'], extra?: Partial<CommercialOrder>) => {
    setOrders(prev => prev.map(ord => ord.id === id ? { ...ord, fulfillment_status: status, ...extra } : ord));
    setFlashMessage('success', `Order ${id} status updated to ${status}.`);
    addNotification({
      title: `Order Status Updated • ${id}`,
      message: `Commercial Order ${id} fulfillment status changed to "${status}".`,
      category: 'order',
      linkView: 'inquiries',
    });
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(ord => ord.id !== id));
    setFlashMessage('success', `Order ${id} deleted.`);
    addNotification({
      title: `Order Deleted`,
      message: `Commercial order ${id} was deleted.`,
      category: 'delete',
      linkView: 'inquiries',
    });
  };

  const startSaleWithPart = (part: SparePart) => {
    setSelectedPartForSale(part);
    setActiveView('pos');
  };

  const clearSelectedPartForSale = () => {
    setSelectedPartForSale(null);
  };

  const saveReceiptDraft = (
    draftData: Omit<ReceiptDraft, 'id' | 'draft_code' | 'created_at' | 'updated_at' | 'timestamp'>,
    existingDraftId?: string
  ): ReceiptDraft => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    if (existingDraftId) {
      const found = receiptDrafts.find(d => d.id === existingDraftId || d.draft_code === existingDraftId);
      if (found) {
        const updatedDraft: ReceiptDraft = {
          ...found,
          ...draftData,
          updated_at: dateStr,
          timestamp: now.getTime(),
        };
        setReceiptDrafts(prev => prev.map(d => (d.id === found.id || d.draft_code === found.draft_code) ? updatedDraft : d));
        setFlashMessage('success', `Draft #${found.draft_code} updated successfully.`);
        return updatedDraft;
      }
    }

    const draftCode = generateSixVarcharDraftCode(receiptDrafts);
    const newDraft: ReceiptDraft = {
      ...draftData,
      id: draftCode,
      draft_code: draftCode,
      created_at: dateStr,
      updated_at: dateStr,
      timestamp: now.getTime(),
    };

    setReceiptDrafts(prev => [newDraft, ...prev]);
    setActiveDraftId(newDraft.id);
    setFlashMessage('success', `Receipt saved as draft #${draftCode}.`);
    addNotification({
      title: `Receipt Draft Saved • #${draftCode}`,
      message: `Draft created for ${newDraft.customer_name} (${newDraft.items.length} line items).`,
      category: 'sale',
      linkView: 'pos',
    });
    return newDraft;
  };

  const updateReceiptDraft = (id: string, updates: Partial<ReceiptDraft>) => {
    let updatedCode = id;
    let customer = 'Client';
    setReceiptDrafts(prev => prev.map(d => {
      if (d.id === id || d.draft_code === id) {
        updatedCode = d.draft_code;
        customer = updates.customer_name || d.customer_name;
        return {
          ...d,
          ...updates,
          updated_at: new Date().toISOString().slice(0, 10),
        };
      }
      return d;
    }));
    setFlashMessage('success', `Draft updated.`);
    addNotification({
      title: `Draft Updated • #${updatedCode}`,
      message: `Draft order details for ${customer} were updated.`,
      category: 'sale',
      linkView: 'pos',
    });
  };

  const deleteReceiptDraft = (id: string) => {
    setReceiptDrafts(prev => prev.filter(d => d.id !== id && d.draft_code !== id));
    if (activeDraftId === id) {
      setActiveDraftId(null);
    }
    setFlashMessage('success', `Draft removed.`);
    addNotification({
      title: `Receipt Draft Deleted`,
      message: `Draft #${id} was deleted.`,
      category: 'delete',
      linkView: 'pos',
    });
  };

  const clearAllReceiptDrafts = () => {
    setReceiptDrafts([]);
    setActiveDraftId(null);
    setFlashMessage('success', 'All receipt drafts cleared.');
    addNotification({
      title: `All Drafts Cleared`,
      message: `All pending receipt drafts were deleted.`,
      category: 'delete',
      linkView: 'pos',
    });
  };

  const completeSale = (saleData: Omit<SaleReceipt, 'id' | 'receipt_number' | 'timestamp' | 'date' | 'time'>): SaleReceipt => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const receiptNumber = generateSixVarcharReceiptNumber(receipts);
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newReceipt: SaleReceipt = {
      ...saleData,
      id: receiptNumber,
      receipt_number: receiptNumber,
      date: dateStr,
      time: timeStr,
      timestamp: now.getTime(),
    };

    // 1. Deduct stock quantity in real-time from inventory and detect low stock alerts
    const lowStockAlerts: { partName: string; partNumber: string; remaining: number }[] = [];
    setParts(prevParts => {
      const updated = prevParts.map(p => {
        const soldItem = saleData.items.find(
          it => it.part_id === p.id || it.part_number === p.id || it.part_number === p.part_number
        );
        if (soldItem) {
          const newStock = Math.max(0, p.stock_quantity - soldItem.quantity);
          const status: SparePart['status'] =
            newStock === 0 ? 'Out of Stock' : (newStock <= p.min_stock_alert ? 'Low Stock' : 'In Stock');
          if (newStock <= p.min_stock_alert) {
            lowStockAlerts.push({
              partName: p.name,
              partNumber: p.part_number,
              remaining: newStock,
            });
          }
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
      subtitle: `${itemsSummary} • #${receiptNumber}`,
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

    // 5. If this sale was completed from an active draft, clean up that draft
    if (activeDraftId) {
      setReceiptDrafts(prev => prev.filter(d => d.id !== activeDraftId && d.draft_code !== activeDraftId));
      setActiveDraftId(null);
    }

    setFlashMessage(
      'success',
      `Sale complete! Receipt #${receiptNumber} generated for ${saleData.customer_name}. Stock deducted.`
    );

    // 6. Record System Activity Notifications
    const totalSoldUnits = saleData.items.reduce((s, it) => s + it.quantity, 0);
    addNotification({
      title: `Sale Completed • #${receiptNumber}`,
      message: `Sale of ${formatMoney(newReceipt.grand_total)} issued to ${newReceipt.customer_name}. ${totalSoldUnits} units deducted from inventory.`,
      category: 'sale',
      linkView: 'pos',
    });

    lowStockAlerts.forEach(alert => {
      addNotification({
        title: `Low Stock Alert • [${alert.partNumber}]`,
        message: `${alert.partName} has reached ${alert.remaining} units left in stock. Reorder recommended.`,
        category: 'stock',
        linkView: 'inventory',
      });
    });

    return newReceipt;
  };

  const deleteReceipt = (receiptId: string) => {
    const receipt = receipts.find(item => item.id === receiptId || item.receipt_number === receiptId);
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

    setReceipts(prev => prev.filter(item => item.id !== receipt.id && item.receipt_number !== receipt.receipt_number));
    setTransactions(prev => prev.filter(transaction => (
      transaction.type !== 'sale' || !transaction.subtitle?.includes(receipt.receipt_number)
    )));
    setActiveReceipt(current => current?.id === receipt.id || current?.receipt_number === receipt.receipt_number ? null : current);
    setFlashMessage('success', `Receipt ${receipt.receipt_number} deleted and stock restored.`);
    addNotification({
      title: `Receipt Deleted • #${receipt.receipt_number}`,
      message: `Receipt for ${receipt.customer_name} (${formatMoney(receipt.grand_total)}) was deleted and stock was restored to warehouse inventory.`,
      category: 'delete',
      linkView: 'pos',
    });
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
      localStorage.removeItem('karat_notifications');
    } catch {}
    setParts(INITIAL_SPARE_PARTS);
    setReceipts(INITIAL_RECEIPTS);
    setOemOrders(INITIAL_OEM_ORDERS);
    setInquiries(INITIAL_INQUIRIES);
    setOrders(INITIAL_ORDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setExchangeRateState(UGX_EXCHANGE_RATE);
    setFlashMessage('success', 'All system records and inventory reset to factory defaults.');
    addNotification({
      title: 'System Data Reset',
      message: 'All inventory, sales records, and settings were reset to default state.',
      category: 'system',
      linkView: 'settings',
    });
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
        convertToBaseUGX,
        parts,
        transactions,
        clients,
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
        notifications,
        notificationsEnabled,
        toggleNotificationsEnabled,
        addNotification,
        clearNotification,
        clearAllNotifications,
        markNotificationAsRead,
        unreadNotificationsCount,
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
