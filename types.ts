import type { ReactNode } from 'react';

export type Page = 'SPLASH' | 'HOME' | 'QUANTITY_ANALYZER' | 'RECIPE_PROVIDER' | 'RECIPE_DETAIL' | 'SMART_BILLING' | 'LOGIN' | 'PRICE_EDITOR' | 'BLUETOOTH_SCANNER' | 'RECIPE_BILL_GENERATOR';

export interface User {
  username: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  imageUrl: string;
  targetWeightGrams: number;
}

export interface Recipe {
  _id?: string;
  id: string;
  name: string;
  // Fix: Use ReactNode for component types and import it to resolve 'Cannot find namespace JSX' error.
  icon: ReactNode;
  ingredients: Ingredient[];
}

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface QuantityHistoryItem {
  id: string;
  totalWeight: number;
  itemWeight: number;
  quantity: number;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: 'kg' | 'pcs';
}