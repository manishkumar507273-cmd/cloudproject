import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`/cart/${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : ''}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(itemId);
    
    try {
      // For simplicity, we'll remove and re-add with new quantity
      await removeFromCart(itemId);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      for (let i = 0; i < newQuantity; i++) {
        await axios.post('/cart', { 
          product_id: cartItems.find(item => item.id === itemId).product_id, 
          quantity: 1 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const placeOrder = async () => {
    try {
      await axios.post('/order', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Order placed successfully!');
      fetchCart();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div className="container">
      <h1 style={{textAlign: 'center', marginBottom: '2rem', color: '#333'}}>Shopping Cart</h1>
      
      <div className="cart-container">
        {cartItems.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', color: '#666'}}>
            Your cart is empty. <a href="/products">Continue shopping</a>
          </div>
        ) : (
          <>
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image_url} alt={item.name} />
                <div className="cart-details">
                  <h3>{item.name}</h3>
                  <p>${item.price} each</p>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn" 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{fontSize: '1.2rem', minWidth: '30px', textAlign: 'center'}}>
                      {item.quantity}
                    </span>
                    <button 
                      className="quantity-btn" 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{marginLeft: '1rem'}}
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{fontSize: '1.2rem', fontWeight: 'bold', marginTop: '1rem'}}>
                    ${ (item.price * item.quantity).toFixed(2) }
                  </div>
                </div>
              </div>
            ))}
            
            <div className="cart-total">
              <h2>Total: <span className="total-price">${total.toFixed(2)}</span></h2>
              <button 
                className="btn btn-primary" 
                style={{width: '100%', fontSize: '1.3rem', padding: '1rem'}}
                onClick={placeOrder}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;