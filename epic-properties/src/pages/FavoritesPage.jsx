import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For login link
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, query, where, getDocs, documentId } from 'firebase/firestore';
import PropertyCard from '../components/PropertyCard'; // Reuse the card component

const FavoritesPage = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      // Don't fetch if auth is still loading or user is null
      if (loadingAuth || !user) {
        setFavoriteProperties([]); // Clear properties if logged out
        setLoadingFavorites(false);
        return;
      }

      setLoadingFavorites(true);
      setError(null);

      try {
        // 1. Get the list of favorite IDs from the user's document
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists() || !userDocSnap.data().favorites || userDocSnap.data().favorites.length === 0) {
          // User doc doesn't exist, or favorites array is empty/missing
          console.log("No favorite IDs found for user:", user.uid);
          setFavoriteProperties([]);
          setLoadingFavorites(false);
          return;
        }

        const favoriteIds = userDocSnap.data().favorites;
        console.log("Favorite IDs:", favoriteIds);

        // 2. Fetch the actual property documents using the IDs
        // Firestore 'in' query limitation: Max 30 IDs per query.
        // For more favorites, you'd need multiple queries or pagination.
        if (favoriteIds.length > 30) {
             console.warn("More than 30 favorites found, only fetching the first 30 due to Firestore limits.");
             // Consider implementing pagination if users might have many favorites.
        }
        const propertiesRef = collection(db, 'properties');
        // Use documentId() to query based on the document ID
        const q = query(propertiesRef, where(documentId(), 'in', favoriteIds.slice(0, 30)));

        const querySnapshot = await getDocs(q);
        const propertiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log("Fetched favorite properties:", propertiesData);
        setFavoriteProperties(propertiesData);

      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Could not load favorites. Please try again.");
      } finally {
        setLoadingFavorites(false);
      }
    };

    fetchFavorites();
    // Re-run when user logs in/out or auth finishes loading
  }, [user, loadingAuth]);

  // --- Render Logic ---
  const renderContent = () => {
    if (loadingAuth || loadingFavorites) {
      return <p className="text-center text-gray-500 py-10">Loading favorites...</p>;
    }

    if (!user) {
      return (
        <p className="text-center text-gray-600 py-10">
          Please <Link to="/login" className="text-blue-600 hover:underline">sign in</Link> to view your favorites.
        </p>
      );
    }

    if (error) {
      return <p className="text-center text-red-600 font-semibold py-10">{error}</p>;
    }

    if (favoriteProperties.length === 0) {
      return <p className="text-center text-gray-600 py-10">You haven't added any favorites yet.</p>;
    }

    // Display favorite properties using PropertyCard
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {favoriteProperties.map((prop) => (
          prop && prop.id ? <PropertyCard key={prop.id} property={prop} /> : null
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-16">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        My Favorites
      </h1>
      {renderContent()}
    </div>
  );
};

export default FavoritesPage;