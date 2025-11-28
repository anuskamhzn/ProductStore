import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiX, FiMenu } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

function Navbar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  loading
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const searchRef = useRef(null);
  const categoryRef = useRef(null);

  // Debounced search for suggestions
  useEffect(() => {
    if (!localSearchTerm || localSearchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://dummyjson.com/products/search?q=${encodeURIComponent(localSearchTerm)}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data.products || []);
        setShowSuggestions(true);
        setLoadingSuggestions(false);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (value) => {
    onCategoryChange(value === 'all' ? '' : value);
    setIsMobileMenuOpen(false);
    setIsCategoryOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchChange(localSearchTerm);
      setShowSuggestions(false);
      e.target.blur();
      setIsMobileMenuOpen(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSearchIconClick = () => {
    if (isSearchOpen && localSearchTerm) {
      onSearchChange(localSearchTerm);
      setShowSuggestions(false);
      if (searchRef.current) {
        const input = searchRef.current.querySelector('input');
        if (input) input.blur();
      }
    } else {
      setIsSearchOpen(!isSearchOpen);
    }
  };

  const handleSuggestionClick = (product) => {
    setLocalSearchTerm(product.title);
    onSearchChange(product.title);
    setShowSuggestions(false);
    if (searchRef.current) {
      const input = searchRef.current.querySelector('input');
      if (input) input.blur();
    }
    setIsMobileMenuOpen(false);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearchChange('');
  };

  const handleMobileSearch = () => {
    if (localSearchTerm) {
      onSearchChange(localSearchTerm);
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Loading skeleton for navbar
  if (loading) {
    return (
      <nav className="bg-white/10 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4 animate-pulse">
            <div className="h-8 bg-white/20 rounded-lg w-40"></div>
            <div className="h-10 bg-white/20 rounded-lg w-32"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/10 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">

          {/* Logo/Brand */}
          <NavLink to='/'>
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-105 shadow-md">
                <FiShoppingBag className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight group-hover:tracking-wide transition-all duration-300">
                Product<span className="text-blue-300">Store</span>
              </h1>
            </div>
          </NavLink>

          {/* Desktop - Search and Category (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Animated Search with Suggestions */}
            <div className="relative flex items-center" ref={searchRef}>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-visible"
                  >
                    <div className="relative pr-2">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => localSearchTerm.length >= 2 && setShowSuggestions(true)}
                        className="w-full pl-3 pr-20 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-300/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 shadow-sm"
                        autoFocus
                      />

                      {localSearchTerm && (
                        <button
                          onClick={handleClearSearch}
                          className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200/50 rounded-full transition-colors"
                        >
                          <FiX className="w-4 h-4 text-gray-500" />
                        </button>
                      )}

                      {/* Suggestions Dropdown */}
                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-2 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
                          >
                            {loadingSuggestions ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Searching...
                              </div>
                            ) : suggestions.length > 0 ? (
                              <div className="py-2">
                                <div className="px-3 py-2 text-xs text-gray-500 font-medium uppercase">
                                  Suggested Products
                                </div>
                                {suggestions.map((product) => (
                                  <button
                                    key={product.id}
                                    onClick={() => handleSuggestionClick(product)}
                                    className="w-full px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {product.title}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {product.category}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : localSearchTerm.length >= 2 ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No products found for "{localSearchTerm}"
                              </div>
                            ) : null}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearchIconClick}
                className="p-2.5 bg-white/95 backdrop-blur-sm border border-gray-300/40 rounded-xl hover:border-gray-400/50 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <FiSearch className="w-5 h-5 text-gray-700" />
              </motion.button>
            </div>

            {/* Category Filter - Desktop Dropdown */}
            <div className="relative" ref={categoryRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="pl-3 pr-9 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-300/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 text-gray-900 text-sm font-medium cursor-pointer transition-all duration-200 hover:border-gray-400/50 shadow-sm min-w-[140px] flex items-center justify-between"
              >
                <span>
                  {selectedCategory ? (
                    (() => {
                      const cat = categories.find(c => {
                        const val = typeof c === 'object' ? (c.slug || c.name) : c;
                        return val === selectedCategory;
                      });
                      const display = typeof cat === 'object' && cat !== null
                        ? (cat.name || cat.slug || String(cat))
                        : String(cat || selectedCategory);
                      return display.charAt(0).toUpperCase() + display.slice(1);
                    })()
                  ) : (
                    'All Categories'
                  )}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m6 8 4 4 4-4" />
                </svg>
              </motion.button>

              {/* Category Dropdown Menu */}
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="py-2">
                      <button
                        onClick={() => handleCategoryChange('all')}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${!selectedCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                      >
                        All Categories
                      </button>
                      {Array.isArray(categories) && categories.map((category) => {
                        const categoryValue = typeof category === 'object' && category !== null
                          ? (category.slug || category.name || String(category))
                          : String(category);
                        const categoryDisplay = typeof category === 'object' && category !== null
                          ? (category.name || category.slug || String(category))
                          : String(category);

                        return (
                          <button
                            key={categoryValue}
                            onClick={() => handleCategoryChange(categoryValue)}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${selectedCategory === categoryValue ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                              }`}
                          >
                            {categoryDisplay.charAt(0).toUpperCase() + categoryDisplay.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile - Hamburger Menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 bg-white/95 backdrop-blur-sm border border-gray-300/40 rounded-xl hover:border-gray-400/50 transition-all duration-200 shadow-sm focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <FiX className="w-5 h-5 text-gray-700" />
            ) : (
              <FiMenu className="w-5 h-5 text-gray-700" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-3 pr-20 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-300/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 text-gray-900 text-sm placeholder-gray-500 transition-all duration-200 shadow-sm"
                  />
                  {localSearchTerm && (
                    <>
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200/50 rounded-full transition-colors"
                      >
                        <FiX className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={handleMobileSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                      >
                        <FiSearch className="w-4 h-4 text-white" />
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile Category */}
                <div className="relative">
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full pl-3 pr-9 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-300/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 text-gray-900 text-sm font-medium cursor-pointer transition-all duration-200 shadow-sm flex items-center justify-between"
                  >
                    <span>
                      {selectedCategory ? (
                        (() => {
                          const cat = categories.find(c => {
                            const val = typeof c === 'object' ? (c.slug || c.name) : c;
                            return val === selectedCategory;
                          });
                          const display = typeof cat === 'object' && cat !== null
                            ? (cat.name || cat.slug || String(cat))
                            : String(cat || selectedCategory);
                          return display.charAt(0).toUpperCase() + display.slice(1);
                        })()
                      ) : (
                        'All Categories'
                      )}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m6 8 4 4 4-4" />
                    </svg>
                  </button>

                  {/* Mobile Category Dropdown */}
                  <AnimatePresence>
                    {isCategoryOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-64 overflow-y-auto"
                      >
                        <button
                          onClick={() => handleCategoryChange('all')}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${!selectedCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                            }`}
                        >
                          All Categories
                        </button>
                        {Array.isArray(categories) && categories.map((category) => {
                          const categoryValue = typeof category === 'object' && category !== null
                            ? (category.slug || category.name || String(category))
                            : String(category);
                          const categoryDisplay = typeof category === 'object' && category !== null
                            ? (category.name || category.slug || String(category))
                            : String(category);

                          return (
                            <button
                              key={categoryValue}
                              onClick={() => handleCategoryChange(categoryValue)}
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${selectedCategory === categoryValue ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                }`}
                            >
                              {categoryDisplay.charAt(0).toUpperCase() + categoryDisplay.slice(1)}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navbar;