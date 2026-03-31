import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDonation } from '../utils/api';
import LocationPicker from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';

const steps = ['Food Details', 'Quantity & Expiry', '📍 GPS Location', 'Review & Submit'];

const DonatePage = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title:       '',
    description: '',
    foodType:    'cooked',
    category:    'veg',
    quantity:    { amount: '', unit: 'kg' },
    servings:    '',
    expiryTime:  '',
    urgency:     'medium',
    pickupLocation: null,
    images:      []
  });

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    border: '2px solid #e5e7eb', fontSize: '0.95rem',
    fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none',
    transition: 'border 0.2s', background: '#fff'
  };

  const labelStyle = {
    display: 'block', marginBottom: '8px',
    fontWeight: 600, fontSize: '0.9rem', color: '#374151'
  };

  const handleSubmit = async () => {
    if (!form.pickupLocation) return setError('Please select a pickup location with GPS');
    setLoading(true);
    setError('');
    try {
      await createDonation({
        ...form,
        quantity: { amount: Number(form.quantity.amount), unit: form.quantity.unit },
        servings: Number(form.servings)
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div style={{ paddingTop: '100px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
      <h2>Please login to donate food</h2>
    </div>
  );

  if (success) return (
    <div style={{
      paddingTop: '120px', textAlign: 'center', maxWidth: '500px',
      margin: '0 auto', padding: '120px 2rem'
    }}>
      <div style={{ fontSize: '5rem', animation: 'bounceIn 0.6s ease' }}>🎉</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '20px 0 12px', color: '#1A1A2E' }}>
        Donation Listed!
      </h2>
      <p style={{ color: '#6B7280', marginBottom: '24px' }}>
        Your food donation has been posted. Nearby NGOs are being notified right now!
      </p>
      <div style={{
        background: 'linear-gradient(135deg,#06D6A0,#4ECDC4)',
        borderRadius: '20px', padding: '20px',
        color: '#fff', fontWeight: 700, fontSize: '1.1rem'
      }}>✅ Redirecting to your dashboard...</div>
    </div>
  );

  const foodTypes = [
    { val: 'cooked',           emoji: '🍛', label: 'Cooked Food' },
    { val: 'raw',              emoji: '🌾', label: 'Raw Grains' },
    { val: 'packaged',         emoji: '📦', label: 'Packaged' },
    { val: 'dairy',            emoji: '🥛', label: 'Dairy' },
    { val: 'bakery',           emoji: '🥖', label: 'Bakery' },
    { val: 'fruits_vegetables',emoji: '🥦', label: 'Fruits & Veg' },
    { val: 'beverages',        emoji: '🧃', label: 'Beverages' },
    { val: 'other',            emoji: '🍫', label: 'Other' },
  ];

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', background: 'linear-gradient(135deg,#F8F4EF 0%,#fff 100%)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 2rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍱</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', marginBottom: '8px' }}>
            Donate Food
          </h1>
          <p style={{ color: '#6B7280' }}>Your donation can serve many hungry people today</p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '0' }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: i <= step
                    ? 'linear-gradient(135deg,#FF6B35,#FFC947)'
                    : '#e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i <= step ? '#fff' : '#9CA3AF',
                  fontWeight: 800, fontSize: '0.9rem',
                  transition: 'all 0.3s',
                  boxShadow: i === step ? '0 4px 15px rgba(255,107,53,0.4)' : 'none'
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div style={{
                  marginTop: '6px', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center',
                  color: i <= step ? '#FF6B35' : '#9CA3AF',
                  whiteSpace: 'nowrap'
                }}>{s}</div>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: '3px', margin: '0 4px', marginTop: '-18px',
                  background: i < step
                    ? 'linear-gradient(135deg,#FF6B35,#FFC947)'
                    : '#e5e7eb',
                  transition: 'background 0.3s', borderRadius: '2px'
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div style={{
          background: '#fff', borderRadius: '24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          padding: '40px', border: '1px solid rgba(0,0,0,0.06)'
        }}>

          {/* STEP 0: Food Details */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: '4px' }}>
                Tell us about the food 🍽️
              </h3>

              <div>
                <label style={labelStyle}>Food Title *</label>
                <input style={inputStyle} placeholder="e.g., Homemade Biryani - 20 plates"
                  value={form.title} onChange={e => update('title', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#FF6B35'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>

              <div>
                <label style={labelStyle}>Description *</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Describe the food, how it was prepared, any allergens etc."
                  value={form.description} onChange={e => update('description', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#FF6B35'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>

              <div>
                <label style={labelStyle}>Food Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                  {foodTypes.map(ft => (
                    <button key={ft.val} onClick={() => update('foodType', ft.val)} style={{
                      padding: '12px 8px', borderRadius: '12px', border: '2px solid',
                      borderColor: form.foodType === ft.val ? '#FF6B35' : '#e5e7eb',
                      background: form.foodType === ft.val ? 'rgba(255,107,53,0.08)' : '#fff',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '6px', transition: 'all 0.2s',
                      fontFamily: 'Plus Jakarta Sans, sans-serif'
                    }}>
                      <span style={{ fontSize: '1.4rem' }}>{ft.emoji}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: form.foodType === ft.val ? '#FF6B35' : '#374151' }}>{ft.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { val: 'veg',     label: '🥬 Veg',     color: '#06D6A0' },
                    { val: 'non-veg', label: '🍗 Non-Veg', color: '#EF476F' },
                    { val: 'vegan',   label: '🌱 Vegan',   color: '#4ECDC4' },
                    { val: 'mixed',   label: '🍱 Mixed',   color: '#FFC947' },
                  ].map(c => (
                    <button key={c.val} onClick={() => update('category', c.val)} style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid',
                      borderColor: form.category === c.val ? c.color : '#e5e7eb',
                      background: form.category === c.val ? c.color + '15' : '#fff',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      color: form.category === c.val ? c.color : '#6B7280',
                      fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s'
                    }}>{c.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Urgency Level</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { val: 'low',      label: '🟢 Low',      color: '#06D6A0' },
                    { val: 'medium',   label: '🟡 Medium',   color: '#FFC947' },
                    { val: 'high',     label: '🟠 High',     color: '#FF6B35' },
                    { val: 'critical', label: '🔴 Critical', color: '#EF476F' },
                  ].map(u => (
                    <button key={u.val} onClick={() => update('urgency', u.val)} style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: '2px solid',
                      borderColor: form.urgency === u.val ? u.color : '#e5e7eb',
                      background: form.urgency === u.val ? u.color + '15' : '#fff',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                      color: form.urgency === u.val ? u.color : '#6B7280',
                      fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s'
                    }}>{u.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Quantity & Expiry */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem' }}>
                Quantity & Timing ⏰
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Quantity Amount *</label>
                  <input type="number" style={inputStyle} placeholder="e.g., 20"
                    value={form.quantity.amount}
                    onChange={e => update('quantity', { ...form.quantity, amount: e.target.value })}
                    onFocus={e => e.target.style.borderColor = '#FF6B35'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
                <div>
                  <label style={labelStyle}>Unit</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.quantity.unit}
                    onChange={e => update('quantity', { ...form.quantity, unit: e.target.value })}>
                    {['kg', 'plates', 'packets', 'liters', 'boxes', 'pieces'].map(u =>
                      <option key={u} value={u}>{u}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Estimated Servings (people who can eat) *</label>
                <input type="number" style={inputStyle} placeholder="e.g., 30 people"
                  value={form.servings} onChange={e => update('servings', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#FF6B35'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6B7280' }}>
                  💡 This helps NGOs plan distribution
                </div>
              </div>

              <div>
                <label style={labelStyle}>Best Before / Expiry Time *</label>
                <input type="datetime-local" style={inputStyle}
                  value={form.expiryTime} onChange={e => update('expiryTime', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  onFocus={e => e.target.style.borderColor = '#FF6B35'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#EF476F' }}>
                  ⚠️ Food must be picked up before this time
                </div>
              </div>

              {form.servings && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6,214,160,0.1), rgba(78,205,196,0.1))',
                  border: '2px solid rgba(6,214,160,0.3)', borderRadius: '16px', padding: '20px'
                }}>
                  <div style={{ fontWeight: 700, color: '#059669', marginBottom: '8px' }}>
                    🌟 Impact Preview
                  </div>
                  <div style={{ color: '#374151', fontSize: '1rem' }}>
                    Your donation can feed approximately <strong style={{ color: '#06D6A0', fontSize: '1.3rem' }}>{form.servings} people</strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: GPS Location */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem' }}>
                Pickup Location 📡
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                Pin your exact location so NGOs can navigate to you accurately
              </p>
              <LocationPicker onLocationSelect={(loc) => update('pickupLocation', loc)} />
              {form.pickupLocation && (
                <div style={{
                  background: 'rgba(6,214,160,0.1)', border: '2px solid rgba(6,214,160,0.3)',
                  borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                  <span style={{ fontSize: '1.4rem' }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>Location Confirmed</div>
                    <div style={{ color: '#374151', fontSize: '0.8rem' }}>
                      [{form.pickupLocation.coordinates[1].toFixed(5)}, {form.pickupLocation.coordinates[0].toFixed(5)}]
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem' }}>
                Review Your Donation ✅
              </h3>
              {[
                { label: 'Title',    val: form.title },
                { label: 'Type',     val: `${form.foodType} • ${form.category}` },
                { label: 'Quantity', val: `${form.quantity.amount} ${form.quantity.unit}` },
                { label: 'Servings', val: `${form.servings} people` },
                { label: 'Expiry',   val: form.expiryTime ? new Date(form.expiryTime).toLocaleString() : '-' },
                { label: 'Urgency',  val: form.urgency },
                { label: 'Location', val: form.pickupLocation?.address || '📍 Pinned on map' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 16px', background: '#F8F4EF', borderRadius: '10px'
                }}>
                  <span style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.9rem' }}>{r.label}</span>
                  <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{r.val}</span>
                </div>
              ))}

              {error && (
                <div style={{
                  background: 'rgba(239,71,111,0.1)', border: '2px solid rgba(239,71,111,0.3)',
                  borderRadius: '12px', padding: '14px', color: '#EF476F', fontWeight: 600
                }}>⚠️ {error}</div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '12px' }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{
              padding: '14px 28px', borderRadius: '12px', border: '2px solid #e5e7eb',
              background: '#fff', color: '#374151', fontWeight: 600, cursor: step === 0 ? 'not-allowed' : 'pointer',
              opacity: step === 0 ? 0.4 : 1, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.95rem'
            }}>← Back</button>

            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} style={{
                padding: '14px 32px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
                color: '#fff', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.95rem',
                boxShadow: '0 4px 15px rgba(255,107,53,0.4)'
              }}>Continue →</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{
                padding: '14px 32px', borderRadius: '12px', border: 'none',
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#06D6A0,#4ECDC4)',
                color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.95rem',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(6,214,160,0.4)'
              }}>{loading ? '⏳ Submitting...' : '🎉 Submit Donation'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
