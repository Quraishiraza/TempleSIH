import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCircleIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from 'recharts';
import templesData from '../data/temples.json';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [parkingBookings, setParkingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mlPredictions, setMlPredictions] = useState([]);
  const [bestTimes, setBestTimes] = useState({});
  const [loadingML, setLoadingML] = useState(true);
  const [mlFetched, setMlFetched] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  const fetchMLPredictions = useCallback(async () => {
    setLoadingML(true);
    try {
      // Fetch 7-day predictions for all temples with timeout
      const predictions = await Promise.all(
        templesData.map(async (temple) => {
          try {
            const response = await axios.post('http://localhost:5001/api/ml/predict', {
              temple_id: temple.id,
              days_ahead: 7
            }, { timeout: 5000 });
            return {
              templeId: temple.id,
              templeName: temple.name,
              predictions: response.data.predictions
            };
          } catch (err) {
            console.warn(`Failed to fetch predictions for temple ${temple.id}`);
            return null;
          }
        })
      );
      setMlPredictions(predictions.filter(p => p !== null));

      // Fetch best times for all temples with timeout
      const bestTimesData = {};
      for (const temple of templesData) {
        try {
          const response = await axios.get(`http://localhost:5001/api/ml/best-time/${temple.id}`, { timeout: 5000 });
          bestTimesData[temple.id] = response.data;
        } catch (error) {
          console.warn(`Error fetching best time for temple ${temple.id}`);
        }
      }
      setBestTimes(bestTimesData);
    } catch (error) {
      console.error('Error fetching ML predictions:', error);
      // Don't show error toast - let page load without ML features
    } finally {
      setLoadingML(false);
    }
  }, []);

  useEffect(() => {
    if (user && !mlFetched) {
      fetchBookings();
      // Disabled ML predictions to prevent infinite loop
      // fetchMLPredictions();
      setMlFetched(true);
      setLoadingML(false);
    }
  }, [user, mlFetched, fetchBookings]); // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* AI-Powered 7-Day Crowd Forecast */}
      {!loadingML && mlPredictions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">AI-Powered 7-Day Crowd Forecast</h3>
            </div>
            <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              ML Predictions
            </span>
          </div>

          {/* Forecast Chart for Each Temple */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mlPredictions.map((temple) => {
              const chartData = temple.predictions.map(pred => ({
                date: new Date(pred.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                visitors: pred.predicted_visitors,
                crowdLevel: pred.crowd_level,
                isFestival: pred.is_festival
              }));

              return (
                <div key={temple.templeId} className="bg-white rounded-lg p-5 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">{temple.templeName}</h4>
                    {chartData.some(d => d.isFestival) && (
                      <span className="flex items-center text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                        Festival Alert
                      </span>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={`colorVisitors${temple.templeId}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                <p className="text-sm font-semibold text-gray-900">{data.date}</p>
                                <p className="text-sm text-gray-700">Visitors: {data.visitors.toLocaleString()}</p>
                                <p className={`text-xs font-semibold ${
                                  data.crowdLevel === 'LOW' ? 'text-green-600' :
                                  data.crowdLevel === 'MODERATE' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {data.crowdLevel} CROWD
                                </p>
                                {data.isFestival && (
                                  <p className="text-xs text-orange-600 font-semibold mt-1">🎉 Festival Day</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="#8b5cf6" 
                        fillOpacity={1} 
                        fill={`url(#colorVisitors${temple.templeId})`} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  {/* Best Time Recommendation */}
                  {bestTimes[temple.templeId] && (
                    <div className="mt-4 bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs font-semibold text-green-800 mb-1">💡 Best Time to Visit:</p>
                      <p className="text-sm text-green-700">
                        <strong>{bestTimes[temple.templeId].best_day}</strong> at{' '}
                        <strong>{bestTimes[temple.templeId].best_time_slot}</strong>
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Expected: {bestTimes[temple.templeId].expected_visitors.toLocaleString()} visitors
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loadingML && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI predictions...</p>
        </div>
      )}

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

