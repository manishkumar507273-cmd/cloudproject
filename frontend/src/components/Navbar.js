import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">🛒 ShopNow</Link>
        
        <ul className="nav-links">
          <li><Link to="/products">Products</Link></li>
          {user && (
            <>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/orders">Orders</Link></li>
            </>
          )}
        </ul>

        <div className="auth-buttons">
          {user ? (
            <>
              <span style={{color: 'white', marginRight: '1rem'}}>Hi, {user.name}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;