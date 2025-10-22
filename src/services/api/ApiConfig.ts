export const API_CONFIG = {
  BASE_URL: 'https://api.ladanv.id.vn/api/v1',
  TIMEOUT: 15000,
  DEFAULT_PAGE_SIZE: 10,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Restore all endpoints required by the services to fix build errors.
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/signin',
    REGISTER: '/auth/signup',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    GOOGLE: '/oauth2/authorization/google',
  },
  USER: {
    PROFILE: '/profile',
    PREFERENCES: '/profile/prefs',
    ALLERGIES: '/profile',
  },
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    BARCODE: '/products/barcode', // Restored for barcode scanning
    COMPARE: '/products/compare',
    RECOMMENDED: '/products/recommended',
  },
  INGREDIENTS: {
    BASE: '/ingredients',
    SEARCH: '/ingredients/search',
    ANALYSIS: '/ingredients/analysis',
  },
  ROUTINES: {
    BASE: '/routines',
    ITEMS: '/routines/items',
  },
  SCHEDULES: {
    BASE: '/schedules',
    NOTIFICATIONS: '/schedules/notifications',
  },
  JOURNAL: {
    ENTRIES: '/journal/entries',
    ANALYSIS: '/journal/analysis',
  },
  FEEDBACK: {
    BASE: '/feedback',
    REVIEWS: '/feedback/reviews',
    RATINGS: '/feedback/ratings',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    INGREDIENTS: '/admin/ingredients',
    USERS: '/admin/users',
    EVENTS: '/admin/events',
    QA_MODERATION: '/admin/content/qa',
    USER_TRENDS: '/admin/trends/users',
  }
};
