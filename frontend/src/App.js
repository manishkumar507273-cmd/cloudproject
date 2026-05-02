import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Navbar from './components/Navbar';
import { AuthContext } from './context/AuthContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/products" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/products" />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/products" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;