const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private handleUnauthorized() {
    // Clear token
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Redirect to login page (Note: (auth) is a route group, URL is /login not /auth/login)
      window.location.href = '/login';
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // 401 Unauthorized - Token expired or invalid
        // But NOT for login/register endpoints (they naturally return 401 for wrong credentials)
        if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
          this.handleUnauthorized();
        }
        return {
          error: data.message || 'Bir hata oluştu',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: 'Sunucuya bağlanılamadı',
        status: 500,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: object): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: object): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // 401 Unauthorized - Token expired or invalid (but not for auth endpoints)
        if (response.status === 401) {
          this.handleUnauthorized();
        }
        return {
          error: data.message || 'Bir hata oluştu',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: 'Sunucuya bağlanılamadı',
        status: 500,
      };
    }
  }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string; message: string }>('/auth/login', { email, password }),

  register: (data: RegisterData) =>
    api.post<{ user: User; token: string; message: string }>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  getUser: () => api.get<{ user: User }>('/auth/user'),

  verifyGln: (gln_code: string) =>
    api.post<GlnVerificationResult>('/auth/verify-gln', { gln_code }),
};

// Documents API
export const documentsApi = {
  getAll: () => api.get<DocumentsResponse>('/documents'),

  upload: (type: string, file: File) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    return api.postFormData<DocumentUploadResponse>('/documents/upload', formData);
  },

  delete: (id: number) => api.delete<{ message: string }>(`/documents/${id}`),

  getStatus: () => api.get<DocumentStatusResponse>('/documents/status'),
};

// Products API
export const productsApi = {
  getAll: (params?: { page?: number; per_page?: number; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.category) query.set('category', params.category);
    return api.get<ProductsResponse>(`/products?${query}`);
  },

  search: (q: string, page = 1) =>
    api.get<ProductsResponse>(`/products/search?q=${encodeURIComponent(q)}&page=${page}`),

  get: (id: number) => api.get<{ product: Product }>(`/products/${id}`),

  getOffers: (productId: number) =>
    api.get<ProductOffersResponse>(`/products/${productId}/offers`),
};

