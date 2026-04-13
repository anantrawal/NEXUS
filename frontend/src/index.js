import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import App from './App';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f0ede8',
              border: '1px solid rgba(255,255,255,0.07)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#5ce08a', secondary: '#1a1a1a' } },
            error:   { iconTheme: { primary: '#e05c5c', secondary: '#1a1a1a' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
