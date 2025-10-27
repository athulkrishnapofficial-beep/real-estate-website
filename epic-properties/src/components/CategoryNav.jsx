import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

const CategoryNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const categories = [
    // Use the same strings as the PropertyFilter <option> values so URL category filters match
    "Appartment", "Boutique Houses", "House", "Land",
    "Office", "Restaurant", "Retail", "Studio Appartments"
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Signed out successfully from CategoryNav.");
      navigate('/'); // Redirect to home page
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <nav className="bg-red-600">
      <div className="container mx-auto px-4">
        {/* --- Desktop Menu --- */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex">
            {categories.map((category) => (
              <Link
                key={category}
                // --- CHANGE HERE: Link to homepage with query parameter ---
                to={`/?category=${encodeURIComponent(category)}`}
                // --------------------------------------------------------
                className="text-white font-medium px-3 py-3 hover:bg-red-700 transition-colors duration-200"
              >
                {category}
              </Link>
            ))}
          </div>
          {/* Desktop Sign Out Button */}
          {!loading && user && (
            <button
              onClick={handleSignOut}
              className="text-white font-medium px-3 py-3 hover:bg-red-700 transition-colors duration-200"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* --- Mobile Menu Button --- */}
        <div className="md:hidden flex justify-start">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white font-medium px-4 py-3 flex items-center"
          >
            {/* Hamburger Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            All Categories
          </button>
        </div>
      </div>

      {/* --- Mobile Side Nav --- */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Menu Content */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-60 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-800">
          <h2 className="font-bold text-lg text-white">Categories</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-gray-300 hover:text-white"
          >
            {/* Close Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Links */}
        <div className="flex flex-col bg-red-600 h-full overflow-y-auto">
          {categories.map((category) => (
            <Link
              key={category}
              // --- CHANGE HERE: Link to homepage with query parameter ---
              to={`/?category=${encodeURIComponent(category)}`}
              // --------------------------------------------------------
              className="text-white p-4 border-b border-red-700 hover:bg-red-700 transition-colors duration-150"
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
            >
              {category}
            </Link>
          ))}
          {/* Mobile Sign Out Button */}
          {!loading && user && (
            <button
              onClick={() => {
                handleSignOut();
                setIsMobileMenuOpen(false); // Close menu after click
              }}
              className="text-red-100 p-4 border-b border-red-700 hover:bg-red-700 transition-colors duration-150 text-left w-full font-medium"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;