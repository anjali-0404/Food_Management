import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyDonations, getStats, getLeaderboard } from '../utils/api';
import { useAuth } from '../context/AuthContext';

// ── DASHBOARD ────────────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const { user }   = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats,    setStats]      = useState(null);
  const [loading,  setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      getMyDonations().catch(() => ({ data: { donations: [] } })),
      getStats().catch(() => ({ data: { stats: null } }))
    ]).then(([dRes, sRes]) => {
      setDonations(dRes.data.donations || []);
      setStats(sRes.data.stats);
      setLoading(false);
    });
  }, []);

  const statusColors = {
    pending:   '#FFC947', accepted: '#4ECDC4', picked: '#7B2D8B',
    delivered: '#06D6A0', completed: '#06D6A0', expired: '#EF476F', cancelled: '#9CA3AF'
  };

  if (loading) return (
    <div style={{ paddingTop: '120px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
      <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', background: '#F8F4EF' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1A1A2E,#16213E)', padding: '48px 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', boxShadow: '0 8px 25px rgba(255,107,53,0.4)'
            }}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#fff', marginBottom: '4px' }}>
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {user?.role === 'donor' ? '❤️ Food Donor' : '🏢 NGO Partner'} •{' '}
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Personal Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            {[
              { label: 'Total Donations',  val: user?.totalDonations || 0,   icon: '📦', color: '#FF6B35' },
              { label: 'Meals Served',     val: user?.totalMealsServed || 0, icon: '🍽️', color: '#06D6A0' },
              { label: 'Lives Impacted',   val: Math.floor((user?.totalMealsServed || 0) / 3), icon: '❤️', color: '#EF476F' },
              { label: 'Badges Earned',    val: user?.badges?.length || 0,   icon: '🏆', color: '#FFC947' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                padding: '20px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{
                  fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900,
                  background: `linear-gradient(135deg,${s.color},${s.color}99)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>{s.val.toLocaleString()}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 2rem' }}>
        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { icon: '🍱', label: 'Donate Food',      path: '/donate',   color: '#FF6B35', desc: 'List surplus food' },
            { icon: '🗺️', label: 'View Map',         path: '/map',      color: '#4ECDC4', desc: 'GPS donation map' },
            { icon: '📋', label: 'Browse Donations', path: '/donations',color: '#06D6A0', desc: 'All listings' },
          ].map(a => (
            <Link key={a.label} to={a.path} style={{
              textDecoration: 'none', background: '#fff', borderRadius: '20px',
              padding: '24px', display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: `2px solid ${a.color}20`, transition: 'all 0.3s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${a.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: `linear-gradient(135deg,${a.color}20,${a.color}10)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem'
              }}>{a.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '1rem' }}>{a.label}</div>
                <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* My Donations */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem' }}>
              {user?.role === 'donor' ? 'My Donations' : 'Assigned Donations'} 📦
            </h2>
            <Link to="/donate" style={{
              textDecoration: 'none', padding: '10px 20px', borderRadius: '20px',
              background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem'
            }}>+ New Donation</Link>
          </div>

          {donations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
              <p style={{ color: '#6B7280' }}>No donations yet. Start by donating food!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {donations.slice(0, 10).map(d => (
                <div key={d._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: '14px', background: '#F8F4EF',
                  border: '1px solid rgba(0,0,0,0.06)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: '0.95rem', marginBottom: '4px' }}>{d.title}</div>
                    <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                      🍽️ {d.servings} servings • {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                      background: (statusColors[d.status] || '#9CA3AF') + '20',
                      color: statusColors[d.status] || '#9CA3AF'
                    }}>{d.status}</span>
                    <Link to={`/donations/${d._id}`} style={{
                      color: '#FF6B35', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem'
                    }}>View →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};

// ── LEADERBOARD ──────────────────────────────────────────────────────────────
export const LeaderboardPage = () => {
  const [donors,  setDonors]  = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLeaderboard(), getStats()]).then(([lRes, sRes]) => {
      setDonors(lRes.data.donors || []);
      setStats(sRes.data.stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];
  const rankColors = ['#FFC947', '#9CA3AF', '#CD7C4A'];

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', background: 'linear-gradient(135deg,#F8F4EF,#fff)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1A1A2E,#16213E,#0F3460)',
        padding: '60px 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(255,107,53,0.15) 0%,transparent 50%)' }} />
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#fff', marginBottom: '12px', position: 'relative' }}>
          🏆 Hunger Heroes Leaderboard
        </h1>
        <p style={{ color: '#94a3b8', position: 'relative' }}>Celebrating those who fight hunger every day</p>

        {/* Global Stats */}
        {stats && (
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap', position: 'relative' }}>
            {[
              { val: (stats.mealsServed || 0).toLocaleString(), label: 'Total Meals', icon: '🍽️' },
              { val: (stats.totalDonors || 0).toLocaleString(),  label: 'Donors',      icon: '❤️' },
              { val: (stats.totalNGOs || 0).toLocaleString(),    label: 'NGOs',        icon: '🏢' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', padding: '16px 28px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 900, color: '#FFC947' }}>{s.val}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 2rem' }}>
        {/* Top 3 Podium */}
        {donors.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '16px', marginBottom: '48px' }}>
            {[donors[1], donors[0], donors[2]].map((d, i) => {
              const rankIdx = i === 0 ? 1 : i === 1 ? 0 : 2;
              const height = ['160px', '200px', '130px'][i];
              return (
                <div key={d._id} style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{medals[rankIdx]}</div>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 8px',
                    background: `linear-gradient(135deg,${rankColors[rankIdx]},${rankColors[rankIdx]}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                    boxShadow: `0 6px 20px ${rankColors[rankIdx]}40`
                  }}>{d.name?.charAt(0)}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>{d.name}</div>
                  <div style={{ color: '#6B7280', fontSize: '0.8rem', marginBottom: '8px' }}>
                    🍽️ {(d.totalMealsServed || 0).toLocaleString()} meals
                  </div>
                  <div style={{
                    height, background: `linear-gradient(180deg,${rankColors[rankIdx]},${rankColors[rankIdx]}80)`,
                    borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'center', paddingTop: '12px', color: '#fff', fontWeight: 800,
                    fontSize: '1.2rem'
                  }}>#{rankIdx + 1}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full List */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '8px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} style={{ height: '72px', margin: '4px', borderRadius: '14px', background: '#f0f0f0', animation: 'shimmer 1.5s infinite' }} />
            ))
          ) : (
            donors.map((d, i) => (
              <div key={d._id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px 20px', borderRadius: '16px', margin: '4px',
                background: i < 3 ? `${rankColors[i]}08` : 'transparent',
                border: i < 3 ? `1px solid ${rankColors[i]}25` : '1px solid transparent',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: i < 3
                    ? `linear-gradient(135deg,${rankColors[i]},${rankColors[i]}88)`
                    : 'linear-gradient(135deg,#e5e7eb,#d1d5db)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: i < 3 ? '#fff' : '#6B7280', fontSize: '0.9rem'
                }}>{i < 3 ? medals[i] : `#${i + 1}`}</div>

                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 800, color: '#fff'
                }}>{d.name?.charAt(0)}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1A1A2E' }}>{d.name}</div>
                  <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                    📦 {d.totalDonations || 0} donations
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 900,
                    color: i < 3 ? rankColors[i] : '#374151'
                  }}>{(d.totalMealsServed || 0).toLocaleString()}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>meals served</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  );
};
