import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { ToastWrapper } from 'keep-react';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ToastWrapper
      richColors={true}
      toastOptions={{
        classNames: {
          title: 'text-body-3 font-medium',
          toast: 'rounded-xl shadow-large',
          description: 'text-body-4 font-normal',
        },
      }}
    />
  </React.StrictMode>
);
