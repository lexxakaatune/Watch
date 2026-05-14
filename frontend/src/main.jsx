import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './css/index.css';

<div> Main jsx page div 1  </div>

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
}

<div> Main jsx page div 2 </div>

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div> Main jsx page div 3 </div>
    <App />
  </React.StrictMode>
);
