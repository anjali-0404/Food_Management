import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%', padding: '14px 18px', borderRadius: '12px',
  border: '2px solid #e5e7eb', fontSize: '0.95rem',
  fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none',
  transition: 'border-color 0.2s', background: '#fff', color: '#1A1A2E'
};

export const LoginPage = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '70px',
      background: 'linear-gradient(135deg,#1A1A2E 0%,#16213E 50%,#0F3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 2rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: '28px', padding: '48px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍱</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '6px' }}>
            Welcome Back
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Login to continue making a difference</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '2px solid #FECACA', borderRadius: '12px', padding: '12px 16px', color: '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>Email Address</label>
            <input type="email" style={inputStyle} placeholder="your@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              required onFocus={e => e.target.style.borderColor = '#FF6B35'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>Password</label>
            <input type="password" style={inputStyle} placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required onFocus={e => e.target.style.borderColor = '#FF6B35'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '16px', borderRadius: '12px', border: 'none',
            background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#FF6B35,#FFC947)',
            color: '#fff', fontWeight: 800, fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(255,107,53,0.4)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px'
          }}>{loading ? '⏳ Logging in...' : '🚀 Login'}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6B7280', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#FF6B35', fontWeight: 700, textDecoration: 'none' }}>
            Register here →
          </Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register }     = useAuth();
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: searchParams.get('role') || 'donor',
    ngoDetails: { registrationNo: '', description: '', website: '', servingArea: '' }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '70px',
      background: 'linear-gradient(135deg,#1A1A2E 0%,#16213E 50%,#0F3460 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 2rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: '28px', padding: '48px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🌟</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', marginBottom: '6px' }}>
            Join FoodBridge
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Start making a difference today</p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '14px', padding: '4px', marginBottom: '28px' }}>
          {[
            { val: 'donor', icon: '❤️', label: 'Food Donor' },
            { val: 'ngo',   icon: '🏢', label: 'NGO / Trust' },
          ].map(r => (
            <button key={r.val} onClick={() => setForm({ ...form, role: r.val })} style={{
              flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
              background: form.role === r.val
                ? 'linear-gradient(135deg,#FF6B35,#FFC947)' : 'transparent',
              color: form.role === r.val ? '#fff' : '#6B7280',
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s',
              fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.9rem',
              boxShadow: form.role === r.val ? '0 4px 12px rgba(255,107,53,0.3)' : 'none'
            }}>{r.icon} {r.label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '2px solid #FECACA', borderRadius: '12px', padding: '12px 16px', color: '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          {[
            { key: 'name',     label: 'Full Name',        type: 'text',  placeholder: 'Your full name' },
            { key: 'email',    label: 'Email Address',    type: 'email', placeholder: 'your@email.com' },
            { key: 'phone',    label: 'Phone Number',     type: 'tel',   placeholder: '+91 98765 43210' },
            { key: 'password', label: 'Password',         type: 'password', placeholder: 'Min. 6 characters' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                style={{ ...inputStyle, padding: '12px 16px' }}
                value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required={f.key !== 'phone'}
                onFocus={e => e.target.style.borderColor = '#FF6B35'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          ))}

          {/* NGO Extra Fields */}
          {form.role === 'ngo' && (
            <>
              <div style={{ padding: '16px', background: '#F0FDF4', borderRadius: '12px', border: '2px solid rgba(6,214,160,0.3)' }}>
                <div style={{ fontWeight: 700, color: '#059669', marginBottom: '12px', fontSize: '0.9rem' }}>🏢 NGO Details</div>
                {[
                  { key: 'registrationNo', label: 'Registration No.',  placeholder: 'NGO Reg. Number' },
                  { key: 'servingArea',    label: 'Serving Area',       placeholder: 'e.g., South Mumbai' },
                  { key: 'website',        label: 'Website (optional)', placeholder: 'https://...' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>{f.label}</label>
                    <input placeholder={f.placeholder}
                      style={{ ...inputStyle, padding: '10px 14px', fontSize: '0.85rem' }}
                      value={form.ngoDetails[f.key]}
                      onChange={e => setForm({ ...form, ngoDetails: { ...form.ngoDetails, [f.key]: e.target.value } })}
                      onFocus={e => e.target.style.borderColor = '#06D6A0'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '0.8rem', color: '#374151' }}>About your NGO</label>
                  <textarea placeholder="Describe your NGO's mission and work..."
                    style={{ ...inputStyle, padding: '10px 14px', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical' }}
                    value={form.ngoDetails.description}
                    onChange={e => setForm({ ...form, ngoDetails: { ...form.ngoDetails, description: e.target.value } })}
                    onFocus={e => e.target.style.borderColor = '#06D6A0'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '16px', borderRadius: '12px', border: 'none',
            background: loading ? '#9CA3AF' : 'linear-gradient(135deg,#FF6B35,#FFC947)',
            color: '#fff', fontWeight: 800, fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(255,107,53,0.4)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px'
          }}>{loading ? '⏳ Registering...' : '🌟 Create Account'}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6B7280', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#FF6B35', fontWeight: 700, textDecoration: 'none' }}>
            Login →
          </Link>
        </p>
      </div>
    </div>
  );
};
