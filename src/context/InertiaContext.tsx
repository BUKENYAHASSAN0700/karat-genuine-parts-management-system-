import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  InertiaPageProps, 
  InertiaAuthProps, 
  InertiaFlashProps, 
  SparePart,
  InquiryItem,
  RecentTransaction,
  ClientAccount,
  CurrencyCode,
  SaleReceipt
} from '../types';
import { 
  INITIAL_OWNER, 
  INITIAL_SPARE_PARTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_INQUIRIES,
  INITIAL_CLIENTS,
  INITIAL_RECEIPTS
} from '../data/initialData';

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
  formatMoney: (amountInUSD: number, options?: { showCode?: boolean; round?: boolean }) => string;
  formatMoneyShort: (amountInUSD: number) => string;
  getConvertedAmount: (amountInUSD: number) => number;
  parts: SparePart[];
  transactions: RecentTransaction[];
  inquiries: InquiryItem[];
  clients: ClientAccount[];
  receipts: SaleReceipt[];
  activeReceipt: SaleReceipt | null;
  setActiveReceipt: (receipt: SaleReceipt | null) => void;
  selectedPartForSale: SparePart | null;
  startSaleWithPart: (part: SparePart) => void;
  clearSelectedPartForSale: () => void;
  completeSale: (saleData: Omit<SaleReceipt, 'id' | 'receipt_number' | 'timestamp' | 'date' | 'time'>) => SaleReceipt;
  addModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  addPart: (part: Omit<SparePart, 'id'>) => void;
  addMultipleParts: (partsList: Array<Omit<SparePart, 'id'>>) => void;
  updatePart: (updatedPart: SparePart) => void;
  updatePartStock: (partId: string, newStock: number) => void;
  deletePart: (partId: string) => void;
  addTransaction: (tx: Omit<RecentTransaction, 'id'>) => void;
  addInquiry: (inquiry: Omit<InquiryItem, 'id' | 'created_at'>) => void;
  updateInquiryStatus: (id: string, status: InquiryItem['status']) => void;
  setFlashMessage: (type: 'success' | 'error', message: string) => void;
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
      return savedUser ? JSON.parse(savedUser) : INITIAL_OWNER;
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

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('karat_currency', newCurrency);
    } catch {
      // ignore
    }
  };

  const getConvertedAmount = (amountInUSD: number): number => {
    if (currency === 'UGX') {
      return Math.round(amountInUSD * UGX_EXCHANGE_RATE);
    }
    return amountInUSD;
  };

  const formatMoney = (amountInUSD: number, options?: { showCode?: boolean; round?: boolean }): string => {
    if (currency === 'UGX') {
      const ugxAmount = Math.round(amountInUSD * UGX_EXCHANGE_RATE);
      return options?.showCode !== false 
        ? `UGX ${ugxAmount.toLocaleString()}` 
        : ugxAmount.toLocaleString();
    }
    const formatted = options?.round ? Math.round(amountInUSD).toLocaleString() : amountInUSD.toLocaleString();
    return options?.showCode !== false ? `$${formatted} USD` : `$${formatted}`;
  };

  const formatMoneyShort = (amountInUSD: number): string => {
    if (currency === 'UGX') {
      const ugxVal = amountInUSD * UGX_EXCHANGE_RATE;
      if (ugxVal >= 1_000_000_000) return `UGX ${(ugxVal / 1_000_000_000).toFixed(1)}B`;
      if (ugxVal >= 1_000_000) return `UGX ${(ugxVal / 1_000_000).toFixed(1)}M`;
      if (ugxVal >= 1_000) return `UGX ${(ugxVal / 1_000).toFixed(0)}k`;
      return `UGX ${Math.round(ugxVal).toLocaleString()}`;
    }
    if (amountInUSD >= 1_000_000) return `$${(amountInUSD / 1_000_000).toFixed(1)}M`;
    if (amountInUSD >= 1_000) return `$${(amountInUSD / 1_000).toFixed(1)}k`;
    return `$${amountInUSD.toLocaleString()}`;
  };

  const [parts, setParts] = useState<SparePart[]>(() => {
    try {
      const saved = localStorage.getItem('karat_parts');
      return saved ? JSON.parse(saved) : INITIAL_SPARE_PARTS;
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
      localStorage.setItem('karat_parts', JSON.stringify(parts));
    } catch {}
  }, [parts]);

  // Sync receipts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karat_receipts', JSON.stringify(receipts));
    } catch {}
  }, [receipts]);

  const [transactions, setTransactions] = useState<RecentTransaction[]>(INITIAL_TRANSACTIONS);
  const [inquiries, setInquiries] = useState<InquiryItem[]>(INITIAL_INQUIRIES);
  const [clients] = useState<ClientAccount[]>(INITIAL_CLIENTS);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  const [flash, setFlash] = useState<InertiaFlashProps>({
    success: null,
    error: null,
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

  const setFlashMessage = (type: 'success' | 'error', message: string) => {
    setFlash({
      success: type === 'success' ? message : null,
      error: type === 'error' ? message : null,
    });
  };

  const clearFlash = () => {
    setFlash({ success: null, error: null });
  };

  useEffect(() => {
    if (flash.success || flash.error) {
      const timer = setTimeout(() => {
        setFlash({ success: null, error: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const login = (email: string, _password?: string): boolean => {
    // Authenticate shop owner
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setFlashMessage('error', 'Please enter your KARAT shop owner email.');
      return false;
    }

    const ownerUser: User = {
      ...INITIAL_OWNER,
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@karat.com`,
    };

    setIsAuthenticated(true);
    setCurrentUser(ownerUser);
    try {
      localStorage.setItem('karat_auth', 'true');
      localStorage.setItem('karat_user', JSON.stringify(ownerUser));
    } catch {
      // LocalStorage fallback
    }

    setFlashMessage('success', `Welcome back, ${ownerUser.name}. KARAT Master Dashboard loaded.`);
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
    };
    setParts(prev => [newPart, ...prev]);
    setFlashMessage('success', `Spare part [${newPart.id}] ${newPart.name} registered.`);
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
    setParts(prev => prev.map(p => {
      if (p.id === updatedPart.id) {
        const stockQty = Number(updatedPart.stock_quantity) || 0;
        const minAlert = Number(updatedPart.min_stock_alert) || 1;
        const status: SparePart['status'] =
          stockQty === 0 ? 'Out of Stock' : (stockQty <= minAlert ? 'Low Stock' : 'In Stock');
        return {
          ...updatedPart,
          stock_quantity: stockQty,
          min_stock_alert: minAlert,
          status,
        };
      }
      return p;
    }));
    setFlashMessage('success', `Spare part [${updatedPart.id}] ${updatedPart.name} updated.`);
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

  const addInquiry = (inquiryData: Omit<InquiryItem, 'id' | 'created_at'>) => {
    const newInq: InquiryItem = {
      ...inquiryData,
      id: `INQ-${9480 + inquiries.length + 1}`,
      created_at: 'Just now',
    };
    setInquiries(prev => [newInq, ...prev]);
    setFlashMessage('success', `Quotation request for ${newInq.customer_name} created.`);
  };

  const updateInquiryStatus = (id: string, status: InquiryItem['status']) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status } : inq));
    setFlashMessage('success', `Quotation ${id} updated to ${status}.`);
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
        exchangeRate: UGX_EXCHANGE_RATE,
        formatMoney,
        formatMoneyShort,
        getConvertedAmount,
        parts,
        transactions,
        inquiries,
        clients,
        receipts,
        activeReceipt,
        setActiveReceipt,
        selectedPartForSale,
        startSaleWithPart,
        clearSelectedPartForSale,
        completeSale,
        addModalOpen,
        setAddModalOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        login,
        logout,
        addPart,
        addMultipleParts,
        updatePart,
        updatePartStock,
        deletePart,
        addTransaction,
        addInquiry,
        updateInquiryStatus,
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
