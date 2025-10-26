import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import parkingZonesData from '../data/parking-zones.json';

const Parking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemple, setFilterTemple] = useState('all');
  const [parkingBookings, setParkingBookings] = useState([]);

  useEffect(() => {
    fetchParkingBookings();
  }, []);

  const fetchParkingBookings = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/parking-bookings');
      setParkingBookings(response.data);
    } catch (error) {
      console.error('Error fetching parking bookings:', error);
    }
  };

  // Calculate real-time availability
  const getAvailableSpots = (zone) => {
    const activeBookings = parkingBookings.filter(
      b => b.zoneId === zone.id && b.status === 'active'
    ).length;
    return Math.max(0, zone.availableSpots - activeBookings);
  };

  const filteredZones = parkingZonesData.filter(zone => {
    const matchesSearch = 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.templeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTemple === 'all' || zone.templeId === filterTemple;
    return matchesSearch && matchesFilter;
  });

  const uniqueTemples = [...new Set(parkingZonesData.map(z => z.templeName))];

  const getAvailabilityColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAvailabilityBg = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'bg-green-100 border-green-200';
    if (percentage > 20) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🅿️ Smart Parking System
        </h1>
        <p className="text-gray-600">
          Find and book parking spots near your destination temple
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search parking zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter by Temple */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterTemple}
              onChange={(e) => setFilterTemple(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Temples</option>
              {uniqueTemples.map((temple, index) => (
                <option key={index} value={parkingZonesData.find(z => z.templeName === temple)?.templeId}>
                  {temple}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Found {filteredZones.length} parking zone(s)
        </div>
      </div>

      {/* Parking Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredZones.map((zone) => {
          const availableSpots = getAvailableSpots(zone);
          const occupancyPercentage = ((zone.totalSpots - availableSpots) / zone.totalSpots) * 100;

          return (
            <div key={zone.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              {/* Zone Header */}
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                <h3 className="text-lg font-bold mb-1">{zone.name}</h3>
                <p className="text-sm text-purple-100">{zone.templeName}</p>
              </div>

              {/* Zone Details */}
              <div className="p-5 space-y-4">
                {/* Availability */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Availability</span>
                    <span className={`text-lg font-bold ${getAvailabilityColor(availableSpots, zone.totalSpots)}`}>
                      {availableSpots}/{zone.totalSpots}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        occupancyPercentage < 50 ? 'bg-green-500' :
                        occupancyPercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Price per hour</span>
                  <div className="flex items-center text-green-600 font-semibold">
                    <CurrencyRupeeIcon className="h-4 w-4" />
                    <span>{zone.pricePerHour}</span>
                  </div>
                </div>

                {/* Distance */}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{zone.distance}</span>
                </div>

                {/* Vehicle Types */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Vehicle Types</p>
                  <div className="flex flex-wrap gap-1">
                    {zone.vehicleTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Features</p>
                  <div className="space-y-1">
                    {zone.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                {availableSpots > 0 ? (
                  <Link
                    to={`/book-parking/${zone.id}`}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <TruckIcon className="h-5 w-5" />
                    <span>Book Now</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                  >
                    Fully Booked
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredZones.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🅿️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No parking zones found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Parking;

