import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import your components
import LandingPage from './components/LandingPage';
import StockEvaluator from './components/StockEvaluator';
import PortfolioAnalyzer from './components/PortfolioAnalyzer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the main landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Route for the Stock Evaluator */}
        <Route path="/stock-evaluator" element={<StockEvaluator />} />

        {/* Route for the Portfolio Analyzer */}
        <Route path="/portfolio-analyzer" element={<PortfolioAnalyzer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;