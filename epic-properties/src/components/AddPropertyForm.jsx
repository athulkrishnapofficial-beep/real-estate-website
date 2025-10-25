import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const UPLOAD_URL = 'http://localhost:3001/upload';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage('Error: Please select a property image.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      // Image Upload
      const imageFormData = new FormData();
      imageFormData.append('propertyImage', imageFile);
      const uploadResponse = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: imageFormData,
      });
      if (!uploadResponse.ok) throw new Error('Image upload failed.');
      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;

      // Firestore Save
      const docData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area) || 0,
        amenities: formData.amenities
          .split(',')
          .map(a => a.trim())
          .filter(a => a),
        imageUrl,
        createdAt: serverTimestamp(),
        viewCount: 0,
        status: 'Available',
      };

      await addDoc(collection(db, 'properties'), docData);
      setLoading(false);
      setMessage('✅ Property listed successfully!');
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
    } catch (err) {
      console.error(err);
      setLoading(false);
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-orange-200 text-black max-h-[inherit] overflow-y-auto transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-orange-300">
        <h2 className="text-2xl font-semibold text-orange-600">Add New Property</h2>
        <button
          onClick={onFormClose}
          className="text-orange-500 hover:text-orange-600 transition-all duration-200"
          title="Close form"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input */}
        {[
          { id: 'title', label: 'Title', type: 'text', required: true },
          { id: 'description', label: 'Description', type: 'textarea' },
          { id: 'location', label: 'Location', type: 'text', required: true },
          { id: 'amenities', label: 'Amenities (comma-separated)', type: 'text' },
        ].map((field) => (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.id}
                name={field.id}
                value={formData[field.id]}
                onChange={handleChange}
                className="w-full p-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                rows="3"
              />
            ) : (
              <input
                id={field.id}
                type={field.type}
                name={field.id}
                value={formData[field.id]}
                onChange={handleChange}
                required={field.required || false}
                className="w-full p-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
              />
            )}
          </div>
        ))}

        {/* Price + Negotiable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            />
          </div>
          <div className="flex items-center pt-5 text-gray-700">
            <input
              id="isNegotiable"
              type="checkbox"
              name="isNegotiable"
              checked={formData.isNegotiable}
              onChange={handleChange}
              className="h-4 w-4 mr-2 text-orange-600 border-orange-300 focus:ring-orange-500"
            />
            <label htmlFor="isNegotiable">Is Price Negotiable?</label>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className="w-full p-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            >
              <option>Sell</option>
              <option>Rent</option>
              <option>Lease</option>
              <option>Buy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full p-2 border border-orange-200 rounded-md focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            >
              <option>Appartment</option>
              <option>Boutique</option>
              <option>House</option>
              <option>Land</option>
              <option>Office</option>
              <option>Restaurant</option>
              <option>Retail</option>
              <option>Studio</option>

            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Image</label>
          <input
            id="propertyImage"
            type="file"
            name="propertyImage"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 border border-orange-200 rounded-md cursor-pointer file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-all duration-200"
          />
          {imageFile && (
            <p className="text-xs text-orange-600 mt-1">{imageFile.name} selected</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-orange-300 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Submitting...' : 'Submit Property'}
          </button>
          <button
            type="button"
            onClick={onFormClose}
            className="text-orange-600 hover:text-orange-700 transition-all duration-200"
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-center p-2 rounded text-sm mt-4 ${
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
