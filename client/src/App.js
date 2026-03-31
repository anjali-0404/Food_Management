import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import DonationsPage from './pages/DonationsPage';
import DonatePage from './pages/DonatePage';
import MapPage from './pages/MapPage';
import { DashboardPage, LeaderboardPage } from './pages/DashboardPages';
import './index.css';

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍱</div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#FF6B35' }}>
          Loading FoodBridge...
        </div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="/donations"   element={<DonationsPage />} />
          <Route path="/map"         element={<MapPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/donate"      element={<PrivateRoute><DonatePage /></PrivateRoute>} />
          <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
