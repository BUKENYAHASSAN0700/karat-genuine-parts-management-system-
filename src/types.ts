export type CurrencyCode = 'USD' | 'UGX';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin';
  phone?: string;
  avatar?: string;
  shop_name?: string;
}

export interface InertiaFlashProps {
  success: string | null;
  error: string | null;
}

export interface InertiaAuthProps {
  user: User | null;
  isAuthenticated: boolean;
}

export interface InertiaPageProps {
  auth: InertiaAuthProps;
  flash: InertiaFlashProps;
  errors?: Record<string, string>;
  [key: string]: unknown;
}

export interface SparePart {
  id: string;
  part_number: string;
  oem_number: string;
  name: string;
  description?: string;
  category: string;
  machinery_models: string[];
  brand: 'Caterpillar' | 'Komatsu' | 'Volvo' | 'Hitachi' | 'Hyundai' | 'Doosan';
  stock_quantity: number;
  min_stock_alert: number;
  unit_cost: number;
  unit_price: number;
  warehouse_bin: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order';
}

export interface InquiryItem {
  id: string;
  customer_name: string;
  equipment_model: string;
  parts_requested: string;
  quoted_amount: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
  created_at: string;
}

export interface RecentTransaction {
  id: string;
  name: string;
  subtitle?: string;
  type: 'sale' | 'payout' | 'purchase' | 'quote';
  date: string;
  time: string;
  status: 'Successful' | 'Pending' | 'Low Stock Alert';
  amount: number;
  currency: string;
  iconType: 'dribbble' | 'google' | 'amazon' | 'caterpillar' | 'bank';
}

export interface ClientAccount {
  id: string;
  name: string;
  company: string;
  avatar: string;
  totalSpend: number;
  activeOrders: number;
}

export interface SaleReceiptItem {
  part_id: string;
  part_number: string;
  oem_number: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  warehouse_bin?: string;
}

export interface SaleReceipt {
  id: string;
  receipt_number: string;
  date: string;
  time: string;
  timestamp: number;
  customer_name: string;
  customer_phone?: string;
  customer_company?: string;
  equipment_model?: string;
  items: SaleReceiptItem[];
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  grand_total: number;
  payment_method: 'Cash' | 'Mobile Money' | 'Bank Wire' | 'Card' | 'Credit Account';
  payment_reference?: string;
  payment_status: 'Paid' | 'Credit / Due';
  amount_tendered?: number;
  change_due?: number;
  notes?: string;
  cashier_name: string;
  currency: CurrencyCode;
}
