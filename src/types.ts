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
  series?: string;
  category: string;
  machinery_models: string[];
  model?: string;
  brand: 'Caterpillar' | 'Komatsu' | 'Volvo' | 'Hitachi' | 'Hyundai' | 'Doosan';
  unit?: string; // Unit of measure: PCS, SET, KIT, ASSY, PAIR, MTR, KG, BOX, etc.
  taxes?: string; // e.g. "18% VAT", "0% Exempt"
  tax_rate?: number;
  stock_quantity: number;
  min_stock_alert: number;
  unit_cost: number; // Cost for Item
  unit_price: number; // Selling Price put on item
  registered_date?: string; // Date registered in the system (YYYY-MM-DD)
  warehouse_bin: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'On Order';
}

export interface InquiryLineItem {
  part_id?: string;
  part_number: string;
  oem_number?: string;
  name: string;
  brand?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  in_stock?: boolean;
}

export interface InquiryItem {
  id: string;
  customer_name: string;
  customer_company?: string;
  customer_phone?: string;
  customer_email?: string;
  equipment_model: string;
  equipment_serial?: string;
  parts_requested: string;
  items?: InquiryLineItem[];
  quoted_amount: number;
  priority?: 'Critical (Machine Down)' | 'Urgent (48h)' | 'Standard Routine';
  validity_period?: string;
  delivery_site?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined' | 'Converted to Order';
  notes?: string;
  created_at: string;
  converted_order_id?: string;
}

export interface CommercialOrder {
  id: string;
  po_reference?: string;
  inquiry_id?: string;
  customer_name: string;
  customer_company?: string;
  customer_phone?: string;
  customer_email?: string;
  equipment_model: string;
  delivery_site: string;
  delivery_method: 'Field Van Delivery' | 'Warehouse Pickup (Yard 4 - Nakawa)' | 'Expedited Air Freight';
  items: InquiryLineItem[];
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  total_amount: number;
  payment_status: 'Paid in Full' | 'Partial Advance (50%)' | '30-Day Credit Account' | 'Pending Wire';
  fulfillment_status: 'Processing & Packing' | 'Awaiting OEM Restock' | 'Ready for Dispatch' | 'Dispatched / In Transit' | 'Delivered & Signed';
  date: string;
  estimated_delivery?: string;
  driver_name?: string;
  vehicle_reg?: string;
  notes?: string;
}

export interface OEMSupplier {
  id: string;
  name: string;
  brand: 'Caterpillar' | 'Komatsu' | 'Volvo' | 'Hitachi' | 'Hyundai' | 'Doosan' | 'Bosch Rexroth' | 'Donaldson' | 'Berco';
  country: string;
  city: string;
  contact_person: string;
  email: string;
  phone: string;
  account_number: string;
  typical_lead_days_air: number;
  typical_lead_days_sea: number;
  preferred_freight: 'Expedited Air Freight' | 'Ocean Container' | 'Overland Road';
  port_of_origin: string;
}

export interface OEMPurchaseOrderItem {
  part_id?: string;
  part_number: string;
  oem_number: string;
  name: string;
  brand: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_cost: number;
  total_cost: number;
  target_bin?: string;
}

export interface OEMPurchaseOrder {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_brand: string;
  supplier_contact?: string;
  supplier_email?: string;
  supplier_country?: string;
  items: OEMPurchaseOrderItem[];
  subtotal: number;
  freight_cost: number;
  insurance_cost?: number;
  customs_duty_est?: number;
  total_cost: number;
  currency: 'USD' | 'EUR';
  status: 'Draft' | 'Confirmed & Placed' | 'In Transit' | 'Customs Clearance' | 'At Receiving Bay' | 'Received & Stocked' | 'Cancelled';
  shipping_method: 'Expedited Air Freight (3-5 Days)' | 'Ocean Container (25-35 Days)' | 'Overland Transit';
  tracking_number?: string;
  carrier?: string;
  port_of_loading: string;
  port_of_discharge: string;
  incoterm: 'CIF Kampala' | 'FOB Origin' | 'DAP Nakawa Yard' | 'EXW Factory';
  payment_terms: '100% Wire Transfer (T/T)' | 'Letter of Credit (L/C)' | '30% Advance, 70% vs B/L' | 'OEM Net 30';
  payment_status: 'Paid in Full' | 'Advance Paid (30%)' | 'Unpaid / Open Credit';
  order_date: string;
  eta: string;
  received_date?: string;
  received_by?: string;
  grn_number?: string;
  notes?: string;
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
  series?: string;
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
