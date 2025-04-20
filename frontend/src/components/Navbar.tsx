import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={{ ...titleStyle, marginRight: 'auto', marginLeft: '16px' }}>Algory Capital Algorithmic Trading</div>
        <div style={buttonGroupStyle}>
          <NavButton to="/" label="Dashboard" />
          <NavButton to="/backtest" label="Backtest" />
          <NavButton to="/about" label="About" />
          <NavButton to="https://github.com/parkercarrus/cluster-trading-strategy" label="GitHub" />
        </div>
      </div>
    </nav>
  );
};

const NavButton = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    end={to === '/'}
    style={({ isActive }) => ({
      color: isActive ? '#60A5FA' : 'black',
      fontWeight: isActive ? 600 : 600,
      textDecoration: 'none',
      padding: '8px 12px',
    })}
  >
    {label}
  </NavLink>
);

const navStyle: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  padding: '12px 24px',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
};

const titleStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '20px',
  color: '#111827',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
};

export default Navbar;