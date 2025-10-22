import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProductProvider } from './context/ProductContext.tsx';
import { UserProvider } from './context/UserContext.tsx';
import { RoutineProvider } from './context/RoutineContext.tsx';
import { ScheduleProvider } from './context/ScheduleContext.tsx';
import { ModalProvider } from './context/ModalContext.tsx';
import { AlertProvider } from './context/AlertContext.tsx';
import { JournalProvider } from './context/JournalContext.tsx'; // Import the new provider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <UserProvider>
          <ProductProvider>
            <RoutineProvider>
              <ScheduleProvider>
                <JournalProvider> {/* Add the JournalProvider */} 
                  <AlertProvider>
                    <ModalProvider>
                      <App />
                    </ModalProvider>
                  </AlertProvider>
                </JournalProvider>
              </ScheduleProvider>
            </RoutineProvider>
          </ProductProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
