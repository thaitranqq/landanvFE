/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Product as ApiProduct, ProductDTO } from '../types/api';
import type { Product as DataProduct, Ingredient } from '../data/products';

// Accept either the fully enhanced Product (ApiProduct), a ProductDTO, or the DataProduct alias
export type UIProduct = ApiProduct | ProductDTO | DataProduct;

interface ModalContextType {
  isBarcodeModalOpen: boolean;
  openBarcodeModal: () => void;
  closeBarcodeModal: () => void;

  isAddToRoutineModalOpen: boolean;
  productToAdd: UIProduct | null;
  openAddToRoutineModal: (product: UIProduct) => void;
  closeAddToRoutineModal: () => void;

  isSetScheduleModalOpen: boolean;
  productToSchedule: UIProduct | null;
  openSetScheduleModal: (product: UIProduct) => void;
  closeSetScheduleModal: () => void;

  isIngredientModalOpen: boolean;
  selectedIngredient: Ingredient | null;
  openIngredientModal: (ingredient: Ingredient) => void;
  closeIngredientModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isAddToRoutineModalOpen, setIsAddToRoutineModalOpen] = useState(false);
  const [productToAdd, setProductToAdd] = useState<UIProduct | null>(null);
  const [isSetScheduleModalOpen, setIsSetScheduleModalOpen] = useState(false);
  const [productToSchedule, setProductToSchedule] = useState<UIProduct | null>(null);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const openBarcodeModal = () => setIsBarcodeModalOpen(true);
  const closeBarcodeModal = () => setIsBarcodeModalOpen(false);

  const openAddToRoutineModal = (product: UIProduct) => {
    setProductToAdd(product);
    setIsAddToRoutineModalOpen(true);
  };

  const closeAddToRoutineModal = () => {
    setIsAddToRoutineModalOpen(false);
    setProductToAdd(null);
  };

  const openSetScheduleModal = (product: UIProduct) => {
    setProductToSchedule(product);
    setIsSetScheduleModalOpen(true);
  };

  const closeSetScheduleModal = () => {
    setIsSetScheduleModalOpen(false);
    setProductToSchedule(null);
  };

  const openIngredientModal = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsIngredientModalOpen(true);
  };

  const closeIngredientModal = () => {
    setIsIngredientModalOpen(false);
    setSelectedIngredient(null);
  };

  return (
    <ModalContext.Provider value={{ 
      isBarcodeModalOpen, openBarcodeModal, closeBarcodeModal,
      isAddToRoutineModalOpen, productToAdd, openAddToRoutineModal, closeAddToRoutineModal,
      isSetScheduleModalOpen, productToSchedule, openSetScheduleModal, closeSetScheduleModal,
      isIngredientModalOpen, selectedIngredient, openIngredientModal, closeIngredientModal
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
