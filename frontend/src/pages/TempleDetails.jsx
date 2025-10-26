import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  TruckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import templesData from '../data/temples.json';
import axios from 'axios';
import toast from 'react-hot-toast';

const TempleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const temple = templesData.find(t => t.id === id);
  const [mlForecast, setMlForecast] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [loadingML, setLoadingML] = useState(true);

  useEffect(() => {
    if (temple && !loadingML) {
      // Temporarily disabled to fix infinite loop  
      // fetchMLData();
      setLoadingML(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMLData = async () => {
    try {
      const [forecastRes, bestTimeRes] = await Promise.all([
        axios.post('http://localhost:5001/api/ml/predict', {
          temple_id: temple.id,
          days_ahead: 7
        }),
        axios.get(`http://localhost:5001/api/ml/best-time/${temple.id}`)
      ]);
      setMlForecast(forecastRes.data);
      setBestTime(bestTimeRes.data);
    } catch (error) {
      console.error('Error fetching ML data:', error);
      toast.error('Could not load crowd predictions');
    } finally {
      setLoadingML(false);
    }
  };

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

          {/* AI-Powered Crowd Forecast */}
          {!loadingML && mlForecast && (
            <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">7-Day AI Crowd Forecast</h2>
                <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  ML Powered
                </span>
              </div>

              {/* Forecast Chart */}
              <div className="bg-white rounded-lg p-5 mb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mlForecast.predictions.map(pred => ({
                    date: new Date(pred.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    visitors: pred.predicted_visitors,
                    crowdLevel: pred.crowd_level,
                    isFestival: pred.is_festival
                  }))}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} label={{ value: 'Expected Visitors', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                              <p className="text-sm font-semibold text-gray-900 mb-2">{data.date}</p>
                              <p className="text-sm text-gray-700">Expected Visitors: <strong>{data.visitors.toLocaleString()}</strong></p>
                              <div className={`mt-2 px-2 py-1 rounded text-xs font-semibold inline-block ${
                                data.crowdLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                                data.crowdLevel === 'MODERATE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {data.crowdLevel} CROWD
                              </div>
                              {data.isFestival && (
                                <p className="text-xs text-orange-600 font-semibold mt-2 flex items-center">
                                  <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                  Festival Day - Expect heavy crowds
                                </p>
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
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorVisitors)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Best Time Recommendation */}
              {bestTime && (
                <div className="bg-green-50 rounded-lg p-5 border-2 border-green-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 rounded-full p-2 mt-1">
                      <SparklesIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900 mb-2">
                        💡 AI Recommendation: Best Time to Visit
                      </h3>
                      <div className="space-y-2">
                        <p className="text-green-800">
                          <strong className="font-semibold">Best Day:</strong>{' '}
                          <span className="text-green-900 font-bold">{bestTime.best_day}</span>
                        </p>
                        <p className="text-green-800">
                          <strong className="font-semibold">Best Time Slot:</strong>{' '}
                          <span className="text-green-900 font-bold">{bestTime.best_time_slot}</span>
                        </p>
                        <p className="text-green-700 text-sm">
                          Expected visitors: <strong>{bestTime.expected_visitors.toLocaleString()}</strong>
                        </p>
                        <p className="text-green-600 text-sm mt-3">
                          {bestTime.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Day-by-Day Breakdown */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mlForecast.predictions.slice(0, 6).map((pred, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 ${
                      pred.crowd_level === 'LOW' ? 'bg-green-50 border-green-200' :
                      pred.crowd_level === 'MODERATE' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(pred.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      {pred.is_festival && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">🎉 Festival</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">Expected Visitors:</p>
                    <p className="text-lg font-bold text-gray-900">{pred.predicted_visitors.toLocaleString()}</p>
                    <div className={`mt-2 text-xs font-semibold ${
                      pred.crowd_level === 'LOW' ? 'text-green-700' :
                      pred.crowd_level === 'MODERATE' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {pred.crowd_level} CROWD
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingML && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading AI predictions...</p>
            </div>
          )}

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

