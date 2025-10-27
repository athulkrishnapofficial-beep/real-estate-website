import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const AddPropertyForm = ({ onFormClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isNegotiable: false,
    listingType: 'Sell',
    propertyType: 'House',
    location: '',
    area: '',
    areaUnit: 'sqft',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return setMessage('Error: Please select a property image.');
    setLoading(true);
    setMessage('');
    setUploadProgress(0);

    try {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const storageRef = ref(storage, `propertyImages/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      const imageUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
          (error) => reject(new Error(error.code)),
          async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
        );
      });

      const keywords = [
        ...new Set(
          [
            ...formData.title.toLowerCase().split(' '),
            ...formData.location.toLowerCase().split(/[\s,]+/),
            formData.propertyType.toLowerCase(),
            formData.listingType.toLowerCase(),
          ].filter((k) => k.length > 1)
        ),
      ];

      const docData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area) || 0,
        amenities: formData.amenities
          .split(',')
          .map((i) => i.trim())
          .filter((i) => i),
        imageUrl,
        createdAt: serverTimestamp(),
        viewCount: 0,
        status: 'Available',
        searchKeywords: keywords,
      };

      await addDoc(collection(db, 'properties'), docData);

      setMessage('Property listed successfully!');
      setFormData({
        title: '',
        description: '',
        price: '',
        isNegotiable: false,
        listingType: 'Sell',
        propertyType: 'House',
        location: '',
        area: '',
        areaUnit: 'sqft',
        bedrooms: '',
        bathrooms: '',
        amenities: '',
      });
      setImageFile(null);
      setTimeout(() => onFormClose && onFormClose(), 1500);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-orange-200">
        <h2 className="text-xl font-semibold text-black">Add New Property</h2>
        <button
          onClick={onFormClose}
          className="text-orange-500 hover:text-orange-600 transition"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          ></textarea>
        </div>

        {/* Price & Negotiable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
          <div className="md:col-span-2 flex items-center pt-5">
            <input
              id="isNegotiable"
              type="checkbox"
              name="isNegotiable"
              checked={formData.isNegotiable}
              onChange={handleChange}
              className="h-4 w-4 text-orange-600 border-orange-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="isNegotiable" className="ml-2 text-sm text-gray-700">
              Price Negotiable
            </label>
          </div>
        </div>

        {/* Listing & Property Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Listing Type</label>
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option>Sell</option>
              <option>Rent</option>
              <option>Lease</option>
              <option>Buy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Property Type</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option>House</option>
              <option>Apartment</option>
              <option>Boutique House</option>
              <option>Land</option>
              <option>Office</option>
              <option>Restaurant</option>
              <option>Retail</option>
              <option>Studio Apartment</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Kawdiar, Trivandrum"
            className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Area</label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Area Unit</label>
            <select
              name="areaUnit"
              value={formData.areaUnit}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option>sqft</option>
              <option>cents</option>
              <option>acres</option>
            </select>
          </div>
        </div>

        {/* Bedrooms / Bathrooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium">Amenities</label>
          <input
            name="amenities"
            value={formData.amenities}
            onChange={handleChange}
            placeholder="e.g., Parking, Furnished, Pet-Friendly"
            className="mt-1 w-full p-2 border border-orange-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium">Property Image</label>
          <input
            type="file"
            name="propertyImage"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-orange-300 file:bg-white file:text-orange-600 hover:file:bg-orange-50 transition"
          />
          {imageFile && (
            <p className="text-xs text-orange-600 mt-1">{imageFile.name} selected</p>
          )}
        </div>

        {/* Upload Progress */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-orange-100 rounded-full h-2 mt-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-orange-200">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading
              ? `Uploading (${Math.round(uploadProgress)}%)...`
              : 'Submit Property'}
          </button>
          <button
            type="button"
            onClick={onFormClose}
            disabled={loading}
            className="text-orange-600 border border-orange-300 px-5 py-2 rounded-full hover:bg-orange-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-center text-sm mt-4 p-2 rounded ${
              message.startsWith('Error')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddPropertyForm;
