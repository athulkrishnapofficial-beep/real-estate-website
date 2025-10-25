import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import PropertyFilter from '../components/PropertyFilter';
import PropertyCard from '../components/PropertyCard';
import AddPropertyForm from '../components/AddPropertyForm';
import { db } from '../firebase'; // Import Firestore
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'; // Import query functions

// Accept props from App.jsx for navbar search integration
const HomePage = ({ initialFilters, clearNavFilters }) => {
  // Filters state - this is the single source of truth for querying
  const [filters, setFilters] = useState(initialFilters || {});
  const [properties, setProperties] = useState([]); // Holds the fetched properties
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [error, setError] = useState(null); // Holds any fetch errors
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Controls visibility of detailed filter form
  const [isAddFormVisible, setIsAddFormVisible] = useState(false); // Controls visibility of Add Property modal

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilterFromURL = searchParams.get('category'); // Get 'category' value from URL

  // Helper function to check if any filter values are actively set
  const hasActiveFilters = (currentFilters) => {
    // Also consider the URL category filter as active
    if (categoryFilterFromURL) return true;
    // Check if any filter value is not empty, undefined, or null
    return Object.values(currentFilters).some(value => value !== '' && value !== undefined && value !== null);
  };
  // Boolean flag based on whether filters are active
  const isSearching = hasActiveFilters(filters);


  // Memoize clearNavFilters from props to stabilize its reference
  const stableClearNavFilters = useCallback(clearNavFilters, [clearNavFilters]);

  // --- Effect to Sync Filters from Props/URL ---
  useEffect(() => {
    console.log('Filter Sync - Start:', { categoryFromURL: categoryFilterFromURL, currentFilters: filters, initialFilters: initialFilters });

    let targetFilters = {}; // Define the target state we want to achieve
    let shouldUpdateState = false;
    let reason = "default/cleared"; // For logging

    // Helper booleans
    const currentFiltersAreEmpty = !filters || Object.keys(filters).length === 0;
    const initialFiltersAreEmpty = !initialFilters || Object.keys(initialFilters).length === 0 || initialFilters.keyword === '';
    const initialFiltersHaveKeyword = initialFilters && initialFilters.keyword !== undefined && initialFilters.keyword !== '';

    // Determine target based on priority
    // Priority 1: Category from URL (takes precedence)
    if (categoryFilterFromURL) {
        targetFilters = { propertyType: categoryFilterFromURL };
        reason = "url category";
        // Ensure nav filter state in App is cleared if URL category takes precedence
        stableClearNavFilters();
        // Clear any keyword from previous nav search in initialFilters if URL category clicked
        // This relies on clearNavFilters updating initialFilters prop quickly
    }
    // Priority 2: Navbar Search (only if NO category URL)
    else if (initialFiltersHaveKeyword) {
        targetFilters = initialFilters;
        reason = "navbar keyword";
        // No need to clear URL params, already checked they are absent
    }
    // Priority 3: No external filters (navbar or URL) - target should be empty
    else {
        targetFilters = {};
        reason = "no external filters";
    }

    // Only update the local 'filters' state if the target is different from the current state
    if (JSON.stringify(filters) !== JSON.stringify(targetFilters)) {
        console.log(`Sync Effect: Setting filters state based on ${reason}. New filters:`, targetFilters);
        setFilters(targetFilters); // Update the state
        shouldUpdateState = true; // Mark that state was updated
    } else {
        // Log if no update is needed
        console.log(`Sync Effect: No change needed. Reason: ${reason}. Filters remain:`, filters);
    }

    // Close detailed filter only if a specific filter became active (keyword or propertyType)
    // Check targetFilters here, as it's guaranteed to be defined
    if (shouldUpdateState && (targetFilters.keyword || targetFilters.propertyType)) {
        setIsFilterOpen(false);
    }

  // Depend ONLY on the external inputs that should trigger a filter sync
  }, [initialFilters, categoryFilterFromURL, stableClearNavFilters, setSearchParams]); // Removed 'filters' dependency


  // --- Effect to Fetch Data (Depends only on 'filters' state) ---
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching properties with filters:", filters); // Log the filters being used

      try {
        let q; // Firestore query variable
        const queryConstraints = []; // Array to hold 'where' clauses
        const propertiesCollection = collection(db, 'properties');

        // --- Determine Query Type based on Filters ---

        // **Case 1: Navbar Keyword Search is Active**
        if (filters.keyword) {
            console.log("Building query for keyword:", filters.keyword);
            queryConstraints.push(where('searchKeywords', 'array-contains', filters.keyword.toLowerCase()));
            // Construct the query with only the array-contains filter.
            // Ordering by another field with array-contains requires specific indexes.
            q = query(propertiesCollection, ...queryConstraints);

        }
        // **Case 2: No Keyword Search - Use Category or Detailed Filters**
        else {
            console.log("Building query for category or detailed filters.");
            // Apply propertyType filter if present (from URL category or detailed filter)
            if (filters.propertyType) {
                queryConstraints.push(where('propertyType', '==', filters.propertyType));
            }
            // Apply other detailed filters
            if (filters.location) { queryConstraints.push(where('location', '>=', filters.location), where('location', '<=', filters.location + '\uf8ff')); }
            if (filters.listingType) { queryConstraints.push(where('listingType', '==', filters.listingType)); }
            if (filters.minPrice) { queryConstraints.push(where('price', '>=', parseFloat(filters.minPrice))); }
            if (filters.maxPrice) { queryConstraints.push(where('price', '<=', parseFloat(filters.maxPrice))); }
            if (filters.startDate) { queryConstraints.push(where('createdAt', '>=', Timestamp.fromDate(new Date(filters.startDate)))); }
            if (filters.endDate) { const endOfDay = new Date(filters.endDate); endOfDay.setHours(23, 59, 59, 999); queryConstraints.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay))); }

            // Construct the query with applicable filters and order by creation date
            if (queryConstraints.length > 0) {
                 q = query(propertiesCollection, ...queryConstraints, orderBy('createdAt', 'desc'));
            } else {
                 // Default query: No filters, just order by newest first.
                 q = query(propertiesCollection, orderBy('createdAt', 'desc'));
            }
        }
        // --- End Query Construction ---

        console.log("Executing Firestore query...");
        const querySnapshot = await getDocs(q); // Fetch documents
        const propsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Map results
        console.log(`Found ${propsList.length} properties.`);
        setProperties(propsList); // Update state with fetched properties

      } catch (err) { // Handle errors
          console.error("Error fetching properties: ", err); // Log the actual error object
          let userErrorMessage = "Failed to load properties. Please try again later."; // Default message

          if (err instanceof Error) { // Check if err is a proper Error object
            if (err.code === 'failed-precondition') {
                 userErrorMessage = "This search requires a specific database index. Please check the browser console for a link to create it in Firebase.";
            } else if (err.code === 'permission-denied') {
                 userErrorMessage = "You don't have permission to view these properties. Check Firestore rules.";
            } else if (err.code === 'invalid-argument'){
                 userErrorMessage = "There was a problem with the search terms or filters used.";
            } else if (err.message && err.message.includes('array-contains')) {
                 // More specific message for array-contains limitations
                userErrorMessage = "Combining keyword search with other filters or sorting has limitations. Try searching by keyword alone or using only the detailed filters.";
            }
          }
          setError(userErrorMessage); // Set the determined error message for the user
      } finally { // START of the finally block
          setLoading(false); // Stop loading indicator regardless of success or error
      }
    };

    // Only fetch if filters state is actually available
    if (filters) {
       fetchProperties(); // Call the fetch function
    }
  }, [filters]); // Re-run this effect ONLY whenever the 'filters' state changes

  // Handler for changes from the detailed PropertyFilter component
  const handleFilterChange = (newFilters) => {
    console.log('Detailed filters applied:', newFilters);
    stableClearNavFilters(); // Clear any navbar search state in App.jsx
    setSearchParams({}, { replace: true }); // Clear category from URL
    setFilters(newFilters); // Set the detailed filters locally, triggering fetch useEffect
  };

  // Function to render the list of property cards or status messages
  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 py-10">Searching properties...</p>;
    }
    if (error) {
      return <p className="text-center text-red-600 font-semibold py-10">{error}</p>;
    }
    if (!Array.isArray(properties) || properties.length === 0) { // Added check for array
      return <p className="text-center text-gray-600 dark:text-gray-400 py-10">No properties found matching your criteria.</p>;
    }
    // Render property cards in a responsive grid
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {properties.map((prop) => (
          // Ensure property data exists before rendering card
          prop && prop.id ? <PropertyCard key={prop.id} property={prop} /> : null
        ))}
      </div>
    );
  };

  // Function to close the Add Property modal
  const closeAddForm = () => {
    setIsAddFormVisible(false);
  };

  // --- JSX Structure for the HomePage ---
  return (
    <div>
      {/* Conditionally render Carousel (hide if searching/filtering) */}
      {!isSearching && <HeroCarousel />}

      {/* Conditionally render Seller Button Section (hide if searching/filtering) */}
      {!isSearching && (
        <div className="my-6 text-center md:text-left bg-black p-6">
          <button
            onClick={() => setIsAddFormVisible(true)} // Open Add Property modal
            className="inline-block bg-black text-white border border-white hover:bg-gray-800 hover:border-gray-300 px-6 py-3 rounded-md font-medium shadow-md transition duration-300"
          >
            Sell or Rent Your Property
          </button>
        </div>
      )}

      {/* Main Content Container with responsive padding */}
      <div className="container mx-auto py-4 px-4 md:px-16">

        {/* Filter Toggle Button Section */}
        <div className="mb-4 text-right">
             {/* Section Title */}
             <h2 className="text-center font-bold text-2xl md:text-4xl text-gray-400 mb-6">
               Find Your Dream Property
             </h2>
             {/* Divider Line */}
             <div className="h-px bg-gray-400 w-full"></div>
             <br />
             {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)} // Toggle detailed filter form
            className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center" // Adjusted hover
          >
            {/* Filter Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            {isFilterOpen ? 'Close Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Conditionally Render Detailed Filter Form */}
        {isFilterOpen && (
          <PropertyFilter onFilterChange={handleFilterChange} />
        )}

        {/* Property Listing Section */}
        <div className="mt-8">
          {/* Dynamic Heading based on search/filter state */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {/* Show category name if filtering ONLY by propertyType */}
            {filters.propertyType && Object.keys(filters).length === 1 ? `${filters.propertyType} Properties` : (isSearching ? 'Search Results' : 'Properties Found')}
          </h2>
          {/* Render the property cards or status messages */}
          {renderContent()}
        </div>
      </div>

      {/* Add Property Form Modal (conditionally rendered) */}
      {isAddFormVisible && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
           {/* Modal Container with scroll */}
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             {/* Pass the close function */}
             <AddPropertyForm onFormClose={closeAddForm} />
           </div>
         </div>
       )}
    </div>
  );
};

export default HomePage;