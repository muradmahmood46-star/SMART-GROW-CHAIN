import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <h2 style={{ color: '#38bdf8', margin: 0 }}>🌱 Smart Grow Chain</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={s.navLink}>Login</Link>
          <Link to="/register" style={s.navBtn}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroContent}>
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
      <section style={s.section}>
        <h2 style={s.sectionTitle}>How It Works</h2>
        <p style={s.sectionSub}>Start earning in 3 simple steps</p>
        <div style={s.steps}>
          {[
            ['1', '📝 Register Free', 'Create your free account in seconds. No credit card required.'],
            ['2', '📺 View Ads', 'Browse available ads and click to view. Wait for the timer to complete.'],
            ['3', '💸 Get Paid', 'Earnings are instantly added to your wallet. Withdraw anytime.'],
          ].map(([num, title, desc]) => (
            <div key={num} style={s.step}>
              <div style={s.stepNum}>{num}</div>
              <h3 style={{ color: '#f1f5f9', marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ ...s.section, background: '#0f172a' }}>
        <h2 style={s.sectionTitle}>Why Choose PTC Pro?</h2>
        <div style={s.features}>
          {[
            ['💰', 'Instant Earnings', 'Earn money immediately after each ad view. No waiting, no delays.'],
            ['👥', 'Referral Bonuses', 'Invite friends and earn 10% from all their ad clicks forever.'],
            ['🔒', 'Secure Payments', 'Your earnings are safe. Withdraw via crypto, PayPal or bank transfer.'],
            ['📱', 'Any Device', 'Works on desktop, tablet and mobile. Earn anywhere, anytime.'],
            ['⚡', 'Fast Timer', 'Short ad timers from 5-30 seconds. Quick and easy to earn.'],
            ['🏆', 'Premium Plans', 'Upgrade for more ads, higher earnings and better rates.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={s.featureCard}>
              <div style={s.featureIcon}>{icon}</div>
              <h4 style={{ color: '#f1f5f9', marginBottom: 6 }}>{title}</h4>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Membership Plans */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Membership Plans</h2>
        <p style={s.sectionSub}>Choose the plan that fits you</p>
        <div style={s.plans}>
          {[
            { name: 'Free', price: '$0', color: '#64748b', features: ['5 ads/day', '$0.001 per click', '5% referral commission', 'Basic support'] },
            { name: 'Basic', price: '$5/mo', color: '#38bdf8', features: ['15 ads/day', '$0.003 per click', '8% referral commission', 'Priority support'], popular: true },
            { name: 'Premium', price: '$20/mo', color: '#f59e0b', features: ['50 ads/day', '$0.01 per click', '10% referral commission', 'VIP support'] },
          ].map(plan => (
            <div key={plan.name} style={{ ...s.planCard, border: `2px solid ${plan.popular ? plan.color : '#1e293b'}` }}>
              {plan.popular && <div style={{ ...s.popularBadge, background: plan.color }}>Most Popular</div>}
              <h3 style={{ color: plan.color, marginBottom: 4 }}>{plan.name}</h3>
              <h2 style={{ color: '#f1f5f9', margin: '0 0 20px 0', fontSize: 28 }}>{plan.price}</h2>
              {plan.features.map(f => <p key={f} style={s.planFeature}>✓ {f}</p>)}
              <Link to="/register" style={{ ...s.planBtn, background: plan.popular ? plan.color : 'transparent', color: plan.popular ? '#0f172a' : plan.color, border: `1px solid ${plan.color}` }}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <h2 style={{ color: '#f1f5f9', fontSize: 32, marginBottom: 12 }}>Ready to Start Earning?</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>Join thousands of users already earning daily with PTC Pro</p>
        <Link to="/register" style={s.heroBtnPrimary}>Create Free Account →</Link>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>© 2025 PTC Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}

const s = {
  page: { background: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#fff' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, background: '#0f172a', zIndex: 10 },
  navLink: { color: '#94a3b8', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 14 },
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
