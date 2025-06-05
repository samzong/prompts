import React from 'react';
import ReactDOM from 'react-dom/client';
import { QuickPicker } from './components/QuickPicker';
import './index.css';

ReactDOM.createRoot(document.getElementById('quick-picker-root')!).render(
  <React.StrictMode>
    <QuickPicker />
  </React.StrictMode>,
); 