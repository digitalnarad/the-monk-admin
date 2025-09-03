// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  TAGS: '/api/tags',
  AUTH: '/api/auth'
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCT_ADD: '/products/add',
  PRODUCT_EDIT: '/products/edit',
  CATEGORIES: '/categories',
  TAGS: '/tags'
};

// Product variants
export const PRODUCT_VARIANTS = ['vertical', 'horizontal', 'square'];

// Icons - you can replace these with actual icon imports
export const icons = {
  sort: '/icons/sort.svg',
  search: '/icons/search.svg',
  add: '/icons/add.svg',
  edit: '/icons/edit.svg',
  delete: '/icons/delete.svg',
  user: '/icons/user.svg',
  logout: '/icons/logout.svg',
  dashboard: '/icons/dashboard.svg',
  products: '/icons/products.svg',
  categories: '/icons/categories.svg',
  tags: '/icons/tags.svg'
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  pageSize: 10,
  currentPage: 0
};

// Theme colors
export const THEME = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  light: '#f8fafc',
  dark: '#1e293b'
};
