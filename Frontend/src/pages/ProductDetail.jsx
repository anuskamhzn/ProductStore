// ProductDetail.jsx - Premium Modern UI (No external icons, pure Tailwind)
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
    50%      { box-shadow: 0 0 40px rgba(99, 102, 241, 0.7); }
  }
  .animate-fadeInUp { animation: fadeInUp 0.7s ease-out forwards; }
  .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 200% 100%; animation: shimmer 1.8s infinite; }
  .gradient-text { background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
`;

// Inline SVG Icons
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg className={`w-6 h-6 ${filled ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const ShareIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m.684 2.684C9.866 13.938 10 14.394 10 15c0 .606-.134 1.062-.316 1.342M12 9v6m-3-3h6" />
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg className={`w-5 h-5 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.374 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.374-2.455a1 1 0 00-1.176 0l-3.374 2.455c-.784.57-1.838-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.316 9.397c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.97z"/>
  </svg>
);

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmM2Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const API_BASE_URL = 'https://dummyjson.com/products';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (id) fetchProduct(id);
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/category-list`);
      const data = await res.json();
      await sleep(200);
      setCategories(data);
    } catch (e) { console.error(e); }
  };

  const fetchProduct = async (pid) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/${pid}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      await sleep(1000);
      setProduct(data);
      setSelectedImg(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (v) => v.trim() && navigate(`/search/${encodeURIComponent(v)}`);
  const handleCategory = (v) => v && navigate(`/category/${encodeURIComponent(v)}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
          <p className="text-2xl text-red-600 mb-4">{error || 'Product not found'}</p>
          <button onClick={() => navigate(-1)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const mainImg = images[selectedImg] || product.thumbnail || FALLBACK_IMAGE;
  const hasDiscount = product.discountPercentage > 0;
  const originalPrice = hasDiscount ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <style>{styles}</style>

      <Navbar
        searchTerm=""
        onSearchChange={handleSearch}
        selectedCategory=""
        onCategoryChange={handleCategory}
        categories={categories}
        loading={false}
      />

      <main className="container mx-auto px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-8 transition animate-fadeInUp"
        >
          <BackIcon />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fadeInUp">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-white">
              <img
                src={mainImg}
                alt={product.title}
                className="w-full h-96 md:h-full max-h-screen object-contain transition-transform duration-500 hover:scale-105"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2 rounded-full font-bold text-lg shadow-xl">
                  −{Math.round(product.discountPercentage)}% OFF
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`rounded-xl overflow-hidden border-4 transition-all ${selectedImg === i ? 'border-indigo-600 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{product.title}</h1>
              {product.brand && <p className="text-xl text-gray-600 mt-2">{product.brand}</p>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} filled={i < Math.round(product.rating)} />
                ))}
              </div>
              <span className="text-gray-600 font-medium">({product.rating} / 5)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-gray-900">${product.price}</span>
              {originalPrice && (
                <span className="text-2xl text-gray-400 line-through">${originalPrice}</span>
              )}
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-4 text-lg">
              <span className="font-medium">Availability:</span>
              <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Meta Info */}
            <div className="border-t pt-8 space-y-3 text-gray-600">
              <p><span className="font-semibold">Category:</span> <span className="capitalize">{product.category}</span></p>
              {product.tags && product.tags.length > 0 && (
                <p><span className="font-semibold">Tags:</span> {product.tags.join(', ')}</p>
              )}
              <p><span className="font-semibold">SKU:</span> {product.sku || 'N/A'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDetail;