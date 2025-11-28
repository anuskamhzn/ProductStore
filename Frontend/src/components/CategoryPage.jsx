
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';  // Adjusted path for consistency

// Reuse styles, FALLBACK_IMAGE, etc.
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

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const PRODUCTS_PER_PAGE = 20;
const API_BASE_URL = 'https://dummyjson.com/products';

const DELAY_INITIAL_LOAD = 1500;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Updated ProductCard with click handler (same as before)
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
          className={`w-full h-48 object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
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

// Filter and Sort Controls Component
function Filters({
  minRating, setMinRating,
  sortBy, setSortBy,
  totalProducts,
  filteredProductsLength
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Filters & Sort</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map(r => (
              <option key={r} value={r}>{r}★ & up</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredProductsLength} of {totalProducts} products
      </div>
    </div>
  );
}

// Main CategoryPage Component
function CategoryPage() {
  const { category: selectedCategory } = useParams();
  const navigate = useNavigate();
  const [rawProducts, setRawProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const observerTarget = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products on category change
  useEffect(() => {
    if (!selectedCategory) {
      navigate('/', { replace: true });
      return;
    }
    fetchProducts();
  }, [selectedCategory, navigate]);

  // Compute filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...rawProducts];

    // Rating filter
    if (minRating !== '' && !isNaN(minRating)) {
      filtered = filtered.filter(p => p.rating >= parseInt(minRating));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default: keep original order
        break;
    }

    return filtered;
  }, [rawProducts, minRating, sortBy]);

  // Update display products on filter/sort change
  useEffect(() => {
    setDisplayProducts(filteredAndSortedProducts.slice(0, PRODUCTS_PER_PAGE));
    setPage(1);
    setHasMore(filteredAndSortedProducts.length > PRODUCTS_PER_PAGE);
  }, [filteredAndSortedProducts]);

  // Load more on infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
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
  }, [page, hasMore, loading, filteredAndSortedProducts]);

  const loadMore = () => {
    const nextPageStart = page * PRODUCTS_PER_PAGE;
    const nextProducts = filteredAndSortedProducts.slice(nextPageStart, nextPageStart + PRODUCTS_PER_PAGE);
    if (nextProducts.length > 0) {
      setDisplayProducts(prev => [...prev, ...nextProducts]);
      setPage(prev => prev + 1);
      setHasMore(nextPageStart + nextProducts.length < filteredAndSortedProducts.length);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/category/${encodeURIComponent(selectedCategory)}?limit=100`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      await sleep(DELAY_INITIAL_LOAD);

      setRawProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = useCallback((value) => {
    if (value) {
      navigate(`/search/${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleCategoryChange = useCallback((value) => {
    if (value) {
      navigate(`/category/${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleProductClick = useCallback((product) => {
    navigate(`/product-detail/${product.id}`);
  }, [navigate]);

  if (error && rawProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          Error: {error}. <button onClick={fetchProducts} className="underline">Retry</button>
        </div>
      </div>
    );
  }

  const categoryTitle = selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{styles}</style>
      <Navbar
        searchTerm=""
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        loading={loading && rawProducts.length === 0}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 animate-fadeIn">
          <h1 className="text-2xl font-bold text-gray-900">Products in "{categoryTitle}" Category</h1>
        </div>

        <Filters
          minRating={minRating}
          setMinRating={setMinRating}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalProducts={total}
          filteredProductsLength={filteredAndSortedProducts.length}
        />

        {loading && rawProducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No products found matching your filters in "{categoryTitle}". Try adjusting your filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>

            {hasMore && <div ref={observerTarget} className="h-10 mt-8"></div>}

            {!hasMore && displayProducts.length > 0 && (
              <div className="text-center text-gray-500 py-8 animate-fadeIn">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">You've reached the end of the results</p>
                <p className="text-sm mt-1">That's all the products matching your criteria</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default CategoryPage;