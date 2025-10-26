import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  BuildingLibraryIcon,
  CalendarDaysIcon,
  TruckIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import templesData from '../data/temples.json';

const Home = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [parkingBookings, setParkingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const activeParkingBookings = parkingBookings.filter(b => b.status === 'active');

  // Stats
  const stats = [
    {
      name: 'Total Temples',
      value: templesData.length,
      icon: BuildingLibraryIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Active Bookings',
      value: activeBookings.length,
      icon: CalendarDaysIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Parking Bookings',
      value: activeParkingBookings.length,
      icon: TruckIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Total Visits',
      value: bookings.length,
      icon: CheckCircleIcon,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  // Crowd data for chart
  const crowdData = templesData.map(temple => ({
    name: temple.name.split(' ')[0],
    occupancy: temple.currentOccupancy,
  }));

  // Status distribution
  const statusData = [
    { name: 'Low', value: templesData.filter(t => t.crowdStatus === 'low').length, color: '#10b981' },
    { name: 'Moderate', value: templesData.filter(t => t.crowdStatus === 'moderate').length, color: '#f59e0b' },
    { name: 'High', value: templesData.filter(t => t.crowdStatus === 'high').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🙏 Namaste, {user?.name || 'Guest'}!
            </h1>
            <p className="text-primary-100 text-lg">
              Welcome to your Trinetra dashboard. Plan your spiritual journey with ease.
            </p>
          </div>
          <div className="hidden md:block text-6xl">
            🕉️
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Occupancy Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-primary-600" />
            Current Temple Occupancy
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={crowdData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="occupancy" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crowd Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-primary-600" />
            Crowd Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/temples"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all group"
          >
            <div className="bg-primary-50 p-3 rounded-lg group-hover:bg-primary-100 transition-colors">
              <BuildingLibraryIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Explore Temples</p>
              <p className="text-xs text-gray-500">Browse all temples</p>
            </div>
          </Link>

          <Link
            to="/my-bookings"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all group"
          >
            <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition-colors">
              <CalendarDaysIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">My Bookings</p>
              <p className="text-xs text-gray-500">View all bookings</p>
            </div>
          </Link>

          <Link
            to="/parking"
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all group"
          >
            <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
              <TruckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Book Parking</p>
              <p className="text-xs text-gray-500">Reserve parking spot</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Popular Temples */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Temples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templesData.map((temple) => (
            <Link
              key={temple.id}
              to={`/temples/${temple.id}`}
              className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <img
                src={temple.image}
                alt={temple.name}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                <h4 className="text-white font-semibold text-sm mb-1">{temple.name}</h4>
                <div className="flex items-center text-white/90 text-xs">
                  <MapPinIcon className="h-3 w-3 mr-1" />
                  <span>{temple.location}</span>
                </div>
                <div className="flex items-center text-white/90 text-xs mt-1">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>Wait: {temple.estimatedWaitTime}</span>
                </div>
              </div>
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                temple.crowdStatus === 'low' ? 'bg-green-500' :
                temple.crowdStatus === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
              } text-white`}>
                {temple.crowdStatus.toUpperCase()}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

