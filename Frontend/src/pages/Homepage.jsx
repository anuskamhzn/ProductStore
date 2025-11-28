// Updated Homepage.jsx with clickable ProductCard
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

const PRODUCTS_PER_PAGE = 20;
const API_BASE_URL = 'https://dummyjson.com/products';
const TOTAL_PRODUCTS = 194;

// Configurable delays for demo (in ms)
const DELAY_INITIAL_LOAD = 1500;
const DELAY_SUBSEQUENT_LOAD = 1000;
const DELAY_CATEGORIES = 500;

// Reusable sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Updated Product Card Component with animations and click handler
function ProductCard({ product, index, onProductClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const originalPrice = product.discountPercentage > 0 
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2) 
    : null;
  const isLowStock = product.stock <= 5 || product.availabilityStatus === 'Low Stock';
  const imgSrc = product.thumbnail || product.images?.[0] || FALLBACK_IMAGE;

  const handleClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group animate-fadeIn cursor-pointer"
      style={{ animationDelay: `${(index % 20) * 50}ms` }}
    >
      <div className="relative overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
        )}
        <img 
          src={imgSrc} 
          alt={product.title}
          className={`w-full h-48 object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => { 
            if (e.target.src !== FALLBACK_IMAGE) {
              e.target.src = FALLBACK_IMAGE;
            }
            setImageLoaded(true);
          }}
        />
        {isLowStock && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
            Low Stock
          </span>
        )}
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded text-xs font-semibold shadow-lg">
            {Math.round(product.discountPercentage)}% OFF
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate group-hover:text-blue-600 transition-colors">{product.title}</h3>
        {product.brand && (
          <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
        )}
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-3">
          <div className="space-x-2">
            <span className="text-xl font-bold text-green-600">${product.price}</span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">${originalPrice}</span>
            )}
          </div>
          <div className="text-yellow-500 text-sm flex items-center">
            {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
            <span className="text-gray-400 ml-1">({product.rating})</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">{product.category}</span>
          {product.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{tag}</span>
          ))}
        </div>
        {product.availabilityStatus && (
          <div className="mt-2 text-xs text-gray-500">{product.availabilityStatus}</div>
        )}
      </div>
    </div>
  );
}

// Enhanced Skeleton Loader with shimmer effect
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
        <div className="flex justify-between mt-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12"></div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

function Homepage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef(null);

  // Fetch categories and initial products on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts(0, true);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchProducts(skip, false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [skip, hasMore, loading, loadingMore]);

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

  const fetchProducts = async (currentSkip, isNewSearch) => {
    try {
      if (isNewSearch) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const actualSkip = currentSkip % TOTAL_PRODUCTS;
      const url = `${API_BASE_URL}?limit=${PRODUCTS_PER_PAGE}&skip=${actualSkip}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      const delay = isNewSearch ? DELAY_INITIAL_LOAD : DELAY_SUBSEQUENT_LOAD;
      await sleep(delay);
      
      const fetchedProducts = data.products;
      
      if (isNewSearch) {
        setProducts(fetchedProducts);
      } else {
        setProducts(prev => [...prev, ...fetchedProducts]);
      }
      
      setSkip(currentSkip + PRODUCTS_PER_PAGE);
      setHasMore(true); // Always has more for all products
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  const handleProductClick = useCallback((product) => {
    navigate(`/product-detail/${product.id}`);
  }, [navigate]);

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          Error: {error}. <button onClick={() => fetchProducts(0, true)} className="underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{styles}</style>
      <Navbar
        searchTerm=""
        onSearchChange={handleSearchChange}
        selectedCategory=""
        onCategoryChange={handleCategoryChange}
        categories={categories}
        loading={loading && products.length === 0}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600 mt-2">Discover our latest collection</p>
        </div>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No products available at the moment.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard 
                  key={`${product.id}-${skip}`} 
                  product={product} 
                  index={index}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>

            {loadingMore && (
              <div className="mt-8 mb-8">
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Loading more products...</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                  {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            )}

            {hasMore && <div ref={observerTarget} className="h-10 mt-8"></div>}
          </>
        )}
      </main>
    </div>
  );
}

export default Homepage;