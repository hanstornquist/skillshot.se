import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import '../stylesheets/base.css';
import '../stylesheets/skeleton.css';
import '../stylesheets/layout.css';
import '../stylesheets/Main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
