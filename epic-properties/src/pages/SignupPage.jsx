import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Import db
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions

// Google Icon component (using orange color for consistency, though Google uses multicolor)
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    {/* Using a generic orange color for the icon to match theme */}
    <path fill="currentColor" className="text-orange-500" d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.1 16.25 5.1 12.04C5.1 7.83 8.36 4.81 12.19 4.81C14.03 4.81 15.6 5.37 16.85 6.57L19.31 4.11C17.43 2.39 15 1.48 12.19 1.48C6.96 1.48 3 5.96 3 12.04C3 18.12 6.96 22.6 12.19 22.6C17.62 22.6 21.7 18.49 21.7 12.29C21.7 11.79 21.52 11.44 21.35 11.1Z"/>
  </svg>
);

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [user, loading, navigate]);

  // --- Function to create user document in Firestore ---
  const createUserDocument = async (userAuth, additionalData = {}) => {
    if (!userAuth) return;
    const userDocRef = doc(db, 'users', userAuth.uid); // Path: /users/{userId}

    // Check if the document already exists before creating
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) { // Only create if it doesn't exist
      const { email, displayName } = userAuth;
      const createdAt = serverTimestamp(); // Use server timestamp for consistency
      try {
        await setDoc(userDocRef, {
          displayName: displayName || email?.split('@')[0] || 'User', // Use Google name, or part of email, or default
          email,
          createdAt,
          favorites: [], // Initialize favorites as an empty array
          ...additionalData,
          // Add any other default user fields here if needed
        });
        console.log("User document created in Firestore for:", userAuth.uid);
      } catch (error) {
        console.error("Error creating user document:", error);
        // Optionally set an error state here if needed
      }
    } else {
        console.log("User document already exists for:", userAuth.uid);
        // Optionally update existing doc here if needed (e.g., last login time)
    }
  };
  // ---------------------------------------------------


  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // Optional: Update profile display name if you add a name input field
      // await updateProfile(user, { displayName: nameStateVariable });
      await createUserDocument(user); // << CREATE FIRESTORE DOC HERE
      navigate('/');
    } catch (err) {
      console.error("Email Signup Error:", err); // Log the specific error
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Try signing in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(`Failed to create account: ${err.message}`); // Show more specific error
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      await createUserDocument(user); // << CREATE FIRESTORE DOC HERE (if needed)
      navigate('/');
    } catch (err) {
      console.error("Google Signup/Login Error:", err); // Log the specific error
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(`Failed to sign up with Google: ${err.message}`); // Show more specific error
      }
    }
  };

  if (loading) return <p className="text-center p-10 text-orange-600">Loading...</p>; // Use theme color
  if (!loading && user) return null; // Don't render if redirecting

  // --- JSX Form (Keeping your orange theme) ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="bg-white border border-orange-200 p-8 rounded-2xl shadow-md w-full max-w-md transition-all duration-300">
        <h2 className="text-2xl font-bold text-center text-black mb-6">
          Create Account
        </h2>

        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Sign Up
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-orange-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or sign up with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center py-2 px-4 border border-orange-300 rounded-md bg-white text-sm font-medium text-black hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;