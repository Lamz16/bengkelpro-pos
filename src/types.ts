export type ServiceStatus = 'Pending' | 'In Progress' | 'Ready' | 'Done';
export type UserRole = 'Admin' | 'Kasir' | 'Mekanik';
export type SubscriptionTier = 'Free' | 'Basic' | 'Premium';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  workshopName: string;
  createdAt: string;
  subscription: {
    tier: SubscriptionTier;
    expiryDate: string | null;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalServiceCount: number;
}

export interface Vehicle {
  id: string;
  customerId: string;
  plateNumber: string;
  model: string;
  brand: string;
}

export interface SparePart {
  id: string;
  name: string;
  category: string;
  price: number;
  purchasePrice: number;
  stock: number;
  minStock: number;
  lastUpdated: string;
  supplierId?: string;
}

export interface WorkshopService {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  kilometers: number;
  serviceType: string;
  complaint: string;
  diagnosis?: string;
  status: ServiceStatus;
  createdAt: string;
  partsUsed: Array<{
    partId: string;
    name: string;
    quantity: number;
    priceAtTime: number
  }>;
  laborFee: number;
  totalAmount: number;
  paymentStatus: 'Unpaid' | 'Paid';
}

export interface StockHistory {
  id: string;
  partId: string;
  partName: string;
  amount: number;
  type: 'In' | 'Out';
  reason: string;
  date: string;
}

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  features: string[];
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  note: string;
  date: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface PurchaseRecord {
  id: string;
  partId: string;
  supplierId: string;
  quantity: number;
  costPrice: number;
  date: string;
}
