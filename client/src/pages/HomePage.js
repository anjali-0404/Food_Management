import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../utils/api';

const StatCard = ({ icon, value, label, color, delay }) => (
  <div style={{
    background: '#fff', borderRadius: '20px', padding: '28px 24px',
    textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    border: `2px solid ${color}20`,
    animation: `fadeUp 0.6s ease ${delay}s forwards`, opacity: 0,
    transition: 'transform 0.3s, box-shadow 0.3s'
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${color}30`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; }}
  >
    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{icon}</div>
    <div style={{
      fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', fontWeight: 900,
      background: `linear-gradient(135deg, ${color}, ${color}99)`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: '6px'
    }}>{value?.toLocaleString() || '0'}</div>
    <div style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 500 }}>{label}</div>
  </div>
);

const FoodTypeCard = ({ emoji, label, color }) => (
  <div style={{
    background: `linear-gradient(135deg, ${color}15, ${color}05)`,
    border: `2px solid ${color}25`, borderRadius: '16px',
    padding: '20px', textAlign: 'center', cursor: 'pointer',
    transition: 'all 0.3s'
  }}
    onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${color}30, ${color}10)`; e.currentTarget.style.transform = 'scale(1.05)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${color}15, ${color}05)`; e.currentTarget.style.transform = 'scale(1)'; }}
  >
    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{label}</div>
  </div>
);

const HowStep = ({ step, icon, title, desc, color }) => (
  <div style={{ textAlign: 'center', padding: '0 20px' }}>
    <div style={{
      width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 20px',
      background: `linear-gradient(135deg, ${color}, ${color}99)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '2rem', boxShadow: `0 8px 25px ${color}40`,
      position: 'relative'
    }}>
      {icon}
      <div style={{
        position: 'absolute', top: '-8px', right: '-8px',
        width: '28px', height: '28px', borderRadius: '50%',
        background: '#fff', border: `3px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', fontWeight: 800, color
      }}>{step}</div>
    </div>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: '10px' }}>{title}</h3>
    <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
  </div>
);

