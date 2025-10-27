import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BellAlertIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active, all, resolved

  const fetchAlerts = useCallback(async () => {
    try {
      // Fetch both system alerts and YOLO alerts
      const systemEndpoint = filter === 'active' 
        ? 'http://localhost:5001/api/alerts/active'
        : 'http://localhost:5001/api/alerts';
      
      let allAlerts = [];
      
      // Fetch system alerts
      try {
        const systemResponse = await axios.get(systemEndpoint, { timeout: 3000 });
        allAlerts = Array.isArray(systemResponse.data) ? systemResponse.data : [];
      } catch (err) {
        console.warn('System alerts not available:', err.message);
      }
      
      // Fetch YOLO alerts
      try {
        const yoloResponse = await axios.get('http://localhost:5002/api/yolo/alerts', { timeout: 3000 });
        const yoloAlerts = yoloResponse.data.alerts || [];
        
        // Transform YOLO alerts to match our alert format
        const transformedYoloAlerts = yoloAlerts.map(alert => ({
          id: `yolo_${alert.zone_id}_${Date.now()}`,
          type: 'high_crowd',
          severity: alert.level === 'CRITICAL' ? 'critical' : 
                   alert.level === 'HIGH' ? 'high' : 'medium',
          templeId: alert.zone_id,
          templeName: alert.zone_name,
          message: `Crowd Alert: ${alert.count} people detected (threshold: ${alert.threshold})`,
          peopleCount: alert.count,
          threshold: alert.threshold,
          timestamp: alert.timestamp,
          status: 'active',
          acknowledgedBy: [],
          source: 'yolo'
        }));
        
        allAlerts = [...allAlerts, ...transformedYoloAlerts];
      } catch (err) {
        console.warn('YOLO alerts not available:', err.message);
      }
      
      // Apply filter
      let filteredAlerts = allAlerts;
      if (filter === 'active') {
        filteredAlerts = allAlerts.filter(a => a.status === 'active');
      } else if (filter === 'resolved') {
        filteredAlerts = allAlerts.filter(a => a.status === 'resolved');
      }
      
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const checkThresholds = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/alerts/check-thresholds');
      if (response.data.newAlerts.length > 0) {
        toast.success(`Generated ${response.data.newAlerts.length} new alert(s)`);
        fetchAlerts();
      } else {
        toast.success('No threshold violations detected');
      }
    } catch (error) {
      console.error('Error checking thresholds:', error);
      toast.error('Failed to check thresholds');
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await axios.patch(`http://localhost:5001/api/alerts/${alertId}`, {
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString()
      });
      toast.success('Alert acknowledged');
      fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await axios.patch(`http://localhost:5001/api/alerts/${alertId}`, {
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      });
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeLabel = (type) => {
    const labels = {
      high_crowd: 'High Crowd',
      long_wait: 'Long Wait Time',
      sos: 'SOS Emergency',
      security: 'Security Alert',
      medical: 'Medical Emergency',
      fire: 'Fire Alert'
    };
    return labels[type] || type;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <BellAlertIcon className="h-8 w-8 mr-3" />
              Alert Management Dashboard
            </h1>
            <p className="text-red-100 text-lg">
              Real-time monitoring and response system for temple alerts
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-4xl font-bold">{activeAlertsCount}</div>
            <div className="text-red-100">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BellAlertIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-orange-600">{activeAlertsCount}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-3xl font-bold text-red-600">{criticalAlertsCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">SOS Alerts</p>
              <p className="text-3xl font-bold text-purple-600">
                {alerts.filter(a => a.type === 'sos').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <UsersIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'active'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({activeAlertsCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'resolved'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              🔄 Refresh
            </button>
            <button
              onClick={checkThresholds}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              ⚡ Check Thresholds
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Alerts</h3>
            <p className="text-gray-600">All systems running normally</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                alert.severity === 'critical' ? 'border-red-600' :
                alert.severity === 'high' ? 'border-orange-600' :
                alert.severity === 'medium' ? 'border-yellow-600' : 'border-blue-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity?.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {getAlertTypeLabel(alert.type)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      alert.status === 'active' ? 'bg-orange-100 text-orange-700' :
                      alert.status === 'acknowledged' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {alert.status?.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{alert.message}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    {alert.templeName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {alert.templeName}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatTimestamp(alert.timestamp)}
                    </div>
                    {alert.userName && (
                      <div className="flex items-center text-sm text-gray-600">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        {alert.userName}
                        {alert.userContact && ` (${alert.userContact})`}
                      </div>
                    )}
                  </div>

                  {alert.type === 'sos' && alert.location && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-red-800">
                        🆘 SOS EMERGENCY - Immediate Response Required
                      </p>
                      <p className="text-sm text-red-700">Location: {alert.location}</p>
                    </div>
                  )}

                  {alert.currentOccupancy && (
                    <div className="text-sm text-gray-700">
                      Current Occupancy: <strong>{alert.currentOccupancy}%</strong>
                    </div>
                  )}

                  {alert.waitTime && (
                    <div className="text-sm text-gray-700">
                      Wait Time: <strong>{alert.waitTime}</strong>
                    </div>
                  )}
                </div>

                {alert.status === 'active' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;

