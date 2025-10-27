import React, { useState, useEffect, useCallback } from 'react';
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
  XMarkIcon,
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
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
  const [mlPredictions, setMlPredictions] = useState([]);
  const [bestTime, setBestTime] = useState(null);
  const [loadingML, setLoadingML] = useState(true);
  const [selectedDatePrediction, setSelectedDatePrediction] = useState(null);

  const fetchMLData = useCallback(async () => {
    if (!temple) return;
    setLoadingML(true);
    try {
      const [forecastRes, bestTimeRes] = await Promise.all([
        axios.post('http://localhost:5001/api/ml/predict', {
          temple_id: temple.id,
          days_ahead: 14
        }, { timeout: 5000 }),
        axios.get(`http://localhost:5001/api/ml/best-time/${temple.id}`, { timeout: 5000 })
      ]);
      setMlPredictions(forecastRes.data.predictions);
      setBestTime(bestTimeRes.data);
    } catch (error) {
      console.error('Error fetching ML data:', error);
      // Silently fail
    } finally {
      setLoadingML(false);
    }
  }, [temple]);

  useEffect(() => {
    if (temple) {
      // Disabled ML to prevent infinite loop
      // fetchMLData();
      setLoadingML(false);
    }
  }, [temple]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (formData.date && mlPredictions.length > 0) {
      const prediction = mlPredictions.find(p => p.date === formData.date);
      setSelectedDatePrediction(prediction);
    } else {
      setSelectedDatePrediction(null);
    }
  }, [formData.date, mlPredictions]);

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

      {/* AI Recommendations */}
      {!loadingML && bestTime && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-300">
          <div className="flex items-start space-x-3">
            <div className="bg-green-500 rounded-full p-2 mt-1">
              <LightBulbIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <SparklesIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-bold text-green-900">AI-Powered Smart Recommendation</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                <p className="text-sm text-gray-700 mb-3">
                  Based on historical data and crowd patterns, we recommend:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    <strong className="text-green-700">Best Day:</strong>{' '}
                    <span className="font-bold text-green-900">{bestTime.best_day}</span>
                  </p>
                  <p className="text-gray-900">
                    <strong className="text-green-700">Best Time:</strong>{' '}
                    <span className="font-bold text-green-900">{bestTime.best_time_slot}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Expected visitors: <strong>{bestTime.expected_visitors.toLocaleString()}</strong>
                  </p>
                  <p className="text-sm text-green-700 mt-3 italic">
                    💡 {bestTime.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Prediction Alert */}
      {selectedDatePrediction && (
        <div className={`rounded-xl shadow-lg p-5 border-2 ${
          selectedDatePrediction.crowd_level === 'LOW' 
            ? 'bg-green-50 border-green-300' 
            : selectedDatePrediction.crowd_level === 'MODERATE'
            ? 'bg-yellow-50 border-yellow-300'
            : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-start space-x-3">
            {selectedDatePrediction.crowd_level === 'HIGH' ? (
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1" />
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1" />
            )}
            <div className="flex-1">
              <h4 className={`font-bold text-lg mb-2 ${
                selectedDatePrediction.crowd_level === 'LOW' ? 'text-green-900' :
                selectedDatePrediction.crowd_level === 'MODERATE' ? 'text-yellow-900' : 'text-red-900'
              }`}>
                Crowd Prediction for Selected Date
              </h4>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Date:</strong> {new Date(selectedDatePrediction.date).toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
                <p className="text-gray-700">
                  <strong>Expected Visitors:</strong>{' '}
                  <span className="font-bold">{selectedDatePrediction.predicted_visitors.toLocaleString()}</span>
                </p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedDatePrediction.crowd_level === 'LOW' ? 'bg-green-200 text-green-900' :
                  selectedDatePrediction.crowd_level === 'MODERATE' ? 'bg-yellow-200 text-yellow-900' : 
                  'bg-red-200 text-red-900'
                }`}>
                  {selectedDatePrediction.crowd_level} CROWD
                </div>
                {selectedDatePrediction.is_festival && (
                  <div className="mt-3 bg-orange-100 border border-orange-300 rounded-lg p-3">
                    <p className="text-orange-800 text-sm font-semibold flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      🎉 Festival Day - Expect significantly higher crowd than usual
                    </p>
                  </div>
                )}
                {selectedDatePrediction.crowd_level === 'HIGH' && (
                  <p className="text-red-700 text-sm mt-3">
                    ⚠️ Consider choosing a different date with lower crowd levels for a better experience.
                  </p>
                )}
                {selectedDatePrediction.crowd_level === 'LOW' && (
                  <p className="text-green-700 text-sm mt-3">
                    ✅ Great choice! This date typically has lower crowd levels.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

