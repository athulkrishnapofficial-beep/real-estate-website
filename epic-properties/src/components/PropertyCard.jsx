import React from 'react';
import { Link } from 'react-router-dom';

// Icons
const DateIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /> </svg> );
const ViewIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> );

// Helper to format the date... (keep the existing formatDate function)
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return 'Just now';
  return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const PropertyCard = ({ property }) => {
  const {
    id, title, imageUrl, price, location, listingType,
    propertyType,
    isNegotiable, createdAt, viewCount = 0,
  } = property;

  return (
    <Link
      to={`/property/${id}`}
      className="block bg-surface-light dark:bg-surface-dark rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
    >
      {/* --- Image Container --- */}
      <div className="relative aspect-video">
        <img
          src={imageUrl || 'https://placehold.co/600x338/E2E8F0/AAAAAA?text=No+Image'}
          alt={title || 'Property Image'}
          className="w-full h-full object-cover"
        />
        {/* Red Tag */}
        <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-md text-sm font-semibold uppercase">
          {propertyType || 'N/A'}
        </span>
      </div>

      {/* --- Content Area --- */}
      {/* Changed p-5 to px-5 pt-3 pb-5 to reduce top padding */}
      <div className="px-5 pt-2 pb-5 leading-tight"> {/* <-- Adjust padding here */}

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark truncate" title={title || 'Untitled Property'}>
          {title || 'Untitled Property'}
        </h3>
        {/* Location */}
        <p className="text-text-secondary dark:text-text-secondary-dark text-sm mt-1 truncate" title={location || 'No Location'}>
          {location || 'No Location'}
        </p>
        {/* Price */}
        <div className="mt-2">
          <span className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
            ₹{(price || 0).toLocaleString()}
          </span>
          {isNegotiable && (
            <span className="ml-1 text-[9px] text-gray-500 dark:text-gray-400 opacity-80 align-middle">
  (Negotiable)
</span>


          )}
        </div>
        {/* Stats */}
        {/* Changed text-xs to text-[11px] for even smaller text */}
        <div className="flex justify-between items-center mt-4 text-[11px] text-text-secondary dark:text-text-secondary-dark border-t border-gray-100 dark:border-gray-700 pt-3"> {/* <-- Adjust text size */}
          <span className="flex items-center space-x-1">
            <DateIcon />
            <span>{formatDate(createdAt)}</span>
          </span>
          <span className="flex items-center space-x-1">
            <ViewIcon />
            <span>{viewCount}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;