import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`/orders/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="container">
      <h1 style={{textAlign: 'center', marginBottom: '2rem', color: '#333'}}>Order History</h1>
      
      <div className="orders-list">
        {orders.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', color: '#666'}}>
            No orders yet. <a href="/products">Start shopping</a>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h3>Order #{order.id}</h3>
                <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#ff6b6b'}}>
                  ${order.total_price}
                </span>
              </div>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Items:</strong> {order.items_count}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;