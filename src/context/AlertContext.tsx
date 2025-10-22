/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Based on your API doc (AlertDTO)
export interface Alert {
  id: number;
  userId: number;
  type: 'NEW_RECOMMENDATION' | 'ROUTINE_REMINDER' | 'ALLERGY_WARNING';
  payloadJson: string; // JSON string with details
  status: 'UNREAD' | 'READ';
  createdAt: string;
}

interface AlertContextType {
  alerts: Alert[];
  unreadCount: number;
  markAsRead: (alertId: number) => void;
  markAllAsRead: () => void;
  createAlert: (type: Alert['type'], payload: object) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Mock initial data
const initialAlerts: Alert[] = [
  {
    id: 1,
    userId: 1,
    type: 'NEW_RECOMMENDATION',
    payloadJson: JSON.stringify({ productName: 'Serum Hyalu B5', productId: 4 }),
    status: 'UNREAD',
    createdAt: new Date().toISOString(),
  },
];

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const unreadCount = alerts.filter(a => a.status === 'UNREAD').length;

  const markAsRead = (alertId: number) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'READ' } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, status: 'READ' })));
  };

  const createAlert = (type: Alert['type'], payload: object) => {
    const newAlert: Alert = {
        id: Date.now(),
        userId: 1, // Mock user ID
        type,
        payloadJson: JSON.stringify(payload),
        status: 'UNREAD',
        createdAt: new Date().toISOString(),
    };
    // Add new alert to the top of the list
    setAlerts(prev => [newAlert, ...prev]);
  };

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, markAsRead, markAllAsRead, createAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