const HomePage = () => {
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [counter, setCounter] = useState({ meals: 0, donors: 0, ngos: 0, donations: 0 });

  useEffect(() => {
    getStats().then(res => {
      setStats(res.data.stats);
      setRecent(res.data.recentDonations || []);
      // Animate counters
      const s = res.data.stats;
      const duration = 2000, steps = 60;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const p = step / steps;
        setCounter({
          meals:     Math.floor((s.mealsServed      || 0) * p),
          donors:    Math.floor((s.totalDonors       || 0) * p),
          ngos:      Math.floor((s.totalNGOs         || 0) * p),
          donations: Math.floor((s.totalDonations    || 0) * p),
        });
        if (step >= steps) clearInterval(timer);
      }, duration / steps);
    }).catch(() => {});
  }, []);

  return (
    <div style={{ paddingTop: '70px' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 40%, #0F3460 100%)',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Floating blobs */}
        {[
          { top: '10%', left: '5%',  color: '#FF6B3530', size: 400 },
          { top: '60%', right: '5%', color: '#4ECDC430', size: 300 },
          { top: '30%', right: '20%',color: '#FFC94720', size: 200 },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: b.size, height: b.size,
            background: b.color, filter: 'blur(60px)',
            top: b.top, left: b.left, right: b.right,
            animation: `float ${3 + i}s ease-in-out infinite`,
            pointerEvents: 'none'
          }} />
        ))}

        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '80px 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', width: '100%' }}>
          {/* Left */}
          <div style={{ animation: 'fadeUp 0.8s ease forwards' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: '30px', padding: '8px 18px', marginBottom: '24px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF6B35', display: 'block', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#FF6B35', fontSize: '0.85rem', fontWeight: 600 }}>
                Fighting Hunger Across India
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: 1.15, marginBottom: '24px', color: '#fff'
            }}>
              Bridge the Gap
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #FF6B35, #FFC947)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>Between Food & Hope</span>
            </h1>

            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '36px', maxWidth: '480px' }}>
              Every day, tonnes of food go to waste while millions sleep hungry.
              <strong style={{ color: '#4ECDC4' }}> FoodBridge</strong> connects generous donors
              with verified NGOs using real-time GPS — ensuring food reaches those who need it most, fast.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/donate" style={{
                textDecoration: 'none', padding: '16px 32px', borderRadius: '50px',
                background: 'linear-gradient(135deg, #FF6B35, #FFC947)',
                color: '#fff', fontWeight: 800, fontSize: '1rem',
                boxShadow: '0 8px 30px rgba(255,107,53,0.5)',
                transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px'
              }}>🍱 Donate Food Now</Link>

              <Link to="/register?role=ngo" style={{
                textDecoration: 'none', padding: '16px 32px', borderRadius: '50px',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                border: '2px solid rgba(78,205,196,0.4)',
                color: '#4ECDC4', fontWeight: 700, fontSize: '1rem',
                transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px'
              }}>🤝 Register NGO</Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '40px', flexWrap: 'wrap' }}>
              {[
                { icon: '✅', label: 'Verified NGOs' },
                { icon: '📡', label: 'Real-time GPS' },
                { icon: '🔒', label: '100% Secure' },
                { icon: '🆓', label: 'Free to Use' },
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{b.icon}</span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Floating card display */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: '320px', height: '380px',
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '16px',
              animation: 'float 4s ease-in-out infinite'
            }}>
              <div style={{ fontSize: '5rem' }}>🍱</div>
              <div style={{ color: '#fff', fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', textAlign: 'center', padding: '0 24px' }}>
                Every Meal Shared<br />
                <span style={{ background: 'linear-gradient(135deg,#FF6B35,#FFC947)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>
                  Changes A Life
                </span>
              </div>
              <div style={{
                background: 'linear-gradient(135deg,#FF6B35,#FFC947)',
                borderRadius: '50px', padding: '10px 24px', color: '#fff',
                fontWeight: 700, fontSize: '0.9rem'
              }}>
                🌟 {counter.meals.toLocaleString()}+ Meals Served
              </div>
            </div>

            {/* Floating mini cards */}
            {[
              { emoji: '🏆', text: `${counter.donors}+ Donors`, style: { top: '10%', left: '-15%', background: 'linear-gradient(135deg,#4ECDC4,#06D6A0)' } },
              { emoji: '🤝', text: `${counter.ngos}+ NGOs`, style: { bottom: '15%', right: '-10%', background: 'linear-gradient(135deg,#7B2D8B,#EF476F)' } },
              { emoji: '📦', text: `${counter.donations}+ Donations`, style: { bottom: '5%', left: '-5%', background: 'linear-gradient(135deg,#FFC947,#FF6B35)' } },
            ].map((c, i) => (
              <div key={i} style={{
                position: 'absolute', ...c.style,
                borderRadius: '16px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                animation: `float ${3 + i * 0.7}s ease-in-out ${i * 0.5}s infinite`
              }}>
                <span style={{ fontSize: '1.2rem' }}>{c.emoji}</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #FF6B35, #FFC947)',
        padding: '40px 2rem'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px', textAlign: 'center' }}>
          {[
            { val: counter.meals.toLocaleString() + '+', label: 'Meals Served', icon: '🍽️' },
            { val: counter.donors + '+',   label: 'Food Donors',   icon: '❤️' },
            { val: counter.ngos + '+',     label: 'NGO Partners',  icon: '🏢' },
            { val: counter.donations + '+',label: 'Donations',     icon: '📦' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{s.val}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 2rem', background: '#F8F4EF' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ color: '#FF6B35', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>Simple Process</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', marginBottom: '16px' }}>How FoodBridge Works</h2>
            <p style={{ color: '#6B7280', maxWidth: '500px', margin: '0 auto' }}>From donation to delivery in minutes — powered by GPS tracking</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            <HowStep step={1} icon="📝" title="Register & List" color="#FF6B35"
              desc="Donors register and list surplus food with photos, quantity, and expiry time." />
            <HowStep step={2} icon="📡" title="GPS Pin Location" color="#4ECDC4"
              desc="Share your exact GPS coordinates for precise and fast pickup coordination." />
            <HowStep step={3} icon="🏢" title="NGO Gets Notified" color="#FFC947"
              desc="Nearby verified NGOs receive instant alerts and can claim the donation." />
            <HowStep step={4} icon="🎉" title="Food Delivered" color="#06D6A0"
              desc="The NGO picks up and distributes food to those who need it most." />
          </div>
        </div>
      </section>

      {/* ── FOOD TYPES ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 2rem', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', marginBottom: '12px' }}>
              What Can You Donate?
            </h2>
            <p style={{ color: '#6B7280' }}>We accept all types of safe, edible food</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '12px' }}>
            {[
              { emoji: '🍛', label: 'Cooked Food',   color: '#FF6B35' },
              { emoji: '🌾', label: 'Raw Grains',     color: '#FFC947' },
              { emoji: '📦', label: 'Packaged',       color: '#4ECDC4' },
              { emoji: '🥛', label: 'Dairy',          color: '#06D6A0' },
              { emoji: '🥖', label: 'Bakery',         color: '#7B2D8B' },
              { emoji: '🥦', label: 'Fruits & Veg',   color: '#EF476F' },
              { emoji: '🧃', label: 'Beverages',      color: '#0EA5E9' },
              { emoji: '🍫', label: 'Other',          color: '#F59E0B' },
            ].map(f => <FoodTypeCard key={f.label} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '100px 2rem',
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,107,53,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(78,205,196,0.1) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'wave 2s ease-in-out infinite' }}>🙏</div>
          <h2 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            color: '#fff', marginBottom: '20px'
          }}>
            Your Extra Food Can End<br />
            <span style={{ background: 'linear-gradient(135deg,#FF6B35,#FFC947)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Someone's Hunger Today
            </span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
            Join thousands of donors and NGOs working together to build a hunger-free India.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/donate" style={{
              textDecoration: 'none', padding: '18px 40px', borderRadius: '50px',
              background: 'linear-gradient(135deg, #FF6B35, #FFC947)',
              color: '#fff', fontWeight: 800, fontSize: '1.1rem',
              boxShadow: '0 10px 40px rgba(255,107,53,0.5)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>🍱 Start Donating</Link>
            <Link to="/donations" style={{
              textDecoration: 'none', padding: '18px 40px', borderRadius: '50px',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.2)',
              color: '#fff', fontWeight: 700, fontSize: '1.1rem'
            }}>📋 Browse Donations</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0F0F1A', padding: '60px 2rem 30px', color: '#64748b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🍱</span>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', background: 'linear-gradient(135deg,#FF6B35,#FFC947)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>FoodBridge</span>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8 }}>
                Connecting food donors with NGOs through technology to reduce hunger and food waste in India.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Donate Food', 'Find Donations', 'GPS Map', 'Leaderboard'] },
              { title: 'For NGOs', links: ['Register NGO', 'Accept Donations', 'Track Pickups', 'Dashboard'] },
              { title: 'Support', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', fontSize: '0.9rem' }}>{col.title}</div>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: '10px' }}>
                    <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#FF6B35'}
                      onMouseLeave={e => e.target.style.color = '#64748b'}>{l}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem' }}>© 2024 FoodBridge. Built with ❤️ to fight hunger.</span>
            <span style={{ fontSize: '0.85rem' }}>🇮🇳 Made in India | MERN Stack</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes wave { 0%,100% { transform:rotate(0deg); } 25% { transform:rotate(20deg); } 75% { transform:rotate(-20deg); } }
        @media (max-width:768px) {
          section > div { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
