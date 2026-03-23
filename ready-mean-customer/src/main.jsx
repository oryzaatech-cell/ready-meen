import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ActiveOrdersProvider } from './context/ActiveOrdersContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ActiveOrdersProvider>
              <App />
            </ActiveOrdersProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
