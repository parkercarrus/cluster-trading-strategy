import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Backtest from './pages/Backtest'
import About from './pages/About';

const App = () => {
  return (
    <Router>
      <div style={{ backgroundColor: '#0A1929', minHeight: '100vh', color: 'white' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/backtest" element={<Backtest />} />
          <Route path="/about" element={<About />} />
          <Route path="/GitHub" element={<a href="https://github.com/parkercarrus/cluster-trading-strategy" target="_blank" rel="noopener noreferrer">GitHub</a>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;