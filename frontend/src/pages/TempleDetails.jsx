import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  TruckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import templesData from '../data/temples.json';

const TempleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const temple = templesData.find(t => t.id === id);

  if (!temple) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Temple not found</h2>
        <Link to="/temples" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Temples
        </Link>
      </div>
    );
  }

  const getCrowdBadgeColor = (status) => {
    switch (status) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="relative h-96">
          <img
            src={temple.image}
            alt={temple.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{temple.name}</h1>
                <div className="flex items-center text-white/90 text-lg">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{temple.location}</span>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getCrowdBadgeColor(temple.crowdStatus)}`}>
                {temple.crowdStatus.toUpperCase()} CROWD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed">{temple.description}</p>
          </div>

          {/* Timings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Temple Timings</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Opening Hours</p>
                  <p className="text-gray-600">{temple.openingHours}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CalendarDaysIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Darshan Timings</p>
                  <ul className="text-gray-600 space-y-1">
                    {temple.darshanTimings.map((timing, index) => (
                      <li key={index}>• {timing}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {temple.facilities.map((facility, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm">{facility}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
            <div className="h-64 rounded-lg overflow-hidden">
              <MapContainer
                center={[temple.coordinates.lat, temple.coordinates.lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[temple.coordinates.lat, temple.coordinates.lng]}>
                  <Popup>{temple.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Current Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Occupancy</span>
                  <span className="text-sm font-bold text-gray-900">{temple.currentOccupancy}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      temple.currentOccupancy < 50 ? 'bg-green-500' :
                      temple.currentOccupancy < 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${temple.currentOccupancy}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Visitors</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.floor(temple.maxCapacity * temple.currentOccupancy / 100)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Max Capacity</span>
                  <span className="text-sm font-semibold text-gray-900">{temple.maxCapacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Wait Time</span>
                  <span className="text-sm font-semibold text-gray-900">{temple.estimatedWaitTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Entry Fee */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Entry Fee</h2>
            <div className="flex items-center space-x-2">
              <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
              <span className="text-lg font-semibold text-gray-900">{temple.entryFee}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-md p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Plan Your Visit</h2>
            <div className="space-y-3">
              <Link
                to={`/book-darshan/${temple.id}`}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <CalendarDaysIcon className="h-5 w-5" />
                <span>Book Darshan</span>
              </Link>
              
              {temple.parkingAvailable && (
                <Link
                  to="/parking"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  <TruckIcon className="h-5 w-5" />
                  <span>Book Parking</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempleDetails;

