import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import './Landing.css';

export default function Landing() {
  const [plans, setPlans] = useState([]);
  const [showCookieNotice, setShowCookieNotice] = useState(false);

  useEffect(() => {
    API.get('/user/plans').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setShowCookieNotice(!localStorage.getItem('sgc-cookie-choice'));
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.14 }
    );
    document.querySelectorAll('.landing-reveal').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const saveCookieChoice = choice => {
    localStorage.setItem('sgc-cookie-choice', choice);
    setShowCookieNotice(false);
  };

  const planColors = ['#64748b', '#38bdf8', '#f59e0b', '#a78bfa'];
  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav} className="landing-nav">
        <h2 style={{ color: '#38bdf8', margin: 0 }}>🌱 Smart Grow Chain</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={s.navLoginBtn}>Login</Link>
          <Link to="/register" style={s.navBtn}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero} className="landing-hero">
        <div style={s.heroContent} className="landing-hero-content">
          <span style={s.heroBadge}>🚀 Earn Real Money Online</span>
          <h1 style={s.heroTitle}>Smart Grow <span style={{ color: '#38bdf8' }}>Chain</span></h1>
          <p style={s.heroSub}>Join thousands of users earning daily by simply viewing advertisements. Simple, fast, and 100% free to join.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={s.heroBtnPrimary}>Start Earning Now →</Link>
            <Link to="/login" style={s.heroBtnSecondary}>Login to Account</Link>
          </div>
          <div style={s.heroStats}>
            {[['10K+', 'Active Users'], ['$50K+', 'Paid Out'], ['500+', 'Daily Ads'], ['100%', 'Free to Join']].map(([val, label]) => (
              <div key={label} style={s.heroStat}>
                <h3 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>{val}</h3>
                <p style={{ color: '#64748b', margin: 0, fontSize: 12 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={s.section} className="landing-section landing-section-offwhite landing-reveal">
        <h2 style={s.sectionTitle} className="landing-section-title">How It Works</h2>
        <p style={s.sectionSub} className="landing-section-sub">Start earning in 3 simple steps</p>
        <div style={s.steps}>
          {[
            ['1', '📝 Register Free', 'Create your free account in seconds. No credit card required.'],
            ['2', '📺 View Ads', 'Browse available ads and click to view. Wait for the timer to complete.'],
            ['3', '💸 Get Paid', 'Earnings are instantly added to your wallet. Withdraw anytime.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={s.step} className="landing-card landing-reveal-item">
              <div style={s.stepNum}>{num}</div>
              <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ ...s.section, background: '#0f172a' }} className="landing-section landing-reveal">
        <h2 style={s.sectionTitle} className="landing-section-title">Why Choose SCG?</h2>
        <div style={s.features}>
          {[
            ['💰', 'Instant Earnings', 'Earn money immediately after each ad view. No waiting, no delays.'],
            ['👥', 'Referral Bonuses', 'Invite friends and earn 10% from all their ad clicks forever.'],
            ['🔒', 'Secure Payments', 'Your earnings are safe. Withdraw via crypto, PayPal or bank transfer.'],
            ['📱', 'Any Device', 'Works on desktop, tablet and mobile. Earn anywhere, anytime.'],
            ['⚡', 'Fast Timer', 'Short ad timers from 5-30 seconds. Quick and easy to earn.'],
            ['🏆', 'Premium Plans', 'Upgrade for more ads, higher earnings and better rates.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={s.featureCard} className="landing-card landing-reveal-item">
              <div style={s.featureIcon}>{icon}</div>
              <h4 style={{ color: '#f1f5f9', marginBottom: 6 }}>{title}</h4>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Membership Plans */}
      <section style={s.section} className="landing-section landing-reveal">
        <h2 style={s.sectionTitle} className="landing-section-title">Membership Plans</h2>
        <p style={s.sectionSub} className="landing-section-sub">Choose the plan that fits you</p>
        <div style={s.plans}>
          {plans.map((p, i) => {
            const col = planColors[i] || '#38bdf8';
            const isPopular = i === 1;
            return (
              <div key={p.id} style={{ ...s.planCard, border: `2px solid ${isPopular ? col : '#1e293b'}` }} className="landing-card landing-plan-card landing-reveal-item">
                {isPopular && <div style={{ ...s.popularBadge, background: col }}>Most Popular</div>}
                <h3 style={{ color: col, marginBottom: 4, textTransform: 'capitalize' }}>{p.name}</h3>
                <h2 style={{ color: '#f1f5f9', margin: '0 0 20px 0', fontSize: 28 }}>
                  {p.price === 0 ? 'Free' : `Rs. ${p.price}`}
                  {p.price > 0 && <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>/{p.period_days}d</span>}
                </h2>
                {[
                  `${p.daily_ads} ads/day`,
                  `Rs. ${p.earning_per_click} per click`,
                  `${(p.referral_commission * 100).toFixed(0)}% referral commission`,
                  `${p.referral_levels || 'N/A'} referral levels`,
                ].map(f => <p key={f} style={s.planFeature}>✓ {f}</p>)}
                <Link to="/register" style={{ ...s.planBtn, background: isPopular ? col : 'transparent', color: isPopular ? '#0f172a' : col, border: `1px solid ${col}` }}>
                  Get Started
                </Link>
              </div>
            );
          })}
          {plans.length === 0 && [0,1,2].map(i => (
            <div key={i} style={{ ...s.planCard, opacity: 0.4 }} className="landing-card landing-plan-card landing-reveal-item">
              <div style={{ height: 120, background: '#334155', borderRadius: 8 }} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta} className="landing-cta landing-reveal">
        <h2 style={{ color: '#f1f5f9', fontSize: 32, marginBottom: 12 }}>Ready to Start Earning?</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Join thousands of users already earning daily with PTC Pro</p>
        <Link to="/register" style={s.heroBtnPrimary}>Create Free Account →</Link>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={{ color: '#475569', fontSize: 13, margin: '0 0 6px 0' }}>© 2025 Smart Grow Chain. All rights reserved.</p>
        <p style={{ margin: 0, fontSize: 13 }}>
          Designed & Developed by{' '}
          <span style={{ color: '#f97316', fontWeight: 700, letterSpacing: '.3px' }}>TAMSAL TECHNOLOGIES</span>
        </p>
      </footer>

      {showCookieNotice && (
        <aside className="cookie-notice" role="dialog" aria-label="Cookie preferences">
          <div className="cookie-notice-icon">🍪</div>
          <div className="cookie-notice-copy">
            <strong>We use cookies</strong>
            <p>We use cookies to ensure that you get the best experience on our website.</p>
          </div>
          <div className="cookie-notice-actions">
            <button type="button" className="cookie-decline" onClick={() => saveCookieChoice('declined')}>Decline</button>
            <button type="button" className="cookie-accept" onClick={() => saveCookieChoice('accepted')}>Accept</button>
          </div>
        </aside>
      )}
    </div>
  );
}

const s = {
  page: { background: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#fff' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, background: '#0f172a', zIndex: 10 },
  navLink: { color: '#94a3b8', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 14 },
  navLoginBtn: { background: '#22c55e', color: '#fff', textDecoration: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 'bold', fontSize: 14, boxShadow: '0 2px 10px rgba(34,197,94,.4)' },
  navBtn: { background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 'bold', fontSize: 14 },
  hero: { padding: '80px 24px', textAlign: 'center', background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 70%)' },
  heroContent: { maxWidth: 700, margin: '0 auto' },
  heroBadge: { background: '#1e293b', color: '#38bdf8', padding: '6px 16px', borderRadius: 20, fontSize: 13, border: '1px solid #334155' },
  heroTitle: { fontSize: 52, fontWeight: 800, margin: '20px 0 16px 0', lineHeight: 1.1 },
  heroSub: { color: '#94a3b8', fontSize: 18, marginBottom: 32, lineHeight: 1.6 },
  heroBtnPrimary: { background: '#38bdf8', color: '#0f172a', textDecoration: 'none', padding: '14px 28px', borderRadius: 10, fontWeight: 'bold', fontSize: 15 },
  heroBtnSecondary: { background: 'transparent', color: '#94a3b8', textDecoration: 'none', padding: '14px 28px', borderRadius: 10, border: '1px solid #334155', fontSize: 15 },
  heroStats: { display: 'flex', justifyContent: 'center', gap: 40, marginTop: 48, flexWrap: 'wrap' },
  heroStat: { textAlign: 'center' },
  section: { padding: '80px 48px', background: '#1e293b' },
  sectionTitle: { textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#f1f5f9' },
  sectionSub: { textAlign: 'center', color: '#64748b', marginBottom: 48 },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' },
  step: { background: '#0f172a', padding: 32, borderRadius: 16, textAlign: 'center', border: '1px solid #334155' },
  stepNum: { width: 48, height: 48, background: '#38bdf8', color: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20, margin: '0 auto 16px' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 1000, margin: '0 auto' },
  featureCard: { background: '#1e293b', padding: 24, borderRadius: 12, border: '1px solid #334155' },
  featureIcon: { fontSize: 28, marginBottom: 12 },
  plans: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto' },
  planCard: { background: '#1e293b', padding: 28, borderRadius: 16, textAlign: 'center', position: 'relative' },
  popularBadge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '2px 16px', borderRadius: 20, fontSize: 11, color: '#0f172a', fontWeight: 'bold', whiteSpace: 'nowrap' },
  planFeature: { color: '#94a3b8', fontSize: 13, textAlign: 'left', margin: '0 0 8px 0' },
  planBtn: { display: 'block', marginTop: 20, padding: '10px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 14 },
  cta: { padding: '80px 24px', textAlign: 'center', background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 70%)' },
  footer: { padding: '24px 48px', borderTop: '1px solid #1e293b', textAlign: 'center' },
};
