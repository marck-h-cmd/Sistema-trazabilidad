export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    SCANNER_CONFIG: (id: string) => `/users/${id}/scanner-config`,
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
  },
  SUPPLIERS: {
    BASE: '/suppliers',
    BY_ID: (id: string) => `/suppliers/${id}`,
  },
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: string) => `/customers/${id}`,
  },
  WAREHOUSES: {
    BASE: '/warehouses',
    BY_ID: (id: string) => `/warehouses/${id}`,
  },
  RECEPTIONS: {
    BASE: '/receptions',
    BY_ID: (id: string) => `/receptions/${id}`,
    SCAN: '/receptions/scan',
  },
  PRODUCTIONS: {
    BASE: '/productions',
    BY_ID: (id: string) => `/productions/${id}`,
  },
  INVENTORY: {
    MOVEMENTS: '/inventory/movements',
    STOCK_LOT: (id: string) => `/inventory/stock/lot/${id}`,
    STOCK_LOCATION: (id: string) => `/inventory/stock/location/${id}`,
    MOVE: '/inventory/move',
  },
  SHIPMENTS: {
    BASE: '/shipments',
    BY_ID: (id: string) => `/shipments/${id}`,
  },
  TRACEABILITY: {
    BY_CODE: (code: string) => `/traceability/${code}`,
    PUBLIC: (code: string) => `/traceability/public/${code}`,
  },
  ALERTS: {
    BASE: '/alerts',
    BY_ID: (id: string) => `/alerts/${id}`,
  },
  REPORTS: {
    BASE: '/reports',
  },
  DASHBOARD: {
    KPIS: '/dashboard/kpis',
    ACTIVITY: '/dashboard/activity',
  },
} as const;