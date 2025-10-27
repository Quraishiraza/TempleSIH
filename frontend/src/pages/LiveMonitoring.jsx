import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  VideoCameraIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  ChartBarIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

const LiveMonitoring = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveFeeds, setLiveFeeds] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(1500); // 1.5 seconds (faster!)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    fetchZones();
    checkAlerts();
  }, []);

  useEffect(() => {
    if (autoRefresh && zones.length > 0) {
      const interval = setInterval(() => {
        refreshAllFeeds();
        checkAlerts();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, zones, refreshInterval]);

  const fetchZones = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/yolo/zones', { timeout: 5000 });
      setZones(response.data.zones);
      
      // Initialize live feeds for active zones
      const activeZones = response.data.zones.filter(z => z.status === 'active');
      if (activeZones.length > 0) {
        activeZones.forEach(zone => {
          fetchLiveFeed(zone.id);
        });
      } else {
        toast.error('No active YOLO zones found. Please add videos to yolo-service/videos/');
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Failed to connect to YOLO service. Make sure it\'s running on port 5002.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveFeed = async (zoneId) => {
    try {
      const response = await axios.get(`http://localhost:5002/api/yolo/live/${zoneId}`, { timeout: 3000 });
      setLiveFeeds(prev => ({
        ...prev,
        [zoneId]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching feed for zone ${zoneId}:`, error);
      // Don't show toast for individual feed errors (too many)
    }
  };

  const refreshAllFeeds = () => {
    zones.filter(z => z.status === 'active').forEach(zone => {
      fetchLiveFeed(zone.id);
    });
  };

  const checkAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/yolo/alerts');
      setActiveAlerts(response.data.alerts);
      
      // Show toast for new critical alerts
      response.data.alerts.forEach(alert => {
        if (alert.level === 'CRITICAL') {
          toast.error(`🚨 ${alert.zone_name}: ${alert.message}`, { duration: 5000 });
        }
      });
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  };

  const getCrowdLevelColor = (level) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertBadgeColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-600';
      case 'HIGH':
        return 'bg-orange-600';
      default:
        return 'bg-yellow-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading YOLO Monitoring System...</p>
        </div>
      </div>
    );
  }

  const activeZones = zones.filter(z => z.status === 'active');
  const inactiveZones = zones.filter(z => z.status === 'inactive');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <VideoCameraIcon className="h-8 w-8 mr-3" />
              YOLO Live Crowd Monitoring
            </h1>
            <p className="text-purple-100 text-lg">
              Real-time AI-powered crowd detection and analysis using YOLOv8
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-4xl font-bold">{activeZones.length}/{zones.length}</div>
            <div className="text-purple-100">Active Cameras</div>
          </div>
        </div>
      </div>

      {/* Controls & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Auto Refresh Control */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <ArrowPathIcon className="h-6 w-6 text-blue-600" />
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-sm font-medium text-gray-700">Auto Refresh</p>
          <p className="text-xs text-gray-500">Every {refreshInterval/1000}s</p>
        </div>

        {/* Total People */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total People</p>
              <p className="text-3xl font-bold text-gray-900">
                {Object.values(liveFeeds).reduce((sum, feed) => sum + (feed.analysis?.count || 0), 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-orange-600">{activeAlerts.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <BellAlertIcon className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* High Crowd Zones */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Crowd</p>
              <p className="text-3xl font-bold text-red-600">
                {Object.values(liveFeeds).filter(feed => 
                  feed.analysis?.crowd_level === 'HIGH' || feed.analysis?.crowd_level === 'CRITICAL'
                ).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2">Active Alerts ({activeAlerts.length})</h3>
              <div className="space-y-2">
                {activeAlerts.map((alert, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getAlertBadgeColor(alert.level)}`}>
                          {alert.level}
                        </span>
                        <span className="ml-2 font-semibold text-gray-900">{alert.zone_name}</span>
                      </div>
                      <span className="text-sm text-gray-600">{alert.count} people</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Video Feeds */}
      {activeZones.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeZones.map((zone) => {
            const feed = liveFeeds[zone.id];
            const analysis = feed?.analysis;

            return (
              <div key={zone.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Zone Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <VideoCameraIcon className="h-5 w-5" />
                      <h3 className="font-bold text-lg">{zone.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Video Feed */}
                <div className="relative bg-black">
                  {feed && feed.frame && feed.frame.length > 0 ? (
                    <img
                      src={`data:image/jpeg;base64,${feed.frame}`}
                      alt={`${zone.name} feed`}
                      className="w-full h-auto"
                    />
                  ) : feed && feed.mode === 'mock_data' ? (
                    <div className="flex items-center justify-center h-64 bg-gradient-to-br from-purple-900 to-blue-900">
                      <div className="text-center text-white p-6">
                        <VideoCameraIcon className="h-20 w-20 text-purple-300 mx-auto mb-4" />
                        <p className="text-xl font-bold mb-2">{zone.name}</p>
                        <p className="text-purple-200 mb-4">Simulating Video 3</p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
                          <p className="text-sm text-purple-100">
                            Using mock data due to video encoding issues
                          </p>
                          <p className="text-xs text-purple-200 mt-2">
                            Detection and alerts are fully functional
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-100">
                      <div className="text-center">
                        <EyeIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Loading feed...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Panel */}
                {analysis && (
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{analysis.count}</p>
                        <p className="text-xs text-gray-600">People Detected</p>
                      </div>
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getCrowdLevelColor(analysis.crowd_level)}`}>
                          {analysis.crowd_level}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">Crowd Level</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{zone.threshold}</p>
                        <p className="text-xs text-gray-600">Threshold</p>
                      </div>
                    </div>

                    {analysis.alerts && analysis.alerts.length > 0 && (
                      <div className="mt-3 bg-red-100 border border-red-200 rounded-lg p-2">
                        <p className="text-xs font-semibold text-red-800 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          Alert: Crowd threshold exceeded!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <VideoCameraIcon className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Cameras</h3>
          <p className="text-gray-700 mb-4">
            Please add video files to the YOLO service videos directory:
          </p>
          <code className="bg-gray-100 px-4 py-2 rounded text-sm text-gray-800 inline-block">
            /Users/rabdin/Desktop/sih01/yolo-service/videos/
          </code>
          <p className="text-sm text-gray-600 mt-4">
            Required files: temple_crowd_1.mp4, temple_crowd_2.mp4, temple_crowd_3.mp4
          </p>
        </div>
      )}

      {/* Inactive Zones Info */}
      {inactiveZones.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Inactive Zones ({inactiveZones.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {inactiveZones.map(zone => (
              <div key={zone.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="font-medium text-gray-900">{zone.name}</p>
                <p className="text-sm text-gray-500 mt-1">Missing: {zone.video}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          YOLO Detection Features
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✅ Real-time person detection using YOLOv8</li>
          <li>✅ Automatic crowd counting and density analysis</li>
          <li>✅ Alert generation when thresholds are exceeded</li>
          <li>✅ Bounding box visualization around detected persons</li>
          <li>✅ Live feed refresh every {refreshInterval/1000} seconds</li>
          <li>✅ Multi-zone monitoring (3 camera views)</li>
        </ul>
      </div>
    </div>
  );
};

export default LiveMonitoring;

