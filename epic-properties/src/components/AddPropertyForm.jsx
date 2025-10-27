import React, { useState } from 'react';
import { db, storage } from '../firebase'; // Import db and storage from firebase config
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import Firestore functions
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions

// Accept onFormClose prop to close the modal
const AddPropertyForm = ({ onFormClose }) => {
  // State for all form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isNegotiable: false,
    listingType: 'Sell', // Default value
    propertyType: 'House', // Default value
    location: '',
    area: '',
    areaUnit: 'sqft', // Default value
    bedrooms: '',
    bathrooms: '',
    amenities: '', // Comma-separated string
  });
  const [imageFile, setImageFile] = useState(null); // State for the selected image file
  const [loading, setLoading] = useState(false); // State for loading indicator (upload/save)
  const [message, setMessage] = useState(''); // State for success/error messages
  const [uploadProgress, setUploadProgress] = useState(0); // Optional state for upload progress bar

  // Generic handler for text inputs, selects, checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handler for file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]); // Store the selected file object
    } else {
      setImageFile(null); // Clear if no file selected
    }
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default page reload
    if (!imageFile) {
      setMessage('Error: Please select a property image.');
      return;
    }
    setLoading(true); // Start loading indicator
    setMessage(''); // Clear previous messages
    setUploadProgress(0); // Reset progress

    try {
      // --- Step 1: Upload Image to Firebase Storage ---
      const fileName = `${Date.now()}-${imageFile.name}`; // Create a unique file name
      const storageRef = ref(storage, `propertyImages/${fileName}`); // Define the path in Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, imageFile); // Start the upload

      console.log("Uploading image to Firebase Storage:", storageRef.fullPath);

      // Use a Promise to wait for upload completion and get the download URL
      const imageUrl = await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Update progress state (optional)
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error("Firebase Storage Error:", error);
            reject(new Error(`Image upload failed: ${error.code}`)); // Reject the promise on error
          },
          async () => {
            // Handle successful uploads on complete
            console.log('File uploaded successfully to Firebase Storage.');
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref); // Get the public URL
              console.log('File available at', downloadURL);
              resolve(downloadURL); // Resolve the promise with the URL
            } catch (getUrlError) {
              console.error("Error getting download URL:", getUrlError);
              reject(new Error("Failed to get image URL after upload."));
            }
          }
        );
      });
      // --- End Image Upload ---

      console.log("Image URL obtained:", imageUrl);

      // --- Step 2: Create searchKeywords array ---
      const keywords = [];
      // Add lowercase words from title (filter out short words)
      if (formData.title) {
        keywords.push(...formData.title.toLowerCase().split(' ').filter(k => k.length > 1));
      }
      // Add lowercase words/parts from location (split by space or comma, trim, filter)
      if (formData.location) {
        const locationParts = formData.location.toLowerCase().split(/[\s,]+/).map(s => s.trim()).filter(s => s.length > 1);
        keywords.push(...locationParts);
        keywords.push(formData.location.toLowerCase()); // Add full location string as well
      }
      // Add lowercase property type
      if (formData.propertyType) {
        keywords.push(formData.propertyType.toLowerCase());
      }
       // Add lowercase listing type
      if (formData.listingType) {
        keywords.push(formData.listingType.toLowerCase());
      }
      // Filter out empty strings and ensure unique keywords using Set
      const searchKeywords = [...new Set(keywords.filter(k => k))];
      console.log("Generated search keywords:", searchKeywords);
      // -----------------------------------------------------------

      // Step 3: Prepare the data object for Firestore
      const docData = {
        ...formData, // Spread existing form data
        // Convert specific fields to numbers, provide defaults (0) if empty or invalid
        price: parseFloat(formData.price) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area) || 0,
        // Convert amenities string to an array, trim whitespace, filter empty strings
        amenities: formData.amenities.split(',').map(item => item.trim()).filter(item => item !== ''),
        imageUrl: imageUrl, // Add the image URL from Firebase Storage
        createdAt: serverTimestamp(), // Use Firestore's server timestamp for consistency
        viewCount: 0, // Initialize view count
        status: 'Available', // Default status
        searchKeywords: searchKeywords, // Add the generated search keywords array
      };

      // Step 4: Add the document to the 'properties' collection in Firestore
      console.log("Attempting to add document to Firestore with data:", docData);
      const docRef = await addDoc(collection(db, 'properties'), docData); // Perform the save operation
      console.log("Document successfully written with ID:", docRef.id);

      // --- Success ---
      setMessage('Property listed successfully!'); // Show success message
      // Reset form fields to initial state
      setFormData({
        title: '', description: '', price: '', isNegotiable: false,
        listingType: 'Sell', propertyType: 'House', location: '',
        area: '', areaUnit: 'sqft', bedrooms: '', bathrooms: '', amenities: '',
      });
      setImageFile(null); // Clear the selected file state
      // Find the file input element and reset its value visually
      const fileInput = e.target.elements.namedItem('propertyImage');
      if (fileInput) {
        fileInput.value = null;
      }

      // Close the modal after a short delay (1.5 seconds)
      setTimeout(() => {
        if (onFormClose) onFormClose(); // Call the close function passed via props
      }, 1500);

    } catch (error) { // Catch any errors during upload or Firestore save
      console.error("Error submitting property:", error);
      setMessage(`Error: ${error.message}`); // Show specific error message to the user
    } finally {
        setLoading(false); // Stop loading indicator regardless of success or failure
    }
  };

  // --- JSX for the form ---
  return (
    // Form container with styling
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-h-[inherit] overflow-y-auto">
      {/* Form Header with Title and Close Button */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-600">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Add New Property
        </h2>
         <button onClick={onFormClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white" title="Close form">
            {/* Close Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input id="title" type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" required />
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" rows="3"></textarea>
        </div>

        {/* Price & Negotiable Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
            <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" required min="0"/>
          </div>
          <div className="md:col-span-2 flex items-center pt-5 text-gray-700 dark:text-gray-300">
            <input id="isNegotiable" type="checkbox" name="isNegotiable" checked={formData.isNegotiable} onChange={handleChange} className="h-4 w-4 rounded mr-2 focus:ring-blue-500 text-blue-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
            <label htmlFor="isNegotiable">Is Price Negotiable?</label>
          </div>
        </div>

        {/* Listing Type & Property Type Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Listing Type</label>
            <select id="listingType" name="listingType" value={formData.listingType} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
              <option value="Sell">Sell</option>
              <option value="Rent">Rent</option>
              <option value="Lease">Lease</option>
              <option value="Buy">Buy</option>
            </select>
          </div>
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Type</label>
            <select id="propertyType" name="propertyType" value={formData.propertyType} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
              <option value="House">House</option>
              <option value="Appartment">Appartment</option>
              <option value="Boutique Houses">Boutique Houses</option> {/* Ensure exact match with CategoryNav */}
              <option value="Land">Land</option>
              <option value="Office">Office</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Retail">Retail</option>
              <option value="Studio Appartments">Studio Appartments</option> {/* Ensure exact match */}
            </select>
          </div>
        </div>

        {/* Location Field */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <input id="location" type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Kawdiar, Trivandrum" required />
        </div>

        {/* Area & Area Unit Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area</label>
            <input id="area" type="number" name="area" value={formData.area} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" min="0" step="any"/>
          </div>
          <div>
            <label htmlFor="areaUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area Unit</label>
            <select id="areaUnit" name="areaUnit" value={formData.areaUnit} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
              <option value="sqft">sq. ft.</option>
              <option value="cents">Cents</option>
              <option value="acres">Acres</option>
            </select>
          </div>
        </div>

        {/* Bedrooms & Bathrooms Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
            <input id="bedrooms" type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" min="0"/>
          </div>
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</label>
            <input id="bathrooms" type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" min="0"/>
          </div>
        </div>

        {/* Amenities Field */}
        <div>
          <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amenities (comma-separated)</label>
          <input id="amenities" type="text" name="amenities" value={formData.amenities} onChange={handleChange} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Parking, Furnished, Pet-Friendly" />
        </div>

        {/* Image Upload Field */}
        <div>
          <label htmlFor="propertyImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Image</label>
          <input id="propertyImage" type="file" name="propertyImage" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-gray-600 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-gray-500 cursor-pointer" accept="image/*" required />
          {imageFile && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{imageFile.name} selected</p>}
        </div>

         {/* Optional: Upload Progress Bar */}
         {loading && uploadProgress > 0 && uploadProgress < 100 && (
             <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 my-2">
                 <div className="bg-blue-600 h-2.5 rounded-full transition-width duration-300" style={{ width: `${uploadProgress}%` }}></div>
             </div>
         )}


        {/* Submit & Cancel Buttons */}
        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-600 mt-6">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled={loading}>
            {loading ? `Uploading (${Math.round(uploadProgress)}%)...` : 'Submit Property'}
          </button>
          <button type="button" onClick={onFormClose} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white disabled:opacity-50" disabled={loading}>
            Cancel
          </button>
        </div>

        {/* Message Display Area */}
        {message && (
          <p className={`text-center p-2 rounded text-sm mt-4 ${message.startsWith('Error') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddPropertyForm;