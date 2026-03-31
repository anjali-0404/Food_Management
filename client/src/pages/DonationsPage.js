import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDonations, acceptDonation } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const urgencyColors = {
  low:      { bg: '#06D6A020', text: '#059669', border: '#06D6A040', label: '🟢 Low' },
  medium:   { bg: '#FFC94720', text: '#D97706', border: '#FFC94740', label: '🟡 Medium' },
  high:     { bg: '#FF6B3520', text: '#EA580C', border: '#FF6B3540', label: '🟠 High' },
  critical: { bg: '#EF476F20', text: '#DC2626', border: '#EF476F40', label: '🔴 Critical' },
};

const statusColors = {
  pending:   { bg: '#FFF7ED', text: '#EA580C', icon: '⏳' },
  accepted:  { bg: '#F0FDF4', text: '#16A34A', icon: '✅' },
  picked:    { bg: '#EFF6FF', text: '#2563EB', icon: '🚗' },
  delivered: { bg: '#F5F3FF', text: '#7C3AED', icon: '📦' },
  completed: { bg: '#F0FDF4', text: '#059669', icon: '🎉' },
  expired:   { bg: '#FEF2F2', text: '#DC2626', icon: '⚠️' },
};

const DonationCard = ({ d, onAccept, userRole }) => {
  const urg  = urgencyColors[d.urgency] || urgencyColors.medium;
  const stat = statusColors[d.status]   || statusColors.pending;
  const timeLeft = d.expiryTime
    ? Math.max(0, Math.round((new Date(d.expiryTime) - Date.now()) / 60000))
    : null;

  return (
    <div style={{
      background: '#fff', borderRadius: '20px', overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
      border: '1px solid rgba(0,0,0,0.06)',
      transition: 'all 0.3s', display: 'flex', flexDirection: 'column'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
    >
      {/* Card Top Bar */}
      <div style={{
        height: '6px',
        background: d.urgency === 'critical' ? 'linear-gradient(135deg,#EF476F,#FF6B35)'
                  : d.urgency === 'high'     ? 'linear-gradient(135deg,#FF6B35,#FFC947)'
                  : d.urgency === 'medium'   ? 'linear-gradient(135deg,#FFC947,#06D6A0)'
                  : 'linear-gradient(135deg,#06D6A0,#4ECDC4)'
      }} />

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1rem', fontWeight: 700, color: '#1A1A2E',
              marginBottom: '4px', lineHeight: 1.3
            }}>{d.title}</h3>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              by {d.donor?.name || 'Anonymous'} • {new Date(d.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
            background: stat.bg, color: stat.text, whiteSpace: 'nowrap', marginLeft: '8px'
          }}>{stat.icon} {d.status}</div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
            background: urg.bg, color: urg.text, border: `1px solid ${urg.border}`
          }}>{urg.label}</span>
          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: '#F3F4F6', color: '#374151' }}>
            {d.category === 'veg' ? '🥬' : d.category === 'non-veg' ? '🍗' : '🌱'} {d.category}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: '#EEF2FF', color: '#4338CA' }}>
            🍽️ {d.servings} servings
          </span>
        </div>

        {/* Description */}
        <p style={{
          color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.6,
          marginBottom: '16px', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{d.description}</p>

        {/* Info Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: '#F8F4EF', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '2px' }}>QUANTITY</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
              📦 {d.quantity?.amount} {d.quantity?.unit}
            </div>
          </div>
          <div style={{ background: timeLeft < 60 ? '#FEF2F2' : '#F0FDF4', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '2px' }}>EXPIRES IN</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: timeLeft < 60 ? '#DC2626' : '#059669' }}>
              ⏰ {timeLeft !== null ? `${timeLeft < 60 ? timeLeft + 'm' : Math.round(timeLeft / 60) + 'h'}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Location */}
        {d.pickupLocation?.address && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.8rem', color: '#6B7280', marginBottom: '16px'
          }}>
            <span>📍</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {d.pickupLocation.address.split(',').slice(0, 3).join(',')}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/donations/${d._id}`} style={{
            flex: 1, padding: '10px', borderRadius: '10px', textAlign: 'center',
            textDecoration: 'none', background: '#F3F4F6', color: '#374151',
            fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
          }}>👁️ View</Link>

          {userRole === 'ngo' && d.status === 'pending' && (
            <button onClick={() => onAccept(d._id)} style={{
              flex: 2, padding: '10px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
              color: '#fff', fontWeight: 700, cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>🤝 Accept Donation</button>
          )}
        </div>
      </div>
    </div>
  );
};

const DonationsPage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', urgency: '', foodType: '', category: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await getDonations(params);
      setDonations(res.data.donations);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchDonations(); }, [filters, page]);

  const handleAccept = async (id) => {
    try {
      await acceptDonation(id);
      fetchDonations();
    } catch (e) { alert(e.response?.data?.message || 'Error accepting donation'); }
  };

  const filterBtn = (key, val, label) => (
    <button onClick={() => { setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val })); setPage(1); }}
      style={{
        padding: '7px 16px', borderRadius: '30px', border: '2px solid',
        borderColor: filters[key] === val ? '#FF6B35' : '#e5e7eb',
        background: filters[key] === val ? 'rgba(255,107,53,0.1)' : '#fff',
        color: filters[key] === val ? '#FF6B35' : '#6B7280',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
        fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s'
      }}>{label}</button>
  );

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', background: '#F8F4EF' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1A1A2E,#16213E)', padding: '50px 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#fff', marginBottom: '8px' }}>
            Available Donations 🍱
          </h1>
          <p style={{ color: '#94a3b8' }}>
            {total} donation{total !== 1 ? 's' : ''} available • Help connect food with those in need
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 2rem' }}>
        {/* Filters */}
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '20px 24px',
          marginBottom: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.9rem', marginRight: '4px' }}>🔍 Filter:</span>
            {filterBtn('status', 'pending',   '⏳ Pending')}
            {filterBtn('status', 'accepted',  '✅ Accepted')}
            {filterBtn('status', 'completed', '🎉 Completed')}
            <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }} />
            {filterBtn('urgency', 'critical', '🔴 Critical')}
            {filterBtn('urgency', 'high',     '🟠 High')}
            {filterBtn('urgency', 'medium',   '🟡 Medium')}
            <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }} />
            {filterBtn('category', 'veg',     '🥬 Veg')}
            {filterBtn('category', 'non-veg', '🍗 Non-Veg')}
            {Object.values(filters).some(Boolean) && (
              <button onClick={() => { setFilters({ status: '', urgency: '', foodType: '', category: '' }); setPage(1); }}
                style={{
                  padding: '7px 16px', borderRadius: '30px', border: 'none',
                  background: '#FEF2F2', color: '#DC2626', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.82rem', fontFamily: 'Plus Jakarta Sans, sans-serif'
                }}>✕ Clear</button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                height: '380px', borderRadius: '20px',
                background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite'
              }} />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🍽️</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '8px' }}>No donations found</h3>
            <p style={{ color: '#6B7280' }}>Try clearing filters or check back later</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '20px' }}>
            {donations.map(d => (
              <DonationCard key={d._id} d={d} onAccept={handleAccept} userRole={user?.role} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              style={{ padding: '10px 20px', borderRadius: '10px', border: '2px solid #e5e7eb', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              ← Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{
                  padding: '10px 16px', borderRadius: '10px', border: '2px solid',
                  borderColor: page === i + 1 ? '#FF6B35' : '#e5e7eb',
                  background: page === i + 1 ? 'linear-gradient(135deg,#FF6B35,#FFC947)' : '#fff',
                  color: page === i + 1 ? '#fff' : '#374151',
                  cursor: 'pointer', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif'
                }}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              style={{ padding: '10px 20px', borderRadius: '10px', border: '2px solid #e5e7eb', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
    </div>
  );
};

export default DonationsPage;
