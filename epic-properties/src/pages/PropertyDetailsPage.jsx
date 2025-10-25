import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase"; // Import auth and db
// Import arrayUnion AND arrayRemove AND onSnapshot
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth'; // Import useAuthState

// --- Icons ---
const BedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-orange-600">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);
const BathIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-orange-600">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const AreaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-orange-600">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
  </svg>
);
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 text-orange-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const PhoneIcon = () => ( // Icon for Contact button
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);
const HeartIcon = ({ fill = 'none', className = "w-5 h-5 mr-2 text-orange-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill={fill} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);
// --- Helper ---
const formatDate = (timestamp) => { /* ... */ };
// --- CONSTANT FOR PHONE NUMBER ---
const CONTACT_PHONE_NUMBER = "+919999999999"; // Replace with your actual phone number

const PropertyDetailsPage = () => {
  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(true); // Renamed state
  const [error, setError] = useState(null);
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [user, authLoading] = useAuthState(auth); // Get current user and loading state
  const [favMessage, setFavMessage] = useState(''); // Message for favorite action
  const [isFavorited, setIsFavorited] = useState(false); // State to track favorite status
  const [isUpdatingFav, setIsUpdatingFav] = useState(false); // State for button loading

  // Effect 1: Fetch Property Details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) { /* ... handle missing ID ... */ return; }
      setLoadingProperty(true); setError(null);
      try {
        const docRef = doc(db, "properties", propertyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
          // Increment view count in the background
          updateDoc(docRef, { viewCount: increment(1) }).catch(console.error);
        } else {
          setError("Property not found.");
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Failed to load property details.");
      } finally {
        setLoadingProperty(false);
      }
    };
    fetchPropertyDetails();
  }, [propertyId]);

  // Effect 2: Check Favorite Status (runs when user or propertyId changes)
  useEffect(() => {
    // Only run if we have a user and a property ID
    if (user && propertyId) {
      console.log(`Setting up favorite listener for user ${user.uid} and property ${propertyId}`);
      setIsFavorited(false); // Assume not favorited initially while checking
      const userDocRef = doc(db, 'users', user.uid);

      // Use onSnapshot for real-time updates of favorite status
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Check if the favorites array exists and includes the current property ID
          const currentlyFavorited = userData.favorites && userData.favorites.includes(propertyId);
          console.log(`User favorites data received. Is current property (${propertyId}) favorited?`, currentlyFavorited);
          setIsFavorited(currentlyFavorited); // Update state based on snapshot
        } else {
          // User document doesn't exist yet, so definitely not favorited
          setIsFavorited(false);
          console.warn("User document not found for favorite check.");
        }
      }, (err) => {
        console.error("Error listening to user favorites:", err);
        // Handle listener error (e.g., permissions) - maybe clear favorite state
        setIsFavorited(false);
      });

      // Cleanup listener when component unmounts or dependencies change
      return () => {
        console.log("Cleaning up favorite listener.");
        unsubscribe();
      };
    } else {
      // If no user, reset favorite status
      console.log("No user logged in, resetting favorite status.");
      setIsFavorited(false);
    }
  }, [user, propertyId]); // Re-run if user logs in/out or property changes


  // --- Function to TOGGLE Add/Remove Favorites ---
  const handleToggleFavorite = async () => {
    setFavMessage('');
    if (authLoading || isUpdatingFav || !propertyId) return; // Prevent multiple clicks or if ID missing

    if (!user) {
      setFavMessage('Please sign in to manage favorites.');
      // navigate('/login'); // Optional redirect
      return;
    }

    setIsUpdatingFav(true); // Indicate loading
    const userDocRef = doc(db, 'users', user.uid);

    try {
      if (isFavorited) {
        // --- Remove from Favorites ---
        console.log(`Removing property ${propertyId} from favorites for user ${user.uid}`);
        await updateDoc(userDocRef, {
          favorites: arrayRemove(propertyId) // Use arrayRemove
        });
        setFavMessage('Removed from favorites.');
        // isFavorited state will update automatically via onSnapshot listener
      } else {
        // --- Add to Favorites ---
        console.log(`Adding property ${propertyId} to favorites for user ${user.uid}`);
        // Try updateDoc first (assumes doc exists)
        try {
            await updateDoc(userDocRef, {
               favorites: arrayUnion(propertyId) // Use arrayUnion
            });
            setFavMessage('Added to favorites!');
        } catch (updateError) {
             // If update fails because doc doesn't exist, create it using setDoc merge
             if (updateError.code === 'not-found' || updateError.message.includes('No document to update')) {
                 console.log("User document not found, creating with favorite...");
                 // Ensure user document creation logic matches SignupPage
                 const userDataForCreate = {
                     // Include essential fields if known, or just favorites
                     displayName: user.displayName || user.email?.split('@')[0] || 'User',
                     email: user.email,
                     createdAt: serverTimestamp(), // Add creation timestamp
                     favorites: [propertyId] // Create with the new favorite
                 };
                 await setDoc(userDocRef, userDataForCreate, { merge: false }); // Use merge:false to ensure creation
                 setFavMessage('Added to favorites!');
             } else {
                 throw updateError; // Re-throw other unexpected update errors
             }
        }
        // isFavorited state will update automatically via onSnapshot listener
      }
    } catch (err) {
      console.error("Error updating favorites:", err);
      setFavMessage('Error updating favorites. Please try again.');
    } finally {
      setIsUpdatingFav(false); // Stop loading indicator
    }
  };


  // --- Render checks ---
  if (loadingProperty || authLoading)
    return <div className="text-center p-10 text-orange-600">Loading...</div>;
  if (error)
    return <div className="text-center p-10 text-red-600">{error}</div>;
  if (!property)
    return <div className="text-center p-10">Property data unavailable.</div>;

  // --- Render Page ---
  return (
    <div className="bg-white text-black">
      {/* Image Section */}
      <div className="w-full aspect-[16/9] overflow-hidden bg-gray-200">
        <img
          src={property.imageUrl || "https://placehold.co/1200x675/FDE68A/AAAAAA?text=No+Image"}
          alt={property.title || "Property"}
          className="w-full h-full object-cover"
        />
      </div>
      <br />

      {/* Details Section */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Title & Location */}
        <h1 className="text-3xl font-bold text-black mb-2">{property.title || "Property Details"}</h1>
        <div className="flex items-center text-gray-700 mb-4"> <LocationIcon /> <span>{property.location || "N/A"}</span> </div>

        {/* Description */}
        <h2 className="text-xl font-semibold text-orange-600 mb-2">Description</h2>
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{property.description || "N/A"}</p>

        {/* Price */}
        <div className="border border-orange-300 rounded-lg p-4 mb-6">
           <span className="text-4xl font-bold text-orange-600">₹{(property.price || 0).toLocaleString('en-IN')}</span>
           {property.isNegotiable && <span className="block text-sm text-gray-600 mt-1">(Negotiable)</span>}
        </div>

        {/* Other Info Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
            {/* Quick Info Box */}
            <div className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-orange-600 mb-2 border-b pb-1">Quick Info</h3>
                <p><strong>Type:</strong> {property.propertyType || "N/A"}</p>
                <p><strong>Status:</strong> For {property.listingType || "N/A"}</p>
                <p><strong>Posted:</strong> {formatDate(property.createdAt)}</p>
                <p><strong>Views:</strong> {property.viewCount !== undefined ? property.viewCount + 1 : 1}</p>
            </div>
            {/* Features Box */}
            <div className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition">
                 <h3 className="text-lg font-semibold text-orange-600 mb-2 border-b pb-1">Features</h3>
                 {property.bedrooms ? <p className="flex items-center"><BedIcon /> {property.bedrooms} Bedrooms</p> : null}
                 {property.bathrooms ? <p className="flex items-center"><BathIcon /> {property.bathrooms} Bathrooms</p> : null}
                 {property.area ? <p className="flex items-center"><AreaIcon /> {property.area} {property.areaUnit || "sqft"}</p> : null}
                 {!property.bedrooms && !property.bathrooms && !property.area && <p className="text-sm text-gray-500">N/A</p>}
            </div>
             {/* Amenities Box */}
             <div className="border border-orange-200 rounded-lg p-4 hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-orange-600 mb-2 border-b pb-1">Amenities</h3>
                {property.amenities && property.amenities.length > 0 ? (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {property.amenities.map((a, i) => (a && <li key={i}>{a}</li>))}
                  </ul>
                ) : ( <p className="text-sm text-gray-500">No amenities listed.</p> )}
             </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 pt-6 border-t border-orange-200">
          {/* Favorites Button (Toggles Add/Remove) */}
          <button
            onClick={handleToggleFavorite}
            disabled={authLoading || isUpdatingFav} // Disable while loading or updating
            // Keep your existing orange theme styles, but toggle based on isFavorited
            className={`w-60 h-12 inline-flex items-center justify-center rounded-full text-base font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 ${
                !user ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' // Logged out
                : isFavorited
                    ? 'bg-orange-100 text-orange-700 border-orange-400 hover:bg-orange-200' // Is Favorited
                    : 'bg-white text-black border-orange-300 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600' // Not Favorited
            }`}
          >
            {/* Pass fill based on isFavorited */}
            <HeartIcon
                fill={isFavorited ? 'currentColor' : 'none'}
                className={`w-5 h-5 mr-2 ${isFavorited ? 'text-orange-600' : 'text-orange-500'}`}
             />
            {isUpdatingFav ? 'Updating...'
             : isFavorited ? 'Remove Favorite'
             : user ? 'Add to Favorites'
             : 'Sign in to Favorite'}
          </button>

          {/* Contact Us Button (Keeping your orange theme style) */}
          <a
            href={`tel:${CONTACT_PHONE_NUMBER}`}
            className="w-60 h-12 inline-flex items-center justify-center rounded-full text-base font-medium border border-orange-300 text-black bg-white hover:bg-orange-50 hover:border-orange-400 hover:text-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <PhoneIcon className="w-5 h-5 mr-2 text-orange-500" />
            Contact Us
          </a>
        </div>
        {/* Favorite Status Message */}
        {favMessage && <p className={`text-center text-sm mt-3 ${favMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{favMessage}</p>}

      </div> {/* End Details Section */}
      <br /><br /><br />
    </div>
  );
};

export default PropertyDetailsPage;