import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { acceptDonation, getDonation } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  pending: { bg: '#FFF7ED', text: '#EA580C' },
  accepted: { bg: '#F0FDF4', text: '#16A34A' },
  picked: { bg: '#EFF6FF', text: '#2563EB' },
  delivered: { bg: '#F5F3FF', text: '#7C3AED' },
  completed: { bg: '#ECFDF5', text: '#059669' },
  expired: { bg: '#FEF2F2', text: '#DC2626' },
};

const DonationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDonation = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDonation(id);
      setDonation(res.data.donation);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load donation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonation();
  }, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await acceptDonation(id);
      await fetchDonation();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to accept donation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '110px', minHeight: '100vh', background: '#F8F4EF' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: 0 }}>Loading donation...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div style={{ paddingTop: '110px', minHeight: '100vh', background: '#F8F4EF' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h2 style={{ marginTop: 0, color: '#DC2626' }}>Could not open donation</h2>
            <p style={{ color: '#6B7280' }}>{error || 'Donation not found'}</p>
            <button
              onClick={() => navigate('/donations')}
              style={{
                marginTop: '10px',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Back to Donations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = statusStyles[donation.status] || statusStyles.pending;
  const canAccept = user?.role === 'ngo' && donation.status === 'pending';

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', background: '#F8F4EF' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 2rem' }}>
        <div style={{ marginBottom: '18px' }}>
          <Link to="/donations" style={{ color: '#FF6B35', textDecoration: 'none', fontWeight: 700 }}>
            ← Back to all donations
          </Link>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1A1A2E', fontFamily: 'Playfair Display, serif' }}>{donation.title}</h1>
              <p style={{ margin: '10px 0 0', color: '#6B7280' }}>
                Donated by {donation.donor?.name || 'Anonymous'} • {new Date(donation.createdAt).toLocaleString()}
              </p>
            </div>
            <span style={{ background: status.bg, color: status.text, padding: '6px 12px', borderRadius: '16px', fontWeight: 700 }}>
              {donation.status}
            </span>
          </div>

          <p style={{ color: '#374151', lineHeight: 1.7, marginTop: '22px' }}>{donation.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '12px', marginTop: '22px' }}>
            <div style={{ background: '#F8F4EF', padding: '14px', borderRadius: '12px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '0.78rem' }}>SERVINGS</div>
              <div style={{ fontWeight: 800 }}>{donation.servings || 0}</div>
            </div>
            <div style={{ background: '#F8F4EF', padding: '14px', borderRadius: '12px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '0.78rem' }}>QUANTITY</div>
              <div style={{ fontWeight: 800 }}>
                {donation.quantity?.amount} {donation.quantity?.unit}
              </div>
            </div>
            <div style={{ background: '#F8F4EF', padding: '14px', borderRadius: '12px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '0.78rem' }}>EXPIRY</div>
              <div style={{ fontWeight: 800 }}>{donation.expiryTime ? new Date(donation.expiryTime).toLocaleString() : 'N/A'}</div>
            </div>
            <div style={{ background: '#F8F4EF', padding: '14px', borderRadius: '12px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '0.78rem' }}>URGENCY</div>
              <div style={{ fontWeight: 800, textTransform: 'capitalize' }}>{donation.urgency || 'medium'}</div>
            </div>
          </div>

          <div style={{ marginTop: '22px', background: '#F8F4EF', borderRadius: '12px', padding: '14px' }}>
            <div style={{ color: '#9CA3AF', fontSize: '0.78rem', marginBottom: '6px' }}>PICKUP ADDRESS</div>
            <div style={{ color: '#374151', fontWeight: 600 }}>{donation.pickupLocation?.address || 'No address provided'}</div>
          </div>

          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              style={{
                marginTop: '24px',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 18px',
                background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
                color: '#fff',
                fontWeight: 800,
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              {actionLoading ? 'Accepting...' : 'Accept Donation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDetailsPage;
