// SearchPage.jsx - Premium Search Results Page
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const styles = `
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .animate-fadeInUp { animation: fadeInUp 0.7s ease-out forwards; }
  .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 200% 100%; animation: shimmer 1.8s infinite; }
  .gradient-text { background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
`;

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmM2Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const API_BASE_URL = 'https://dummyjson.com/products';
const PRODUCTS_PER_PAGE = 20;
const DELAY = 900;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function ProductCard({ product, index, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const discount = product.discountPercentage > 0;
  const original = discount ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2) : null;
  const lowStock = product.stock <= 10;
  const img = product.thumbnail || product.images?.[0] || FALLBACK_IMAGE;

  return (
    <div
      onClick={() => onClick(product)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 cursor-pointer animate-fadeInUp"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative overflow-hidden bg-gray-100">
        {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />}
        <img
          src={img}
          alt={product.title}
          className={`w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={(e) => { if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE; }}
        />
        {discount && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
            −{Math.round(product.discountPercentage)}%
          </div>
        )}
        {lowStock && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
            Low Stock
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>
        {product.brand && <p className="text-sm text-gray-500 mt-1">{product.brand}</p>}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-3xl font-bold text-gray-900">${product.price}</span>
          {original && <span className="text-lg text-gray-400 line-through">${original}</span>}
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

function Filters({ minRating, setMinRating, sortBy, setSortBy, total, shown }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Refine Results</h2>
        <p className="text-gray-600">Showing {shown} of {total} products</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Rating</label>
          <select
            value={minRating}
            onChange={e => setMinRating(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            <option value="">All Ratings</option>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>★★★★★ {n} & up</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            <option value="default">Best Match</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Customer Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { query } = useParams();
  const navigate = useNavigate();
  const searchTerm = decodeURIComponent(query || '');
  const [products, setProducts] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const observer = useRef();

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (searchTerm) fetchProducts(); }, [searchTerm]);

  const filteredSorted = useMemo(() => {
    let list = [...products];
    if (minRating) list = list.filter(p => p.rating >= minRating);
    if (sortBy === 'price-asc') list.sort((a,b) => a.price - b.price);
    if (sortBy === 'price-desc') list.sort((a,b) => b.price - a.price);
    if (sortBy === 'rating-desc') list.sort((a,b) => b.rating - a.rating);
    return list;
  }, [products, minRating, sortBy]);

  useEffect(() => {
    setDisplayed(filteredSorted.slice(0, PRODUCTS_PER_PAGE));
    setPage(1);
    setHasMore(filteredSorted.length > PRODUCTS_PER_PAGE);
  }, [filteredSorted]);

  useEffect(() => {
    if (!observer.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && hasMore && !loading) {
        const start = page * PRODUCTS_PER_PAGE;
        const next = filteredSorted.slice(start, start + PRODUCTS_PER_PAGE);
        if (next.length) {
          setDisplayed(p => [...p, ...next]);
          setPage(p => p + 1);
        }
      }
    }, { threshold: 0.3 });
    obs.observe(observer.current);
    return () => obs.disconnect();
  }, [page, hasMore, loading, filteredSorted]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/category-list`);
      const data = await res.json();
      setCategories(['all', ...data]);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm)}&limit=100`);
      const data = await res.json();
      await sleep(DELAY);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const goToProduct = (p) => navigate(`/product-detail/${p.id}`);
  const handleSearch = (v) => v.trim() && navigate(`/search/${encodeURIComponent(v)}`);
  const handleCategory = (v) => navigate(v === 'all' ? '/' : `/category/${encodeURIComponent(v)}`);

  if (!searchTerm) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <style>{styles}</style>
      <Navbar searchTerm={searchTerm} onSearchChange={handleSearch} selectedCategory="" onCategoryChange={handleCategory} categories={categories} loading={loading && !products.length} />

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Search Results for "<span className="gradient-text">{searchTerm}</span>"
          </h1>
          <p className="text-xl text-gray-600">We found {total} products matching your search</p>
        </div>

        <Filters minRating={minRating} setMinRating={setMinRating} sortBy={sortBy} setSortBy={setSortBy} total={total} shown={filteredSorted.length} />

        {loading && !products.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-center py-24">
            <div className="bg-white rounded-3xl shadow-2xl p-16 max-w-lg mx-auto">
              <svg className="w-28 h-28 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-3xl font-bold text-gray-800">No results found</p>
              <p className="text-gray-600 mt-4">Try different keywords or remove filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayed.map((p, i) => <ProductCard key={p.id} product={p} index={i} onClick={goToProduct} />)}
            </div>
            {hasMore && <div ref={observer} className="h-20" />}
            {!hasMore && <div className="text-center py-16 text-xl font-medium text-gray-700">You've seen all results!</div>}
          </>
        )}
      </main>
    </div>
  );
}