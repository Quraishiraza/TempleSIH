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
  UsersIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import templesData from '../data/temples.json';

const BookDarshan = () => {
  const { templeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const temple = templesData.find(t => t.id === templeId);

  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    numberOfPeople: 1
  });
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (!temple) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Temple not found</h2>
        <button onClick={() => navigate('/temples')} className="text-primary-600 hover:text-primary-700 mt-4">
          Back to Temples
        </button>
      </div>
    );
  }

  const timeSlots = [
    '6:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
    '8:00 PM - 9:00 PM'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfPeople' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.timeSlot) {
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
        templeId: temple.id,
        templeName: temple.name,
        date: formData.date,
        timeSlot: formData.timeSlot,
        numberOfPeople: formData.numberOfPeople,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone
      };

      const response = await axios.post('http://localhost:3002/api/bookings', bookingData);
      setBooking(response.data);
      setShowModal(true);
      toast.success('Darshan booked successfully!');
      
      // Reset form
      setFormData({
        date: '',
        timeSlot: '',
        numberOfPeople: 1
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book darshan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `darshan-booking-${booking.id}.png`;
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
        <div className="flex items-start space-x-4">
          <img
            src={temple.image}
            alt={temple.name}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Book Darshan</h1>
            <p className="text-lg text-gray-700 font-medium">{temple.name}</p>
            <p className="text-sm text-gray-600">{temple.location}</p>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
              Select Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="h-5 w-5 inline mr-2" />
              Select Time Slot
            </label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Choose a time slot</option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Number of People */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UsersIcon className="h-5 w-5 inline mr-2" />
              Number of People
            </label>
            <input
              type="number"
              name="numberOfPeople"
              value={formData.numberOfPeople}
              onChange={handleChange}
              min="1"
              max="10"
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">Maximum 10 people per booking</p>
          </div>

          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-gray-900 mb-2">Booking Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Phone:</span> {user.phone}</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
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
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Your darshan has been successfully booked
            </p>

            {/* QR Code */}
            <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-lg">
              <QRCodeSVG
                id="qr-code"
                value={JSON.stringify({
                  bookingId: booking.id,
                  temple: booking.templeName,
                  date: booking.date,
                  timeSlot: booking.timeSlot,
                  people: booking.numberOfPeople,
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
                <p><span className="font-medium">Temple:</span> {booking.templeName}</p>
                <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {booking.timeSlot}</p>
                <p><span className="font-medium">People:</span> {booking.numberOfPeople}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={downloadQR}
                className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
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
              Show this QR code at the temple entrance
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDarshan;

