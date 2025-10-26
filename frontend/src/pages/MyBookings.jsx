import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import {
  CalendarDaysIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import templesData from '../data/temples.json';

const MyBookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('darshan');
  const [bookings, setBookings] = useState([]);
  const [parkingBookings, setParkingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const [bookingsRes, parkingRes] = await Promise.all([
        axios.get(`http://localhost:3002/api/bookings?userId=${user.id}`),
        axios.get(`http://localhost:3002/api/parking-bookings/user/${user.id}`)
      ]);
      setBookings(bookingsRes.data);
      setParkingBookings(parkingRes.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, type) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      if (type === 'darshan') {
        await axios.patch(`http://localhost:3002/api/bookings/${bookingId}/cancel`);
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
      } else {
        await axios.patch(`http://localhost:3002/api/parking-bookings/${bookingId}/cancel`);
        setParkingBookings(parkingBookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
      }
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const showQR = (booking, type) => {
    setSelectedBooking({ ...booking, type });
    setShowQRModal(true);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('booking-qr-code');
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `booking-${selectedBooking.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <CheckCircleIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📋 My Bookings
        </h1>
        <p className="text-gray-600">
          View and manage all your temple and parking bookings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('darshan')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'darshan'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CalendarDaysIcon className="h-5 w-5" />
            <span>Darshan Bookings ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('parking')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'parking'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TruckIcon className="h-5 w-5" />
            <span>Parking Bookings ({parkingBookings.length})</span>
          </button>
        </div>
      </div>

      {/* Darshan Bookings */}
      {activeTab === 'darshan' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No darshan bookings yet</h3>
              <p className="text-gray-600 mb-6">Start planning your spiritual journey</p>
              <Link
                to="/temples"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <CalendarDaysIcon className="h-5 w-5" />
                <span>Book Darshan</span>
              </Link>
            </div>
          ) : (
            bookings.map((booking) => {
              const temple = templesData.find(t => t.id === booking.templeId);
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    {temple && (
                      <div className="md:w-48 h-48 md:h-auto">
                        <img
                          src={temple.image}
                          alt={booking.templeName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {booking.templeName}
                          </h3>
                          <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
                        </div>
                        <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadge(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status.toUpperCase()}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <CalendarDaysIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Time Slot</p>
                            <p className="font-medium">{booking.timeSlot}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <UsersIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">People</p>
                            <p className="font-medium">{booking.numberOfPeople}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => showQR(booking, 'darshan')}
                          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View QR</span>
                        </button>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id, 'darshan')}
                            className="flex items-center space-x-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Parking Bookings */}
      {activeTab === 'parking' && (
        <div className="space-y-4">
          {parkingBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🅿️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No parking bookings yet</h3>
              <p className="text-gray-600 mb-6">Reserve your parking spot in advance</p>
              <Link
                to="/parking"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <TruckIcon className="h-5 w-5" />
                <span>Book Parking</span>
              </Link>
            </div>
          ) : (
            parkingBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {booking.zoneName}
                    </h3>
                    <p className="text-sm text-gray-600">{booking.templeName}</p>
                    <p className="text-xs text-gray-500 mt-1">Booking ID: {booking.id}</p>
                  </div>
                  <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadge(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{booking.status.toUpperCase()}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarDaysIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">{new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium">{booking.startTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TruckIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p className="font-medium">{booking.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500">Duration & Price</p>
                      <p className="font-medium">{booking.duration}h - ₹{booking.totalPrice}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => showQR(booking, 'parking')}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>View QR</span>
                  </button>
                  {booking.status === 'active' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id, 'parking')}
                      className="flex items-center space-x-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Booking QR Code
            </h2>

            <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-lg">
              <QRCodeSVG
                id="booking-qr-code"
                value={JSON.stringify({
                  bookingId: selectedBooking.id,
                  type: selectedBooking.type,
                  ...selectedBooking
                })}
                size={250}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={downloadQR}
                className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Download QR Code
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

