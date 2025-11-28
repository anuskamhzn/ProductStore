// Homepage.jsx - Premium UI (No external icon packages, pure Tailwind)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-12px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
    50%      { box-shadow: 0 0 40px rgba(99, 102, 241, 0.7); }
  }

  .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
  .animate-float    { animation: float 7s ease-in-out infinite; }
  .shimmer          { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
                      background-size: 200% 100%; animation: shimmer 1.8s infinite; }
  .gradient-text    { background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899);
                      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                      background-clip: text; }
`;

// Fallback image
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmM2Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const PRODUCTS_PER_PAGE = 20;
const API_BASE_URL = 'https://dummyjson.com/products';
const TOTAL_PRODUCTS = 194;
const DELAY_INITIAL = 1100;
const DELAY_MORE = 700;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Simple inline SVG icons
const TruckIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8m4-5V9a2 2 0 00-2-2h-2m-4 0H8a2 2 0 00-2 2v3m6 5h.01M8 21h4" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const PackageIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-2-4H6L4 7m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0H4" />
  </svg>
);
const StarIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v18l14-9L5 3z" />
  </svg>
);

// Premium Product Card
function ProductCard({ product, index, onProductClick }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasDiscount = product.discountPercentage > 0;
  const originalPrice = hasDiscount ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2) : null;
  const lowStock = product.stock <= 10;
  const imgSrc = product.thumbnail || product.images?.[0] || FALLBACK_IMAGE;

  return (
    <div
      onClick={() => onProductClick(product)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 cursor-pointer animate-fadeInUp"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden bg-gray-100">
        {!imgLoaded && <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />}
        <img
          src={imgSrc}
          alt={product.title}
          className={`w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE; setImgLoaded(true); }}
        />
        {/* Badges */}
        {hasDiscount && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
            −{Math.round(product.discountPercentage)}%
          </div>
        )}
        {lowStock && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
            Low Stock
          </div>
        )}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>
        {product.brand && <p className="text-sm text-gray-500 mt-1">{product.brand}</p>}

        <div className="flex items-center gap-3 mt-4">
          <span className="text-3xl font-bold text-gray-900">${product.price}</span>
          {originalPrice && <span className="text-lg text-gray-400 line-through">${originalPrice}</span>}
        </div>

        <div className="flex items-center mt-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d={i < Math.round(product.rating)
                  ? "M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                  : "M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"} />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
        </div>

        <div className="mt-4">
          <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full capitalize">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
}

// Skeleton
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-72 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
        <div className="absolute inset-0 shimmer" />
      </div>
      <div className="p-6 space-y-4">
        <div className="h-7 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-9 bg-gray-200 rounded w-28" />
        <div className="h-8 bg-gray-200 rounded-full w-24" />
      </div>
    </div>
  );
}

function Homepage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore] = useState(true);
  const observer = useRef();

  useEffect(() => {
    fetchCategories();
    fetchProducts(0, true);
  }, []);

  useEffect(() => {
    const current = observer.current;
    if (current) {
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !loading && !loadingMore) fetchProducts(skip, false);
      }, { threshold: 0.3 });
      obs.observe(current);
      return () => obs.disconnect();
    }
  }, [skip, loading, loadingMore]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/category-list`);
      const data = await res.json();
      await sleep(400);
      setCategories(['all', ...data.slice(0, 10)]);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async (currentSkip, fresh) => {
    try {
      fresh ? setLoading(true) : setLoadingMore(true);
      const res = await fetch(`${API_BASE_URL}?limit=${PRODUCTS_PER_PAGE}&skip=${currentSkip % TOTAL_PRODUCTS}`);
      const data = await res.json();
      await sleep(fresh ? DELAY_INITIAL : DELAY_MORE);

      const newProds = data.products || [];
      setProducts(prev => fresh ? newProds : [...prev, ...newProds]);
      setSkip(currentSkip + PRODUCTS_PER_PAGE);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (term) => term.trim() && navigate(`/search/${encodeURIComponent(term)}`);
  const handleCategory = (cat) => cat && cat !== 'all' && navigate(`/category/${encodeURIComponent(cat)}`);
  const handleProductClick = (p) => navigate(`/product-detail/${p.id}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <style>{styles}</style>

      {/* Hero */}
      <section className="relative py-24 text-center text-white overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="relative container mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Shop the Future</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Discover premium products at unbeatable prices
          </p>
        </div>
      </section>

      <Navbar
        searchTerm=""
        onSearchChange={handleSearch}
        selectedCategory=""
        onCategoryChange={handleCategory}
        categories={categories}
        loading={loading && products.length === 0}
      />

      {/* Products */}
      <main className="container mx-auto px-6 pb-24 pt-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">All Products</h2>
          <p className="text-lg text-gray-600 mt-3">Explore our latest collection</p>
        </div>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((p, i) => (
                <ProductCard key={`${p.id}-${skip}`} product={p} index={i} onProductClick={handleProductClick} />
              ))}
            </div>

            {loadingMore && (
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-lg font-medium text-gray-700">Loading more...</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => <SkeletonCard key={`more-${i}`} />)}
                </div>
              </div>
            )}

            <div ref={observer} className="h-20" />
          </>
        )}
      </main>
    </div>
  );
}

export default Homepage;