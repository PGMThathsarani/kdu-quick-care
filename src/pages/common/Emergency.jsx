import React, { useState } from 'react';
import Map from '../../components/Map';

const Emergency = ({ userRole }) => {
  // Only amb_assistant can see contact requests
  const [studentLocation, setStudentLocation] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [locationUploading, setLocationUploading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Simulate student uploading location
  const handleLocationUpload = () => {
    setLocationUploading(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationUploading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStudentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        // Simulate arrival time calculation (e.g., 7 minutes)
        setArrivalTime(Math.floor(Math.random() * 10) + 3); // 3-12 min
        setLocationUploading(false);
      },
      (error) => {
        setLocationError('Unable to retrieve your location.');
        setLocationUploading(false);
      }
    );
  };

  // Only show contact requests to amb_assistant
  if (userRole === 'amb_assistant') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 py-10 px-4">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-md flex flex-col items-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2 text-center uppercase">EMERGENCY ASSISTANCE NEEDED?</h1>
          <p className="text-base text-gray-700 mb-6 text-center font-semibold">Get immediate help for critical health issues</p>
          <h2 className="text-xl font-bold text-blue-800 mb-4">Emergency Requests</h2>
          {/* Here you would list students who contacted ambulance (mocked) */}
          <div className="w-full">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p><strong>Student:</strong> John Doe</p>
              <p><strong>Location:</strong> 24.7136, 46.6753</p>
              <p><strong>Estimated Arrival:</strong> 8 min</p>
              <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded">Mark as Arrived</button>
            </div>
            {/* Add more requests as needed */}
          </div>
        </div>
      </div>
    );
  }

  // Student view: upload live location
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 py-10 px-4">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-red-700 mb-2 text-center uppercase">EMERGENCY ASSISTANCE NEEDED?</h1>
        <p className="text-base text-gray-700 mb-6 text-center font-semibold">Get immediate help for critical health issues</p>
        <h2 className="text-xl font-bold text-blue-800 mb-4">Emergency - Upload Location</h2>
        {studentLocation ? (
          <>
            <div className="mb-4 text-green-700">Location uploaded: {studentLocation.lat.toFixed(4)}, {studentLocation.lng.toFixed(4)}</div>
            <Map lat={studentLocation.lat} lng={studentLocation.lng} />
            <div className="mb-4 text-blue-700 font-semibold">Estimated ambulance arrival: {arrivalTime} min</div>
          </>
        ) : (
          <>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md shadow mb-2"
              onClick={handleLocationUpload}
              disabled={locationUploading}
            >
              {locationUploading ? 'Uploading...' : 'Upload Live Location'}
            </button>
            {locationError && <div className="text-red-600 mb-2">{locationError}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default Emergency;
