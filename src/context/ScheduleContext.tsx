/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Based on your API doc (ScheduleDTO)
export interface Schedule {
  id: number;
  userId: number;
  productId: number;
  cronExpr: string;
  channel: string; // e.g., 'PUSH_NOTIFICATION'
  // For display purposes, we can add a user-friendly description
  description: string;
}

interface ScheduleContextType {
  schedules: Schedule[];
  getSchedulesForProduct: (productId: number) => Schedule[];
  // Backwards-compatible: can pass either a schedule object or (productId, cronExpr, channel)
  createSchedule: ((schedule: Omit<Schedule, 'id' | 'userId'>) => void) & ((productId: number, cronExpr: string, channel: string) => void);
  deleteSchedule: (scheduleId: number) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Mock initial data
const initialSchedules: Schedule[] = [
  {
    id: 1, 
    userId: 1, 
    productId: 2, // KCN
    cronExpr: '0 8 * * *', // 8:00 AM every day
    channel: 'PUSH_NOTIFICATION',
    description: 'Hàng ngày lúc 8:00 SA'
  }
];

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);

  const getSchedulesForProduct = (productId: number) => {
    return schedules.filter(s => s.productId === productId);
  };

  // Support both createSchedule({productId, cronExpr, channel}) and createSchedule(productId, cronExpr, channel)
  const createSchedule = (...args: unknown[]) => {
    let scheduleObj: Omit<Schedule, 'id' | 'userId'>;
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      scheduleObj = args[0] as Omit<Schedule, 'id' | 'userId'>;
    } else if (args.length >= 3 && typeof args[0] === 'number') {
      const [productId, cronExpr, channel] = args as [number, string, string];
      scheduleObj = { productId, cronExpr, channel, description: '' };
    } else {
      throw new Error('Invalid arguments to createSchedule');
    }

    // Build a simple human-readable description if not provided
    const desc = scheduleObj.description || `Lịch: ${scheduleObj.cronExpr}`;

    const newSchedule: Schedule = {
      id: Date.now(),
      userId: 1, // Mock user ID
      ...scheduleObj,
      description: desc,
    };
    setSchedules(prev => [...prev, newSchedule]);
  };

  const deleteSchedule = (scheduleId: number) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };

  return (
    <ScheduleContext.Provider value={{ schedules, getSchedulesForProduct, createSchedule, deleteSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedules = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedules must be used within a ScheduleProvider');
  }
  return context;
};
