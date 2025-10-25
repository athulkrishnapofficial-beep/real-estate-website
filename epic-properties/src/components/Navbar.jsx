import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoSrc from '../assets/logo.webp';
import { auth } from '../firebase'; // Still need auth to check state
// No longer need signOut
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = ({ onSearch }) => {
  const [user, loading] = useAuthState(auth);
  const [searchTerm, setSearchTerm] = useState(''); // State for the search input

  // Function to handle search submission (button click or Enter key)
  const handleSearchSubmit = (e) => {
    // Prevent default form submission if wrapped in a form later
    if (e) e.preventDefault(); 
    console.log("Navbar submitted with term:", searchTerm);
    if (onSearch) {
      onSearch(searchTerm); 
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">

      {/* Top Bar: Conditionally Rendered */}
      {/* Show only if loading is done AND user is NOT logged in */}
      {!loading && !user && (
        <div className="container mx-auto px-4 py-4 flex justify-end items-center">
          <div className="flex items-center space-x-1 md:space-x-2">
            <Link
              to="/login"
              className="text-gray-600 hover:bg-gray-100 px-3 py-1 md:px-4 md:py-2 rounded-md text-sm md:text-base"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              // Using border style for Sign Up as requested previously
              className="border border-black text-black hover:bg-black hover:text-white px-3 py-1 md:px-4 md:py-2 rounded-md text-sm md:text-base"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
      {/* If loading or user exists, this top bar section renders nothing */}

      {/* Bottom Bar: Always Visible */}
      <div className="bg-black">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center space-x-2 md:space-x-4">
          {/* Logo */}
          <Link to="/" onClick={() => onSearch('')}>
            <img
              src={logoSrc}
              alt="Logo"
              className="h-8 md:h-10"
            />
          </Link>
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 max-w-lg mx-2 md:mx-4 relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm} // Control input value with state
              onChange={(e) => setSearchTerm(e.target.value)} // Update state on change
              className="w-full pl-4 pr-12 py-2 border border-gray-700 bg-white text-black placeholder-gray-500 rounded-full text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit" // Make button submit the form
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 focus:outline-none"
              title="Search"
            >
              {/* Search Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </button>
          </form>
          {/* Favorites Button */}
          <Link
            to="/favorites"
            className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800"
            title="View Favorites"
            aria-label="View Favorites" // Added for accessibility
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
          </Link>
        </div>
      </div>

    </header>
  );
};

export default Navbar;