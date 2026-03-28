import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { OrderBadgeProvider } from './context/OrderBadgeContext';
import { NotificationProvider } from './context/NotificationContext';
import { RealtimeProvider } from './context/RealtimeContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <RealtimeProvider>
            <OrderBadgeProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </OrderBadgeProvider>
          </RealtimeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