// Offers API
export const offersApi = {
  getMyOffers: (params?: { page?: number; per_page?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.status) query.set('status', params.status);
    return api.get<OffersResponse>(`/my-offers?${query}`);
  },

  create: (data: CreateOfferData) => api.post<{ offer: Offer }>('/offers', data),

  update: (id: number, data: UpdateOfferData) =>
    api.put<{ offer: Offer }>(`/offers/${id}`, data),

  delete: (id: number) => api.delete(`/offers/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get<CategoriesResponse>('/categories'),
  get: (id: number) => api.get<CategoryResponse>(`/categories/${id}`),
};

// Cart API
export const cartApi = {
  get: () => api.get<CartResponse>('/cart'),

  addItem: (offerId: number, quantity: number = 1) =>
    api.post<CartActionResponse>('/cart/items', { offer_id: offerId, quantity }),

  updateQuantity: (itemId: number, quantity: number) =>
    api.put<CartActionResponse>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: number) =>
    api.delete<CartActionResponse>(`/cart/items/${itemId}`),

  validate: () => api.post<CartValidationResponse>('/cart/validate'),

  clear: () => api.delete<CartActionResponse>('/cart'),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { page?: number; per_page?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    return api.get<OrdersResponse>(`/orders?${query}`);
  },

  getSellerOrders: (params?: { page?: number; per_page?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.per_page) query.set('per_page', String(params.per_page));
    if (params?.status) query.set('status', params.status);
    return api.get<SellerOrdersResponse>(`/orders/seller?${query}`);
  },

  get: (id: number) => api.get<OrderResponse>(`/orders/${id}`),

  create: (data: CreateOrderData) =>
    api.post<{ message: string; order: Order; order_number: string }>('/orders', data),

  updateStatus: (id: number, status: string) =>
    api.put<{ message: string; order: Order }>(`/orders/${id}/status`, { status }),

  cancel: (id: number) => api.put<{ message: string; order: Order }>(`/orders/${id}/cancel`),
};

// Address API
export interface Address {
  id: number;
  title: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postal_code?: string;
  is_default: boolean;
}

export interface AddressResponse {
  data: Address;
  message?: string;
}

export interface AddressListResponse {
  data: Address[];
}

export const addressApi = {
  getAll: () => api.get<AddressListResponse>('/user/addresses'),
  create: (data: Partial<Address>) => api.post<AddressResponse>('/user/addresses', data),
  update: (id: number, data: Partial<Address>) => api.put<AddressResponse>(`/user/addresses/${id}`, data),
  delete: (id: number) => api.delete(`/user/addresses/${id}`),
};

// Types
export interface User {
  id: number;
  email: string;
  gln_code: string;
  pharmacy_name: string;
  phone?: string;
  address?: string;
  city?: string;
  is_verified: boolean;
  role: 'super-admin' | 'pharmacist';
  created_at?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string;
  gln_code: string;
  pharmacy_name?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface GlnVerificationResult {
  valid: boolean;
  already_registered?: boolean;
  pharmacy_name?: string;
  city?: string;
  district?: string;
  address?: string;
  message?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  commission_rate: number;
  is_active: boolean;
  products_count?: number;
  children?: Category[];
}

export interface Product {
  id: number;
  barcode: string;
  name: string;
  brand?: string;
  manufacturer?: string;
  description?: string;
  image?: string;
  category_id?: number;
  category?: Category;
  is_active: boolean;
  offers_count?: number;
  lowest_price?: number;
  highest_price?: number;
}

export interface Offer {
  id: number;
  product_id: number;
  seller_id: number;
  price: number;
  stock: number;
  expiry_date: string;
  batch_number?: string;
  status: 'active' | 'inactive' | 'sold_out';
  notes?: string;
  product?: Product;
  seller?: {
    id: number;
    pharmacy_name: string;
    city?: string;
  };
}

export interface CreateOfferData {
  product_id: number;
  price: number;
  stock: number;
  expiry_date: string;
  batch_number?: string;
  notes?: string;
}

export interface UpdateOfferData {
  price?: number;
  stock?: number;
  expiry_date?: string;
  batch_number?: string;
  status?: 'active' | 'inactive' | 'sold_out';
  notes?: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  offer_id: number;
  seller_id: number;
  quantity: number;
  price_at_addition: number;
  product: Product;
  offer: Offer;
  seller: {
    id: number;
    pharmacy_name: string;
    city?: string;
  };
}

export interface CartBySeller {
  seller: {
    id: number;
    pharmacy_name: string;
    city?: string;
  };
  items: CartItem[];
  subtotal: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  postal_code?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number;
  total_commission: number;
  total_amount: number;
  shipping_cost?: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: ShippingAddress;
  shipping_provider?: string;
  tracking_number?: string;
  shipping_label_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
  buyer?: {
    id: number;
    pharmacy_name: string;
    email: string;
    phone?: string;
  };
  seller?: {
    id: number;
    pharmacy_name: string;
    name?: string;
    city?: string;
  };
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  offer_id: number;
  seller_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  commission_rate: number;
  commission_amount: number;
  seller_payout_amount: number;
  product?: Product;
  seller?: {
    id: number;
    pharmacy_name: string;
    city?: string;
  };
}

export interface CreateOrderData {
  shipping_address: ShippingAddress;
  notes?: string;
  shipping_provider?: string;
  shipping_cost?: number;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface OffersResponse {
  offers: Offer[];
  pagination: Pagination;
}

export interface ProductOffersResponse {
  product: Product;
  offers: Offer[];
  offers_count: number;
  lowest_price: number;
  highest_price: number;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse {
  category: Category;
  products: Product[];
}

export interface CartResponse {
  cart: object | null;
  items: CartItem[];
  items_by_seller: CartBySeller[];
  item_count: number;
  total: number;
}

export interface CartActionResponse {
  message: string;
  item?: CartItem;
  item_count: number;
  total: number;
}

export interface CartValidationResponse {
  valid: boolean;
  issues: {
    item_id: number;
    product_name: string;
    type: 'unavailable' | 'stock' | 'price_changed';
    message: string;
    available_stock?: number;
    old_price?: number;
    new_price?: number;
  }[];
}

export interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface OrderResponse {
  order: Order;
  items: OrderItem[];
  items_by_seller: {
    seller: { id: number; pharmacy_name: string; city?: string };
    items: OrderItem[];
    subtotal: number;
    commission: number;
    payout: number;
  }[];
}

export interface SellerOrder {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  shipping_status?: string;
  tracking_number?: string;
  buyer: {
    id: number;
    pharmacy_name: string;
    email: string;
    phone?: string;
  };
  shipping_address: ShippingAddress;
  items: OrderItem[];
  seller_total: number;
  seller_commission: number;
  seller_payout: number;
  created_at: string;
}

export interface SellerOrdersResponse {
  orders: SellerOrder[];
  pagination: Pagination;
}

// Document types
export interface SellerDocument {
  id: number;
  type: string;
  type_label: string;
  original_name: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  status_label: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface DocumentsResponse {
  documents: SellerDocument[];
  required_types: { type: string; label: string }[];
  missing_types: string[];
  rejected_types: string[];
  all_approved: boolean;
  type_labels: Record<string, string>;
  status_labels: Record<string, string>;
}

export interface DocumentUploadResponse {
  message: string;
  document: SellerDocument;
}

export interface DocumentStatusResponse {
  documents_approved: boolean;
  has_pending: boolean;
  has_rejected: boolean;
  required_count: number;
  approved_count: number;
}

// Payment types
export interface PaymentConfig {
  enabled: boolean;
  gateway: 'none' | 'iyzico' | 'paytr';
  test_mode: boolean;
}

export interface PaymentInitResponse {
  success: boolean;
  payment_url?: string;
  checkout_html?: string;
  transaction_id?: string;
  gateway?: string;
  error?: string;
}

export interface PaymentCheckoutResponse {
  success: boolean;
  checkout_html?: string;
  gateway?: string;
  error?: string;
}

// Payment API
export const paymentsApi = {
  getConfig: () =>
    api.get<PaymentConfig>('/payments/config'),

  initialize: (orderId: number) =>
    api.post<PaymentInitResponse>('/payments/initialize', { order_id: orderId }),

  getCheckout: (orderId: number) =>
    api.get<PaymentCheckoutResponse>(`/payments/${orderId}/checkout`),

  refund: (orderId: number, amount?: number) =>
    api.post<{ success: boolean; refund_id?: string; refunded_amount?: number; error?: string }>(
      `/payments/${orderId}/refund`,
      amount ? { amount } : undefined
    ),
};

// Wallet types
export interface WalletSummary {
  balance: number;
  pending_balance: number;
  total_balance: number;
  withdrawn_balance: number;
  total_earned: number;
  total_commission: number;
}

export interface WalletTransaction {
  id: number;
  type: string;
  type_label: string;
  amount: number;
  direction: 'credit' | 'debit';
  signed_amount: number;
  description: string | null;
  order_id: number | null;
  created_at: string;
}

export interface BankAccount {
  id: number;
  bank_name: string;
  iban: string;
  masked_iban: string;
  formatted_iban: string;
  account_holder: string;
  is_default: boolean;
  is_verified: boolean;
}

export interface PayoutRequest {
  id: number;
  amount: number;
  status: string;
  status_label: string;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  bank_account?: BankAccount;
}

// Wallet API
export const walletApi = {
  getSummary: () =>
    api.get<{ wallet: WalletSummary }>('/wallet'),

  getTransactions: (limit = 20) =>
    api.get<{ transactions: WalletTransaction[] }>(`/wallet/transactions?limit=${limit}`),

  getBankAccounts: () =>
    api.get<{ bank_accounts: BankAccount[] }>('/wallet/bank-accounts'),

  addBankAccount: (data: { bank_name: string; iban: string; account_holder: string; swift_code?: string }) =>
    api.post<{ success: boolean; message: string; bank_account?: BankAccount; error?: string }>('/wallet/bank-accounts', data),

  deleteBankAccount: (id: number) =>
    api.delete<{ success: boolean; message: string; error?: string }>(`/wallet/bank-accounts/${id}`),

  setDefaultBankAccount: (id: number) =>
    api.post<{ success: boolean; message: string }>(`/wallet/bank-accounts/${id}/default`),

  getPayoutRequests: () =>
    api.get<{ payout_requests: PayoutRequest[] }>('/wallet/payout-requests'),

  createPayoutRequest: (data: { amount: number; bank_account_id: number; notes?: string }) =>
    api.post<{ success: boolean; message: string; payout_request?: PayoutRequest; error?: string }>('/wallet/payout-requests', data),
};

// Shipping types
export interface ShippingConfig {
  flat_rate: number;
  free_threshold: number;
  provider: string;
  enabled: boolean;
}

export interface ShippingCalculation {
  shipping_cost: number;
  is_free: boolean;
  remaining_for_free: number;
  free_threshold: number;
}

export interface ShippingTrack {
  success: boolean;
  status: string;
  status_label: string;
  tracking_number?: string;
  tracking_url?: string;
  current_location?: string;
  history?: Array<{ date: string; status: string; location?: string }>;
  error?: string;
}

export interface ShippingOption {
  provider: string;
  name: string;
  price: number;
  original_price: number;
  formatted_price: string;
  is_free: boolean;
  remaining_for_free: number | null;
  remaining_for_free_formatted: string | null;
}

export interface ShippingOptionsResponse {
  success: boolean;
  options: ShippingOption[];
  total_desi: number;
  order_amount: number;
}

// Shipping API
export const shippingApi = {
  getConfig: () =>
    api.get<ShippingConfig>('/shipping/config'),

  calculate: (subtotal: number) =>
    api.post<ShippingCalculation>('/shipping/calculate', { subtotal }),

  getOptions: (totalDesi: number, orderAmount: number) =>
    api.post<ShippingOptionsResponse>('/shipping/options', { total_desi: totalDesi, order_amount: orderAmount }),

  createShipment: (orderId: number) =>
    api.post<{ success: boolean; message: string; tracking_number?: string; label_url?: string; error?: string }>(`/shipping/orders/${orderId}/shipment`),

  track: (orderId: number) =>
    api.get<ShippingTrack>(`/shipping/orders/${orderId}/track`),
};

// Integrations Types
export interface IntegrationCredentials {
  api_key: string | null;
  api_secret: string | null;
  app_id: string | null;
  username: string | null;
  password: string | null;
  test_mode: boolean;
  wsdl_url: string | null;
}

export interface UserIntegration {
  id: number;
  erp_type: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  last_sync_at: string | null;
  error_message: string | null;
  is_configured: boolean;
  credentials?: IntegrationCredentials;
}

export const integrationsApi = {
  getAll: () => api.get<{ data: UserIntegration[] }>('/settings/integrations'),

  save: (data: { erp_type: string; api_key: string; api_secret: string; app_id?: string; extra_params?: Record<string, any> }) =>
    api.post<{ message: string; data: UserIntegration }>('/settings/integrations', data),

  sync: (erpType: string) => api.post<{ message: string }>('/settings/integrations/' + erpType + '/sync'),

  delete: (erpType: string) => api.delete<{ message: string }>('/settings/integrations/' + erpType),
};

export interface NotificationSetting {
  id: number;
  channel: 'sms' | 'email' | 'push';
  type: string;
  is_enabled: boolean;
}

export const notificationsApi = {
  getAll: () => api.get<{ settings: NotificationSetting[] }>('/settings/notifications'),
  update: (data: { channel: string; type: string; is_enabled: boolean }) =>
    api.post<{ message: string; setting: NotificationSetting }>('/settings/notifications', data),
};


export const wishlistApi = {
  getAll: () => api.get<any>('/wishlist'), // TODO: Define type
  toggle: (productId: number, targetPrice?: number) =>
    api.post<{ message: string; in_wishlist: boolean }>('/wishlist/toggle', { product_id: productId, target_price: targetPrice }),
};

export const legalApi = {
  getDocument: (slug: string) => api.get<{ content: string; version: string }>(`/legal/items/${slug}`),
  approveContract: (type: string, version: string) =>
    api.post<{ message: string }>('/legal/approve', { type, version }),
};

// CMS Types
export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
}

export interface NavigationMenuItem {
  id: number;
  title: string;
  url?: string;
  icon?: string;
  open_in_new_tab: boolean;
  children?: NavigationMenuItem[];
}

export interface HomepageSectionProduct {
  id: number;
  name: string;
  barcode: string;
  brand?: string;
  image?: string;
  category?: string;
  lowest_price?: number;
  offers_count: number;
}

export interface HomepageSection {
  id: number;
  title: string;
  subtitle?: string;
  type: string;
  settings?: Record<string, any>;
  products: HomepageSectionProduct[];
}

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon: string;
  products_count: number;
  children?: CategoryItem[];
}

export interface CmsLayoutResponse {
  menus: {
    header: NavigationMenuItem[];
    footer: NavigationMenuItem[];
    categories: NavigationMenuItem[];
    mobile: NavigationMenuItem[];
  };
  settings: {
    site_name: string;
    logo_url: string;
  };
}

export interface CmsHomepageResponse {
  banners: {
    hero: Banner[];
    middle: Banner[];
  };
  sections: HomepageSection[];
  categories: CategoryItem[];
}

// CMS API
export const cmsApi = {
  getLayout: () => api.get<CmsLayoutResponse>('/cms/layout'),
  getHomepage: () => api.get<CmsHomepageResponse>('/cms/homepage'),
  getBanners: (location: string) => api.get<Banner[]>(`/cms/banners/${location}`),
};

// Seller Dashboard Types
export interface SellerStat {
  value: number;
  formatted: string;
  change?: string;
  trend?: 'up' | 'down';
  pending?: string;
}

export interface SellerStatsResponse {
  success: boolean;
  data: {
    total_sales: SellerStat;
    active_offers: SellerStat;
    pending_orders: SellerStat;
    wallet_balance: SellerStat;
  };
}

export interface SellerRecentOrder {
  id: number;
  order_number: string;
  product: string;
  buyer: string;
  amount: string;
  status: string;
  status_label: string;
  created_at: string;
}

export interface SellerRecentOrdersResponse {
  success: boolean;
  data: SellerRecentOrder[];
}

export interface SellerProduct {
  id: number;
  offer_id: number;
  name: string;
  barcode: string;
  brand: string;
  image?: string;
  category?: string;
  price: number;
  stock: number;
  status: string;
  expiry_date?: string;
}

export interface SellerProductsResponse {
  success: boolean;
  data: SellerProduct[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SellerOrderItem {
  id: number;
  product_name: string;
  brand: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface SellerDashboardOrder {
  id: number;
  order_number: string;
  seller_buyer: {
    name: string;
    city: string;
  };
  seller_items: SellerOrderItem[];
  total: number;
  formatted_total: string;
  status: string;
  status_label: string;
  payment_status: string;
  created_at: string;
}

export interface SellerOrdersResponse {
  success: boolean;
  data: SellerDashboardOrder[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Seller Order Detail with Fee Breakdown
export interface SellerOrderFinancials {
  subtotal: { label: string; value: number; formatted: string };
  deductions: Array<{
    label: string;
    rate: number | null;
    value: number;
    formatted: string;
    visible?: boolean;
  }>;
  total_deductions: { label: string; value: number; formatted: string };
  net_amount: { label: string; value: number; formatted: string };
}

export interface SellerOrderDetail {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  payment_status: string;
  shipping_status?: string;
  tracking_number?: string;
  shipping_provider?: string;
  shipping_label_url?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  buyer: {
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    district?: string;
    address?: string;
  };
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    brand?: string;
    barcode?: string;
    image?: string;
    desi?: number;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  financials: SellerOrderFinancials;
  can_create_invoice: boolean;
  can_create_label: boolean;
}

export interface SellerOrderDetailResponse {
  success: boolean;
  data: SellerOrderDetail;
}

// Seller API
export const sellerApi = {
  getStats: () => api.get<SellerStatsResponse>('/seller/stats'),
  getRecentOrders: (limit?: number) => api.get<SellerRecentOrdersResponse>(`/seller/recent-orders${limit ? `?limit=${limit}` : ''}`),
  getProducts: (page?: number, perPage?: number) => api.get<SellerProductsResponse>(`/seller/products?page=${page || 1}&per_page=${perPage || 15}`),
  getOrders: (status?: string, page?: number, perPage?: number) => api.get<SellerOrdersResponse>(`/seller/orders?page=${page || 1}&per_page=${perPage || 15}${status ? `&status=${status}` : ''}`),
  getOrderDetail: (orderId: number) => api.get<SellerOrderDetailResponse>(`/seller/orders/${orderId}`),
};

// Invoice Types
export interface Invoice {
  id: number;
  invoice_number: string;
  type: 'seller' | 'commission' | 'tax' | 'shipping';
  type_label: string;
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'cancelled';
  status_label: string;
  subtotal: number;
  tax_rate?: number;
  tax_amount: number;
  total_amount: number;
  formatted_total: string;
  commission_rate?: number;
  commission_amount?: number;
  order_number?: string;
  order_id?: number;
  buyer_name?: string;
  seller_info?: Record<string, string>;
  buyer_info?: Record<string, string>;
  items?: Array<Record<string, any>>;
  erp_status: 'pending' | 'synced' | 'failed';
  erp_provider?: string;
  erp_invoice_id?: string;
  pdf_path?: string;
  created_at: string;
}

export interface InvoiceListResponse {
  success: boolean;
  data: Invoice[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CommissionSummaryResponse {
  success: boolean;
  data: {
    total_sales: { value: number; formatted: string };
    total_commission: { value: number; formatted: string };
    total_payout: { value: number; formatted: string };
    order_count: number;
    item_count: number;
    average_commission_rate: string;
  };
}

export interface CreateInvoiceResponse {
  success: boolean;
  message?: string;
  invoice?: {
    id: number;
    invoice_number: string;
    formatted_total: string;
  };
  error?: string;
}

// Invoice API
export const invoiceApi = {
  list: (type?: string, page?: number, perPage?: number) =>
    api.get<InvoiceListResponse>(`/invoices?page=${page || 1}&per_page=${perPage || 15}${type ? `&type=${type}` : ''}`),
  get: (id: number) => api.get<{ success: boolean; data: Invoice }>(`/invoices/${id}`),
  createForOrder: (orderId: number) => api.post<CreateInvoiceResponse>(`/invoices/orders/${orderId}`),
  getCommissionSummary: (startDate?: string, endDate?: string) =>
    api.get<CommissionSummaryResponse>(`/invoices/commission-summary${startDate ? `?start_date=${startDate}` : ''}${endDate ? `${startDate ? '&' : '?'}end_date=${endDate}` : ''}`),
  syncToErp: (invoiceId: number) => api.post<{ success: boolean; message?: string; erp_invoice_id?: string }>(`/invoices/${invoiceId}/sync-erp`),
};
