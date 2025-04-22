import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import BaselineDashboard from './pages/BaselineDashboard';
import BacktestPage from './pages/BacktestPage';
import About from './pages/About';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <Router>
      <div style={{ backgroundColor: '#0A1929', minHeight: '100vh', color: 'white' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<BaselineDashboard />} />
          <Route path="/backtest" element={<BacktestPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/github" element={<Navigate to="https://github.com/parkercarrus/cluster-trading-strategy" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
