/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { Home } from './pages/Home';
import { Stock } from './pages/Stock';
import { Collections } from './pages/Collections';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { AdminLogin } from './pages/Admin/Login';
import { AdminDashboard } from './pages/Admin/Dashboard';
import { OfflineToast } from './components/OfflineToast';

export default function App() {
  return (
    <div id="una-aura-app">
      <SettingsProvider>
        <CartProvider>
          <OfflineToast />
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/estoque" element={<Stock />} />
              <Route path="/colecoes" element={<Collections />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </Router>
        </CartProvider>
      </SettingsProvider>
    </div>
  );
}
