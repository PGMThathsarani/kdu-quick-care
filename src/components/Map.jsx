import React from 'react';

const Map = ({ lat, lng }) => {
  // Google Maps embed URL
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow mb-4">
      <iframe
        title="Live Location Map"
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default Map;
