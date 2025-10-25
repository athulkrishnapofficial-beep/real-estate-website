import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CategoryNav from './CategoryNav';

// Accept onSearch prop from App.jsx
const Layout = ({ onSearch }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Pass onSearch down to Navbar */}
      <Navbar onSearch={onSearch} />
      <CategoryNav />
      <main className="flex-grow">
        {/* Outlet renders HomePage, which gets props directly from App.jsx Route */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;