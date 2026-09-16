import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@flaticon/flaticon-uicons/css/regular/rounded.css';
import '@flaticon/flaticon-uicons/css/bold/rounded.css';
import '@flaticon/flaticon-uicons/css/solid/rounded.css';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
