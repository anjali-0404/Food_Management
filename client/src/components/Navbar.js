import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { label: '🏠 Home',       path: '/' },
    { label: '🍱 Donations',  path: '/donations' },
    { label: '🗺️ Map',        path: '/map' },
    { label: '🏆 Leaders',    path: '/leaderboard' },
    { label: '🤝 NGOs',       path: '/ngos' },
  ];

  return (
    <nav style={{
      position:   'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled
        ? 'rgba(26,26,46,0.97)'
        : 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom:   scrolled ? '1px solid rgba(255,107,53,0.3)' : 'none',
      transition: 'all 0.3s ease',
      padding:    '0 2rem',
    }}>
      <div style={{
        maxWidth: '1300px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '70px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF6B35, #FFC947)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', boxShadow: '0 4px 15px rgba(255,107,53,0.4)'
          }}>🍱</div>
          <div>
            <div style={{
              fontFamily: 'Playfair Display, serif', fontWeight: 900,
              fontSize: '1.4rem', color: '#fff',
              background: 'linear-gradient(135deg, #FF6B35, #FFC947)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>FoodBridge</div>
            <div style={{ fontSize: '0.6rem', color: '#4ECDC4', letterSpacing: '2px', textTransform: 'uppercase' }}>
              End Hunger Together
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
             className="nav-desktop">
          {navLinks.map(({ label, path }) => (
            <Link key={path} to={path} style={{
              textDecoration: 'none',
              padding: '8px 16px', borderRadius: '10px',
              color: location.pathname === path ? '#FF6B35' : '#d1d5db',
              background: location.pathname === path ? 'rgba(255,107,53,0.15)' : 'transparent',
              fontWeight: location.pathname === path ? 600 : 400,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { if (location.pathname !== path) e.target.style.color = '#fff'; }}
              onMouseLeave={e => { if (location.pathname !== path) e.target.style.color = '#d1d5db'; }}
            >{label}</Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              {user.role === 'donor' && (
                <Link to="/donate" style={{
                  textDecoration: 'none', padding: '10px 20px',
                  borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, #FF6B35, #FFC947)',
                  color: '#fff', boxShadow: '0 4px 15px rgba(255,107,53,0.4)',
                  transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}>+ Donate Food</Link>
              )}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setDropOpen(!dropOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '30px', padding: '6px 12px 6px 6px',
                  cursor: 'pointer', color: '#fff'
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4ECDC4, #06D6A0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.7rem' }}>▾</span>
                </button>
                {dropOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', padding: '8px', minWidth: '180px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    zIndex: 100
                  }}>
                    <Link to="/dashboard" onClick={() => setDropOpen(false)} style={{
                      display: 'block', padding: '10px 16px', color: '#d1d5db',
                      textDecoration: 'none', borderRadius: '10px', fontSize: '0.9rem',
                    }}>📊 Dashboard</Link>
                    <Link to="/profile" onClick={() => setDropOpen(false)} style={{
                      display: 'block', padding: '10px 16px', color: '#d1d5db',
                      textDecoration: 'none', borderRadius: '10px', fontSize: '0.9rem',
                    }}>👤 Profile</Link>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
                    <button onClick={handleLogout} style={{
                      display: 'block', width: '100%', padding: '10px 16px',
                      background: 'none', border: 'none', color: '#EF476F',
                      textAlign: 'left', cursor: 'pointer', borderRadius: '10px',
                      fontSize: '0.9rem', fontFamily: 'inherit'
                    }}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                textDecoration: 'none', color: '#d1d5db', fontWeight: 500,
                padding: '8px 16px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '0.9rem', transition: 'all 0.2s'
              }}>Login</Link>
              <Link to="/register" style={{
                textDecoration: 'none', padding: '10px 20px', borderRadius: '30px',
                fontWeight: 700, fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #FF6B35, #FFC947)',
                color: '#fff', boxShadow: '0 4px 15px rgba(255,107,53,0.4)'
              }}>Join Now</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
