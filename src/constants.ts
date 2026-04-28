import { SparePart } from './types';

export const INITIAL_PARTS: SparePart[] = [
  { id: 'P001', name: 'Oli Mesin 1L', price: 95000, purchasePrice: 75000, stock: 24, minStock: 10, category: 'Oli', lastUpdated: new Date().toISOString() },
  { id: 'P002', name: 'Kampas Rem Depan', price: 150000, purchasePrice: 110000, stock: 8, minStock: 5, category: 'Rem', lastUpdated: new Date().toISOString() },
  { id: 'P003', name: 'Filter Udara', price: 65000, purchasePrice: 45000, stock: 15, minStock: 5, category: 'Filter', lastUpdated: new Date().toISOString() },
  { id: 'P004', name: 'Busi Iridium', price: 45000, purchasePrice: 30000, stock: 3, minStock: 10, category: 'Busi', lastUpdated: new Date().toISOString() },
  { id: 'P005', name: 'Aki GS Astra', price: 850000, purchasePrice: 720000, stock: 5, minStock: 2, category: 'Kelistrikan', lastUpdated: new Date().toISOString() },
];

export const SERVICE_TYPES = [
  'Servis Rutin',
  'Ganti Oli',
  'Tune Up',
  'Perbaikan Mesin',
  'Kelistrikan',
  'Body Repair',
];
