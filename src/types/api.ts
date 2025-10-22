export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta?: unknown;
}

// New: AuthCredentials interface
export interface AuthCredentials {
  username?: string;
  email?: string; // Assuming either username or email can be used for login
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface ProductDTO {
  id: number;
  name: string;
  upcEan: string;
  category: string;
  imageUrl: string;
  country: string;
  brandId: number;
  brandName: string;
  createdAt: string;
}

export interface PageProductDTO {
  totalPages: number;
  totalElements: number;
  size: number;
  content: ProductDTO[];
  number: number;
  sort: Record<string, unknown> | null;
  numberOfElements: number;
  pageable: Record<string, unknown> | null;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface IngredientDTO {
  id: number;
  inciName: string;
  aliasVi: string;
  descriptionVi: string;
  functions: string;
  riskLevel: string; // Relaxed to string to avoid mismatches with mock data and external sources
  bannedIn: string;
  typicalRange: string;
  sources: string;
}

export interface ProfileDTO {
  userId: number;
  skinType: 'OILY' | 'DRY' | 'COMBINATION' | 'NORMAL' | 'SENSITIVE';
  concerns: string[];
  allergies: string[];
  pregnant: boolean;
  goals: string[];
  lifestyle: Record<string, unknown> | null;
}

export interface FeedbackDTO {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export interface OfferDTO {
  id: number;
  productId: number;
  productName: string;
  retailerId: number;
  retailerName: string;
  price: number;
  url: string;
  updatedAt: string;
}

export interface RegulatoryLabelDTO {
  id: number;
  region: string;
  code: string;
  description: string;
  level: string;
}

export interface RoutineItemDTO {
  routineId: number;
  productId: number;
  step: number;
  timeOfDay: string;
}

export interface RoutineDTO {
  id: number;
  userId: number;
  title: string;
  items: RoutineItemDTO[];
}

export interface ScheduleDTO {
  id: number;
  userId: number;
  productId: number;
  cronExpr: string;
  channel: string;
}

export interface AlertDTO {
  id: number;
  userId: number;
  type: string;
  payloadJson: string;
  status: string;
  createdAt: string;
}

// --- Added BrandDTO for admin pages ---
export interface BrandDTO {
  id: number;
  name: string;
  country?: string;
  createdAt?: string;
}

// The fully enhanced Product type that UI components expect
export interface Product extends ProductDTO {
  skinTypeScore: { [key: string]: number };
  ingredients: (IngredientDTO & { solves?: string[]; notes?: string; })[];
  purchaseLinks: OfferDTO[];
  reviews: FeedbackDTO[];
  regulatoryLabels: RegulatoryLabelDTO[];
  recommendationScore?: number;
}
