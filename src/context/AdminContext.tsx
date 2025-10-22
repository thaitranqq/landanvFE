/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { BrandDTO, IngredientDTO, ProductDTO } from '../types/api';

// Mock data structures based on your API doc
interface UserTrend {
  bySkinType: { [key: string]: number };
  popularProducts: { [key: string]: number };
}

interface SearchStats {
  keywordSearches: { [key: string]: number };
}

interface RiskyProduct {
  id: number;
  name: string;
  riskScore: number;
}

export interface Question {
    id: string;
    question: string;
    author: string;
    createdAt: string;
    isAnswered: boolean;
}

export interface EventDTO {
    id: number;
    userId: number;
    type: string;
    payloadJson: string;
    timestamp: string;
}

interface AdminContextType {
  userTrends: UserTrend;
  searchStats: SearchStats;
  riskyProducts: RiskyProduct[];
  questions: Question[];
  events: EventDTO[];
  brands: BrandDTO[];
  ingredients: IngredientDTO[];
  products: ProductDTO[];
  answerQuestion: (questionId: string, answer: string) => Promise<void>;
  createBrand: (name: string) => Promise<void>;
  updateBrand: (id: number, name: string) => Promise<void>;
  deleteBrand: (id: number) => Promise<void>;
  createIngredient: (ingredient: Omit<IngredientDTO, 'id'>) => Promise<void>;
  updateIngredient: (id: number, ingredient: Omit<IngredientDTO, 'id'>) => Promise<void>;
  deleteIngredient: (id: number) => Promise<void>;
  createProduct: (productData: FormData) => Promise<void>;
  updateProduct: (id: number, productData: FormData) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Self-contained mock data to prevent import errors and server-side execution issues.
const mockAdminData = {
  userTrends: { bySkinType: { "Da dầu": 120, "Da khô": 80, "Da hỗn hợp": 250, "Da nhạy cảm": 95 }, popularProducts: { "Serum Hyalu B5": 500, "Gel Rửa Mặt Effaclar": 450, "KCN Anthelios": 600 } },
  searchStats: { keywordSearches: { "trị mụn": 1200, "retinol": 950, "chống nắng": 1500, "b5": 800 } },
  riskyProducts: [{ id: 2, name: "Kem Chống Nắng Anthelios UVMune 400", riskScore: 88 }, { id: 5, name: "Retinol 0.5% in Squalane", riskScore: 75 }],
  questions: [{ id: "q1", question: "Mình da dầu dùng Retinol được không ạ?", author: "user123", createdAt: new Date().toISOString(), isAnswered: false }, { id: "q2", question: "Sản phẩm này có dùng chung với BHA được không?", author: "user456", createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), isAnswered: false }],
  events: [
      { id: 1, userId: 123, type: "USER_LOGIN", payloadJson: JSON.stringify({}), timestamp: new Date().toISOString() }, 
      { id: 2, userId: 456, type: "PRODUCT_SEARCH", payloadJson: JSON.stringify({ keyword: "retinol" }), timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() }
  ],
  brands: [{ id: 1, name: "La Roche-Posay" }, { id: 2, name: "CeraVe" }, { id: 3, name: "The Ordinary" }],
  ingredients: [
      { id: 1, inciName: "Aqua / Water", aliasVi: "Nước", descriptionVi: "Dung môi chính...", functions: "Dung môi", riskLevel: "Tốt", bannedIn: "", typicalRange: "", sources: "Nước" },
      { id: 2, inciName: "Glycerin", aliasVi: "Glycerin", descriptionVi: "Chất giữ ẩm...", functions: "Dưỡng ẩm", riskLevel: "Tốt", bannedIn: "", typicalRange: "1-10%", sources: "Thực vật" },
  ],
  products: [
      { id: 1, name: "Nước Tẩy Trang Micellar Water", upcEan: "3337875588768", category: "Tẩy trang", imageUrl: "", country: "Pháp", brandId: 1, brandName: "La Roche-Posay", createdAt: new Date().toISOString() },
      { id: 2, name: "Kem Chống Nắng Anthelios UVMune 400", upcEan: "3337875797597", category: "Kem chống nắng", imageUrl: "", country: "Pháp", brandId: 1, brandName: "La Roche-Posay", createdAt: new Date().toISOString() },
  ]
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [userTrends] = useState<UserTrend>(mockAdminData.userTrends);
  const [searchStats] = useState<SearchStats>(mockAdminData.searchStats);
  const [riskyProducts] = useState<RiskyProduct[]>(mockAdminData.riskyProducts);
  const [questions, setQuestions] = useState<Question[]>(mockAdminData.questions);
  const [events] = useState<EventDTO[]>(mockAdminData.events);
  const [brands, setBrands] = useState<BrandDTO[]>(mockAdminData.brands);
  const [ingredients, setIngredients] = useState<IngredientDTO[]>(mockAdminData.ingredients);
  const [products, setProducts] = useState<ProductDTO[]>(mockAdminData.products);
  const [loading] = useState(false);

  const answerQuestion = async (questionId: string, answer: string) => {
    console.log(`Answering question ${questionId} with: "${answer}"`);
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, isAnswered: true } : q));
  };

  const createBrand = async (name: string) => {
    const newBrand: BrandDTO = { id: Date.now(), name };
    setBrands(prev => [newBrand, ...prev]);
  };

  const updateBrand = async (id: number, name: string) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, name } : b));
  };

  const deleteBrand = async (id: number) => {
    setBrands(prev => prev.filter(b => b.id !== id));
  };

  const createIngredient = async (ingredient: Omit<IngredientDTO, 'id'>) => {
    const newIngredient: IngredientDTO = { id: Date.now(), ...ingredient };
    setIngredients(prev => [newIngredient, ...prev]);
  };

  const updateIngredient = async (id: number, ingredient: Omit<IngredientDTO, 'id'>) => {
    setIngredients(prev => prev.map(i => i.id === id ? { id, ...ingredient } : i));
  };

  const deleteIngredient = async (id: number) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const createProduct = async (productData: FormData) => {
    console.log('Creating product with data:', Object.fromEntries(productData.entries()));
  };

  const updateProduct = async (id: number, productData: FormData) => {
    console.log(`Updating product ${id} with data:`, Object.fromEntries(productData.entries()));
  };

  const deleteProduct = async (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AdminContext.Provider value={{ userTrends, searchStats, riskyProducts, questions, events, brands, ingredients, products, answerQuestion, createBrand, updateBrand, deleteBrand, createIngredient, updateIngredient, deleteIngredient, createProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
