import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      await axios.post('/cart', { product_id: productId, quantity: 1 }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="container">
      <h1 style={{textAlign: 'center', marginBottom: '3rem', color: '#333'}}>Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img 
              src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
              alt={product.name}
              className="product-image"
            />
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-price">${product.price}</div>
              <p className="product-description">{product.description}</p>
              <button 
                className="btn btn-primary"
                style={{width: '100%'}}
                onClick={() => addToCart(product.id)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;