import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XMarkIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import parkingZonesData from '../data/parking-zones.json';

const BookParking = () => {
  const { zoneId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const zone = parkingZonesData.find(z => z.id === zoneId);

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    duration: 2,
    vehicleType: '',
    vehicleNumber: '',
    vehicleModel: ''
  });
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (!zone) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Parking zone not found</h2>
        <button onClick={() => navigate('/parking')} className="text-primary-600 hover:text-primary-700 mt-4">
          Back to Parking
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const calculateTotalPrice = () => {
    return zone.pricePerHour * formData.duration;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.startTime || !formData.vehicleType || !formData.vehicleNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error('Please select a future date');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        userId: user.id,
        zoneId: zone.id,
        zoneName: zone.name,
        templeName: zone.templeName,
        date: formData.date,
        startTime: formData.startTime,
        duration: formData.duration,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        vehicleModel: formData.vehicleModel,
        totalPrice: calculateTotalPrice(),
        userName: user.name,
        userPhone: user.phone
      };

      const response = await axios.post('http://localhost:3002/api/parking-bookings', bookingData);
      setBooking(response.data);
      setShowModal(true);
      toast.success('Parking booked successfully!');
      
      // Reset form
      setFormData({
        date: '',
        startTime: '',
        duration: 2,
        vehicleType: '',
        vehicleNumber: '',
        vehicleModel: ''
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book parking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('parking-qr-code');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `parking-booking-${booking.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Book Parking Spot</h1>
            <p className="text-lg text-gray-700 font-medium">{zone.name}</p>
            <p className="text-sm text-gray-600">{zone.templeName} - {zone.distance}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Price per hour</p>
            <div className="flex items-center text-2xl font-bold text-green-600">
              <CurrencyRupeeIcon className="h-6 w-6" />
              <span>{zone.pricePerHour}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
                Parking Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="h-5 w-5 inline mr-2" />
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              max="24"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TruckIcon className="h-5 w-5 inline mr-2" />
              Vehicle Type
            </label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select vehicle type</option>
              {zone.vehicleTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="e.g., GJ01AB1234"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
              />
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Model (Optional)
              </label>
              <input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                placeholder="e.g., Honda City"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Total Price Display */}
          {formData.duration > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Price</p>
                  <p className="text-xs text-gray-500">{formData.duration} hour(s) × ₹{zone.pricePerHour}/hour</p>
                </div>
                <div className="flex items-center text-3xl font-bold text-purple-600">
                  <CurrencyRupeeIcon className="h-8 w-8" />
                  <span>{calculateTotalPrice()}</span>
                </div>
              </div>
            </div>
          )}

          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Phone:</span> {user.phone}</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {loading ? 'Processing...' : `Confirm Booking - ₹${calculateTotalPrice()}`}
          </button>
        </form>
      </div>

      {/* Booking Confirmation Modal */}
      {showModal && booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
                navigate('/my-bookings');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <CheckCircleIcon className="h-12 w-12 text-purple-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Parking Booked!
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Your parking spot has been successfully reserved
            </p>

            {/* QR Code */}
            <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-lg">
              <QRCodeSVG
                id="parking-qr-code"
                value={JSON.stringify({
                  bookingId: booking.id,
                  zone: booking.zoneName,
                  date: booking.date,
                  time: booking.startTime,
                  duration: booking.duration,
                  vehicle: booking.vehicleNumber,
                  user: booking.userName
                })}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                <p><span className="font-medium">Zone:</span> {booking.zoneName}</p>
                <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {booking.startTime}</p>
                <p><span className="font-medium">Duration:</span> {booking.duration} hour(s)</p>
                <p><span className="font-medium">Vehicle:</span> {booking.vehicleNumber}</p>
                <p><span className="font-medium">Total:</span> ₹{booking.totalPrice}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={downloadQR}
                className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Download QR Code
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  navigate('/my-bookings');
                }}
                className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                View My Bookings
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-4">
              Show this QR code at the parking entrance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookParking;

