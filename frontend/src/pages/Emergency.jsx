import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PhoneIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  FireIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Emergency = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);
  const [sosMessage, setSosMessage] = useState('');

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/emergency-contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      toast.error('Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSOSClick = () => {
    setShowSOSConfirm(true);
  };

  const confirmSOS = async () => {
    setSosLoading(true);
    try {
      await axios.post('http://localhost:3002/api/emergency/sos', {
        userId: user.id,
        userName: user.name,
        userContact: user.phone || 'Not provided',
        location: 'Current Location',
        message: sosMessage || 'Emergency SOS alert',
        timestamp: new Date().toISOString()
      });
      
      toast.success('🚨 SOS Alert Sent! Authorities have been notified.');
      setShowSOSConfirm(false);
      setSosMessage('');
    } catch (error) {
      console.error('Error sending SOS:', error);
      toast.error('Failed to send SOS alert');
    } finally {
      setSosLoading(false);
    }
  };

  const getContactIcon = (type) => {
    switch (type) {
      case 'police':
        return <ShieldCheckIcon className="h-8 w-8" />;
      case 'medical':
        return <HeartIcon className="h-8 w-8" />;
      case 'fire':
        return <FireIcon className="h-8 w-8" />;
      case 'security':
        return <ShieldCheckIcon className="h-8 w-8" />;
      case 'admin':
        return <UserGroupIcon className="h-8 w-8" />;
      default:
        return <PhoneIcon className="h-8 w-8" />;
    }
  };

  const getContactColor = (type) => {
    switch (type) {
      case 'police':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'medical':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'fire':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'security':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'admin':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const callNumber = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 mr-3" />
              Emergency & Safety
            </h1>
            <p className="text-red-100 text-lg">
              Quick access to emergency services and safety resources
            </p>
          </div>
          <div className="hidden md:block text-6xl">
            🚨
          </div>
        </div>
      </div>

      {/* SOS Button */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency SOS</h2>
          <p className="text-gray-600 mb-6">
            In case of immediate danger, press the button below to alert authorities
          </p>
          <button
            onClick={handleSOSClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
          >
            🆘 SEND SOS ALERT
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Your location and details will be shared with emergency services
          </p>
        </div>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <PhoneIcon className="h-6 w-6 mr-2 text-red-600" />
          Emergency Contacts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`border-2 rounded-lg p-5 transition-all hover:shadow-lg ${getContactColor(contact.type)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getContactIcon(contact.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1">{contact.name}</h3>
                  <p className="text-2xl font-bold mb-2">{contact.phone}</p>
                  <div className="flex items-center text-sm mb-3">
                    {contact.available24x7 ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span className="font-semibold">24x7 Available</span>
                      </>
                    ) : (
                      <>
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{contact.timings}</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => callNumber(contact.phone)}
                    className="w-full bg-white/50 hover:bg-white/80 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">During High Crowd:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Stay calm and follow crowd flow
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Keep children close and hold hands
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Look for emergency exits
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Don't push or panic
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">General Safety:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Keep valuables secure
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Stay hydrated, especially in summer
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Follow temple guidelines
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                Share your location with family
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SOS Confirmation Modal */}
      {showSOSConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm SOS Alert</h3>
              <p className="text-gray-600">
                This will immediately notify emergency services. Only use in real emergencies.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief Description (Optional)
              </label>
              <textarea
                value={sosMessage}
                onChange={(e) => setSosMessage(e.target.value)}
                placeholder="Describe your emergency..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSOSConfirm(false)}
                disabled={sosLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSOS}
                disabled={sosLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {sosLoading ? 'Sending...' : 'Send SOS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;

