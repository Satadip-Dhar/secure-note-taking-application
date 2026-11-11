import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: '#1f2937',
        color: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <strong style={{ fontSize: '18px' }}>Secure Notes</strong>
        {user && (
          <>
            <Link to="/notes" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
              Notes
            </Link>
            <Link to="/posts" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
              Posts
            </Link>
            <Link to="/explore" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
              Explore
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#f59e0b', textDecoration: 'none' }}>
                Admin Panel
              </Link>
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <span>
              {user.name} (<strong>{user.role}</strong>)
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
