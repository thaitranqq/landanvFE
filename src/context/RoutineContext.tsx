/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Product } from '../types/api';

// Based on your API doc (RoutineDTO and RoutineItemDTO)
export interface RoutineItem {
  productId: number;
  step: number;
  timeOfDay: 'Sáng' | 'Tối' | 'Bất kỳ';
  product?: Product;
}

export interface Routine {
  id: number;
  userId: number;
  title: string;
  items: RoutineItem[];
}

interface RoutineContextType {
  routines: Routine[];
  loading: boolean;
  error: string | null;
  getRoutineById: (id: number) => Routine | undefined;
  createRoutine: (title: string) => void;
  addProductToRoutine: (routineId: number, productId: number, step: number, timeOfDay: 'Sáng' | 'Tối' | 'Bất kỳ') => void;
  updateRoutine: (routineId: number, title: string) => void;
  deleteRoutineItem: (routineId: number, productId: number) => void;
  reorderRoutineItems: (routineId: number, orderedItems: RoutineItem[]) => void;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

// Mock initial data
const initialRoutines: Routine[] = [
  {
    id: 1,
    userId: 1,
    title: 'Chăm sóc da buổi sáng',
    items: [
      { productId: 3, step: 1, timeOfDay: 'Sáng' },
      { productId: 4, step: 2, timeOfDay: 'Sáng' },
      { productId: 2, step: 3, timeOfDay: 'Sáng' },
    ]
  },
  {
    id: 2,
    userId: 1,
    title: 'Trị mụn chuyên sâu (hàng tuần)',
    items: []
  }
];

export const RoutineProvider = ({ children }: { children: ReactNode }) => {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const getRoutineById = (id: number) => routines.find(r => r.id === id);

  const createRoutine = (title: string) => {
    const newRoutine: Routine = { id: Date.now(), userId: 1, title, items: [] };
    setRoutines(prev => [...prev, newRoutine]);
  };

  const addProductToRoutine = (routineId: number, productId: number, step: number, timeOfDay: 'Sáng' | 'Tối' | 'Bất kỳ') => {
    setRoutines(prev => prev.map(r => {
      if (r.id === routineId && !r.items.some(item => item.productId === productId)) {
        return { ...r, items: [...r.items, { productId, step, timeOfDay }] };
      }
      return r;
    }));
  };

  const updateRoutine = (routineId: number, title: string) => {
    setRoutines(prev => prev.map(r => r.id === routineId ? { ...r, title } : r));
  };

  const deleteRoutineItem = (routineId: number, productId: number) => {
    setRoutines(prev => prev.map(r => 
      r.id === routineId ? { ...r, items: r.items.filter(item => item.productId !== productId) } : r
    ));
  };

  const reorderRoutineItems = (routineId: number, orderedItems: RoutineItem[]) => {
    const newItems = orderedItems.map((item, index) => ({ ...item, step: index + 1 }));
    setRoutines(prev => prev.map(r => r.id === routineId ? { ...r, items: newItems } : r));
  };

  return (
    <RoutineContext.Provider value={{ routines, loading, error, getRoutineById, createRoutine, addProductToRoutine, updateRoutine, deleteRoutineItem, reorderRoutineItems }}>
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutines = () => {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutines must be used within a RoutineProvider');
  }
  return context;
};
