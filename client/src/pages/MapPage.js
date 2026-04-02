import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getNearbyDonations } from '../utils/api';
import { Link } from 'react-router-dom';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createFoodIcon = (urgency) => {
  const color = urgency === 'critical' ? '#EF476F'
              : urgency === 'high'     ? '#FF6B35'
              : urgency === 'medium'   ? '#FFC947'
              : '#06D6A0';
  return new L.DivIcon({
    className: '',
    html: `<div style="
      background:${color};border:3px solid #fff;border-radius:50%;
      width:36px;height:36px;display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 4px 12px ${color}60;
      animation:pulse 2s ease-in-out infinite;
    ">🍱</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const userIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    background:linear-gradient(135deg,#4ECDC4,#06D6A0);
    border:3px solid #fff;border-radius:50%;
    width:40px;height:40px;display:flex;align-items:center;justify-content:center;
    font-size:18px;box-shadow:0 4px 20px rgba(78,205,196,0.6);
  ">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const FlyToLocation = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.5 });
  }, [coords, map]);
  return null;
};

const MapPage = () => {
  const [userPos,   setUserPos]   = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [gpsAcc,    setGpsAcc]    = useState(null);
  const [radius,    setRadius]    = useState(5000);
  const [selected,  setSelected]  = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | locating | found | error

  const getLocation = () => {
    if (!navigator.geolocation) { setGpsStatus('error'); return; }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserPos([latitude, longitude]);
        setGpsAcc(Math.round(accuracy));
        setGpsStatus('found');
        fetchNearby(latitude, longitude);
      },
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const fetchNearby = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await getNearbyDonations({ latitude: lat, longitude: lng, radius });
      setDonations(res.data.donations);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { getLocation(); }, []);
  useEffect(() => {
    if (userPos) fetchNearby(userPos[0], userPos[1]);
  }, [radius]);

  const urgencyColors = {
    critical: '#EF476F', high: '#FF6B35', medium: '#FFC947', low: '#06D6A0'
  };

  return (
    <div style={{ paddingTop: '70px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg,#1A1A2E,#16213E)',
        padding: '16px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#fff', fontSize: '1.3rem' }}>
            📡 Live Donation Map
          </h2>
          {gpsStatus === 'found' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(6,214,160,0.15)', border: '1px solid rgba(6,214,160,0.3)',
              borderRadius: '20px', padding: '5px 14px'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06D6A0', display: 'block', animation: 'pulse 1.5s infinite' }} />
              <span style={{ color: '#06D6A0', fontSize: '0.8rem', fontWeight: 600 }}>
                GPS Active ±{gpsAcc}m
              </span>
            </div>
          )}
          {gpsStatus === 'locating' && (
            <div style={{ color: '#FFC947', fontSize: '0.85rem', fontWeight: 600 }}>⏳ Getting your location...</div>
          )}
          {gpsStatus === 'error' && (
            <div style={{ color: '#EF476F', fontSize: '0.85rem', fontWeight: 600 }}>❌ GPS unavailable</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Radius Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Radius:</span>
            <select value={radius} onChange={e => setRadius(Number(e.target.value))} style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', color: '#fff', padding: '6px 12px', cursor: 'pointer',
              fontSize: '0.85rem'
            }}>
              <option value={2000}  style={{ background: '#1A1A2E' }}>2 km</option>
              <option value={5000}  style={{ background: '#1A1A2E' }}>5 km</option>
              <option value={10000} style={{ background: '#1A1A2E' }}>10 km</option>
              <option value={20000} style={{ background: '#1A1A2E' }}>20 km</option>
              <option value={50000} style={{ background: '#1A1A2E' }}>50 km</option>
            </select>
          </div>

          <button onClick={getLocation} style={{
            padding: '8px 18px', borderRadius: '20px', border: 'none',
            background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
            color: '#fff', fontWeight: 700, cursor: 'pointer',
            fontSize: '0.85rem', fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>🔄 Refresh</button>

          <div style={{
            background: 'rgba(255,255,255,0.1)', borderRadius: '10px',
            padding: '6px 14px', color: '#fff', fontSize: '0.85rem', fontWeight: 600
          }}>
            📦 {loading ? '...' : donations.length} nearby
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Donations Sidebar */}
        <div style={{
          width: '320px', background: '#F8F4EF',
          overflowY: 'auto', borderRight: '1px solid #e5e7eb'
        }}>
          {donations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗺️</div>
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                {gpsStatus === 'locating' ? 'Getting your location...' : 'No donations found nearby. Try increasing radius.'}
              </div>
            </div>
          ) : (
            donations.map(d => (
              <div key={d._id}
                onClick={() => setSelected(d._id === selected ? null : d._id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  background: selected === d._id ? '#fff' : 'transparent',
                  borderLeft: selected === d._id ? `4px solid ${urgencyColors[d.urgency] || '#FF6B35'}` : '4px solid transparent',
                  transition: 'all 0.2s'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1A2E', flex: 1, marginRight: '8px' }}>
                    {d.title}
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
                    background: (urgencyColors[d.urgency] || '#FF6B35') + '20',
                    color: urgencyColors[d.urgency] || '#FF6B35', whiteSpace: 'nowrap'
                  }}>{d.urgency}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>
                  🍽️ {d.servings} servings • {d.quantity?.amount} {d.quantity?.unit}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '4px' }}>
                  by {d.donor?.name || 'Anonymous'}
                </div>
                {selected === d._id && (
                  <Link to={`/donations/${d._id}`} style={{
                    display: 'block', marginTop: '10px', padding: '8px',
                    textAlign: 'center', borderRadius: '8px', textDecoration: 'none',
                    background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
                    color: '#fff', fontWeight: 700, fontSize: '0.85rem'
                  }}>View Details →</Link>
                )}
              </div>
            ))
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1 }}>
          <MapContainer
            center={userPos || [20.5937, 78.9629]}
            zoom={userPos ? 13 : 5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='© OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToLocation coords={userPos} />

            {/* User Location */}
            {userPos && (
              <>
                <Marker position={userPos} icon={userIcon}>
                  <Popup>
                    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>📍 You are here</div>
                      {gpsAcc && <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>GPS Accuracy: ±{gpsAcc}m</div>}
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={userPos} radius={radius}
                  pathOptions={{ color: '#4ECDC4', fillColor: '#4ECDC4', fillOpacity: 0.05, dashArray: '6' }}
                />
              </>
            )}

            {/* Donation Markers */}
            {donations.map(d => {
              const [lng, lat] = d.pickupLocation?.coordinates || [0, 0];
              if (!lat || !lng) return null;
              return (
                <Marker key={d._id} position={[lat, lng]} icon={createFoodIcon(d.urgency)}>
                  <Popup maxWidth={260}>
                    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '4px' }}>
                      <div style={{
                        fontWeight: 800, fontSize: '1rem', marginBottom: '6px',
                        color: '#1A1A2E'
                      }}>{d.title}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                        <div style={{ background: '#F3F4F6', borderRadius: '8px', padding: '6px', fontSize: '0.78rem' }}>
                          <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Servings</div>
                          <div style={{ fontWeight: 700 }}>{d.servings} people</div>
                        </div>
                        <div style={{ background: '#F3F4F6', borderRadius: '8px', padding: '6px', fontSize: '0.78rem' }}>
                          <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Quantity</div>
                          <div style={{ fontWeight: 700 }}>{d.quantity?.amount} {d.quantity?.unit}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: '10px' }}>
                        by {d.donor?.name} • {d.urgency} urgency
                      </div>
                      <Link to={`/donations/${d._id}`} style={{
                        display: 'block', padding: '8px', textAlign: 'center',
                        borderRadius: '8px', textDecoration: 'none',
                        background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem'
                      }}>View & Accept →</Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '30px', right: '340px',
        background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(10px)',
        borderRadius: '16px', padding: '16px 20px',
        border: '1px solid rgba(255,255,255,0.1)', zIndex: 1000
      }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px' }}>
          🗺️ Legend
        </div>
        {[
          { color: '#EF476F', label: 'Critical Urgency' },
          { color: '#FF6B35', label: 'High Urgency' },
          { color: '#FFC947', label: 'Medium Urgency' },
          { color: '#06D6A0', label: 'Low Urgency' },
          { color: '#4ECDC4', label: 'Your Location' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.color }} />
            <span style={{ color: '#d1d5db', fontSize: '0.78rem' }}>{l.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.1)} }
      `}</style>
    </div>
  );
};

export default MapPage;
