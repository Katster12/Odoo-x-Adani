import React, { useContext } from 'react';
import logo from '../assets/react.svg';
import { AuthContext } from '../Context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <header className="header">
      <div className="header-content">
        <img src={logo} alt="GearGuard Logo" className="logo-spin" />
        <h1>GearGuard</h1>
        <span className="subtitle">The Ultimate Maintenance Tracker</span>
      </div>
      {user && (
        <div className="user-info-header">
          <span className="role-badge" style={{
            background: user.role === 'technician' ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' : 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
          }}>
            {user.role === 'technician' ? '🔧' : '👤'} {user.role === 'technician' ? 'Technician' : 'User'}
          </span>
          <span className="user-name">{user.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      )}
    </header>
  );
};

export default Header;