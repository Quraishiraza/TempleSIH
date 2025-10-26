import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import templesData from '../data/temples.json';

const Temples = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTemples = templesData.filter(temple => {
    const matchesSearch = temple.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         temple.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || temple.crowdStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏛️ Explore Sacred Temples
        </h1>
        <p className="text-gray-600">
          Discover and plan your visit to Gujarat's most revered pilgrimage sites
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
              placeholder="Search temples by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">All Crowd Levels</option>
              <option value="low">Low Crowd</option>
              <option value="moderate">Moderate Crowd</option>
              <option value="high">High Crowd</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Found {filteredTemples.length} temple(s)</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Temples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemples.map((temple) => (
          <div key={temple.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
            {/* Temple Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={temple.image}
                alt={temple.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCrowdBadgeColor(temple.crowdStatus)}`}>
                  {temple.crowdStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Temple Info */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{temple.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{temple.location}</span>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <ClockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Wait Time: {temple.estimatedWaitTime}</span>
                </div>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Occupancy: {temple.currentOccupancy}%</span>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      temple.currentOccupancy < 50 ? 'bg-green-500' :
                      temple.currentOccupancy < 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${temple.currentOccupancy}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link
                  to={`/temples/${temple.id}`}
                  className="flex-1 text-center py-2 px-4 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
                <Link
                  to={`/book-darshan/${temple.id}`}
                  className="flex-1 text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredTemples.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No temples found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Temples;

