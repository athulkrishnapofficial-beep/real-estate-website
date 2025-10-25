import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

// Simple Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 2a10 10 0 1 0 0 20c5.52 0 10-4.48 10-10h-8v3h5.65A6.97 6.97 0 0 1 12 19a7 7 0 1 1 0-14c1.73 0 3.3.63 4.54 1.68L19.4 4.8A9.95 9.95 0 0 0 12 2Z"
    />
  </svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && user) navigate('/');
  }, [user, loading, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    }
  };

  if (loading) return <p className="text-center p-10 text-black">Loading...</p>;
  if (!loading && user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-black mb-6">
          Sign In
        </h2>

        {error && <p className="text-red-600 text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 outline-none"
              required
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-orange-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-all font-semibold"
          >
            Sign In
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-semibold text-black hover:bg-gray-50 transition-all"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-sm text-black">
          Don’t have an account?{' '}
          <Link to="/signup" className="font-semibold text-orange-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
