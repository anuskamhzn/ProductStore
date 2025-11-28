// Updated ProductDetail.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 

const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes gradientShift {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .gradient-bg {
    background: linear-gradient(-45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .card-hover-glow:hover {
    animation: glow 2s ease-in-out infinite;
  }
`;

// Fallback image
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const API_BASE_URL = 'https://dummyjson.com/products';

// Configurable delays for demo (in ms)
const DELAY_INITIAL_LOAD = 1500;
const DELAY_CATEGORIES = 500;

// Reusable sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch product on mount or id change
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    } else {
      navigate('/', { replace: true });
    }
  }, [id, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/category-list`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      
      await sleep(DELAY_CATEGORIES);
      
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProduct = async (productId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${productId}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      
      await sleep(DELAY_INITIAL_LOAD / 2);
      
      setProduct(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((value) => {
    if (value) {
      navigate(`/search/${encodeURIComponent(value)}`);
    }
  }, [navigate]);

  const handleCategoryChange = useCallback((value) => {
    if (value) {
      navigate(`/category/${encodeURIComponent(value)}`);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          Error: {error || 'Product not found'}. <button onClick={() => navigate(-1)} className="underline">Go Back</button>
        </div>
      </div>
    );
  }

  const originalPrice = product.discountPercentage > 0 
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{styles}</style>
      <Navbar
        searchTerm=""
        onSearchChange={handleSearchChange}
        selectedCategory=""
        onCategoryChange={handleCategoryChange}
        categories={categories}
        loading={false}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fadeIn">
          <button 
            onClick={() => navigate(-1)} 
            className="mb-4 inline-flex items-center text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            ← Go Back 
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          {/* Images Section */}
          <div className="space-y-4">
            <img 
              src={product.images?.[0] || FALLBACK_IMAGE} 
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt={`${product.title} ${i + 2}`}
                    className="h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">${product.price}</span>
                {originalPrice && (
                  <span className="text-lg text-gray-400 line-through">${originalPrice}</span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    {Math.round(product.discountPercentage)}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-yellow-500 text-xl">
                  {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                </div>
                <span className="text-gray-600">({product.rating})</span>
              </div>

              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Brand:</span> {product.brand}</p>
                <p><span className="font-medium">Category:</span> {product.category}</p>
                <p><span className="font-medium">Stock:</span> {product.stock} available</p>
                {product.availabilityStatus && (
                  <p><span className="font-medium">Status:</span> {product.availabilityStatus}</p>
                )}
                {product.tags && (
                  <p><span className="font-medium">Tags:</span> {product.tags.join(', ')}</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;