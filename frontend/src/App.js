
import Navbar from './components/Navbar'

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import BrowserRouter, Routes, Route
import HomePage from './Pages/HomePage'; // Corrected import to HomePage
import Analyze from './Pages/Analyze';
import './index.css'; 
import About from './Pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
        
        <Navbar />
        

        <main className="w-full max-w-4xl px-4">
          <Routes>
            <Route path="/" element={<Analyze />} />
            <Route path="/analyze" element={<HomePage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
