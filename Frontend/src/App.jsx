import React, { useState, useEffect } from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';

import Homepage from './pages/Homepage'
import SearchPage from './components/SearchPage'
import CategoryPage from './components/CategoryPage'
import ProductDetail from './pages/ProductDetail';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/search/:query' element={<SearchPage />} />
        <Route path='/category/:category' element={<CategoryPage />} />
        <Route path='/product-detail/:id' element={<ProductDetail />} />
      </Routes>
    </>
  )
}

export default App
