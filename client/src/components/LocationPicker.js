import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const customIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width:40px;height:40px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#FF6B35,#FFC947);
    transform:rotate(-45deg);
    border:3px solid #fff;
    box-shadow:0 4px 15px rgba(255,107,53,0.5);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:16px;">📍</span></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const DraggableMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) { setPosition([e.latlng.lat, e.latlng.lng]); }
  });
  return position ? (
    <Marker
      position={position}
      icon={customIcon}
      draggable
      eventHandlers={{ dragend: e => setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]) }}
    />
  ) : null;
};

const LocationPicker = ({ onLocationSelect, initialCoords }) => {
  const [position,  setPosition]  = useState(initialCoords || null);
  const [address,   setAddress]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [accuracy,  setAccuracy]  = useState(null);
  const [center,    setCenter]    = useState([20.5937, 78.9629]); // India center

  const getGPSLocation = () => {
    if (!navigator.geolocation) return alert('GPS not supported');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        const coords = [latitude, longitude];
        setPosition(coords);
        setCenter(coords);
        setAccuracy(Math.round(acc));
        reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        alert('GPS Error: ' + err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(addr);
      onLocationSelect({
        coordinates: [lng, lat],  // MongoDB: [lng, lat]
        address:     addr,
        accuracy:    accuracy
      });
    } catch {
      const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(addr);
      onLocationSelect({ coordinates: [lng, lat], address: addr });
    }
  };

  useEffect(() => {
    if (position) reverseGeocode(position[0], position[1]);
  }, [position]);

  return (
    <div style={{ borderRadius: '20px', overflow: 'hidden', border: '2px solid rgba(255,107,53,0.3)' }}>
      {/* GPS Button */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
            📡 GPS Location Picker
          </div>
          <div style={{ color: '#4ECDC4', fontSize: '0.8rem' }}>
            {accuracy ? `✅ Accuracy: ±${accuracy}m` : 'Click on map or use GPS button'}
          </div>
        </div>
        <button onClick={getGPSLocation} disabled={loading} style={{
          padding: '10px 20px', borderRadius: '30px', border: 'none',
          background: loading
            ? 'rgba(255,255,255,0.2)'
            : 'linear-gradient(135deg, #4ECDC4, #06D6A0)',
          color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
          fontFamily: 'inherit'
        }}>
          {loading ? '⏳ Locating...' : '📍 Use My GPS'}
        </button>
      </div>

      {/* Map */}
      <MapContainer
        center={center} zoom={13}
        style={{ height: '320px', width: '100%' }}
        key={center.join(',')}
      >
        <TileLayer
          attribution='© OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={position} setPosition={setPosition} />
      </MapContainer>

      {/* Address Display */}
      {address && (
        <div style={{
          background: 'rgba(255,107,53,0.08)',
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,107,53,0.2)'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#FF6B35', fontWeight: 700, marginBottom: '4px' }}>
            📌 Selected Address
          </div>
          <div style={{ fontSize: '0.85rem', color: '#374151' }}>{address}</div>
        </div>
      )}

      <div style={{
        padding: '10px 20px', background: '#f9fafb',
        fontSize: '0.75rem', color: '#6B7280',
        borderTop: '1px solid rgba(0,0,0,0.06)'
      }}>
        💡 Tip: Click on map to pin location, drag marker to adjust, or use GPS button for exact coordinates
      </div>
    </div>
  );
};

export default LocationPicker;
