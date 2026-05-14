import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './css/index.css';

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
}

ReactDOM.createRoot(document.getElementById('root')).render(
   <div> Main jsx page </div>
  <React.StrictMode>
    <div> Main jsx page div 3 </div>
    <App />
  </React.StrictMode>
);
