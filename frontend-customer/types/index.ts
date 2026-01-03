/**
 * TypeScript type definitions for the Customer QR Ordering App
 * Based on menu.json data structure
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
  status: string;
  product_count?: number;
  products?: Product[];
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number | null;
  image_url?: string | null;
  preparation_time?: number | null;
  calories?: number | null;
  is_spicy: boolean;
  is_vegetarian: boolean;
  tags?: string[];
  status: string;
  sold_count: number;
  rating: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  selectedToppings?: string[];
}

export interface MenuMetadata {
  version: string;
  restaurant_name: string;
  description?: string;
  created_at?: string;
  last_updated?: string;
}

export interface MenuData {
  metadata: MenuMetadata;
  categories: Category[];
  products: Product[];
}
