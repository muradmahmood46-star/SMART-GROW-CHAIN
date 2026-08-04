import React from 'react';
import HeroSlider from './HeroSlider';

export default function DashboardHome({
  profile,
  kycData,
  earnings,
  referrals,
  refBonus,
  availableAds,
  todayEarned,
  freePlanExpired,
  freePlanDaysLeft,
  siteSettings,
  dashboardMsg,
  adRate,
  transactions,
  showAllTx,
  setShowAllTx,
  setTab,
  notify
}) {
  if (!profile) return null;

  // Determine dynamic KYC Status from backend profile or kycData
  const isKycVerified = profile?.kyc_status === 'approved' || kycData?.kyc_status === 'approved';

  return (
    <div>
      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* Quick Balance + Deposit/Withdraw Card */}
      <div className="sgc-quick-balance">
        <div className="sgc-quick-balance-row">
          <div className="sgc-quick-bal-item">
            <div className="sgc-quick-bal-label">Available Balance</div>
            <div className="sgc-quick-bal-val" style={{color:'#0d9488'}}>Rs. {profile.balance.toFixed(2)}</div>
          </div>
          <div className="sgc-quick-bal-item">
            <div className="sgc-quick-bal-label">Total Earned</div>
            <div className="sgc-quick-bal-val" style={{color:'#0891b2'}}>Rs. {profile.total_earned.toFixed(2)}</div>
          </div>
          <div className="sgc-quick-bal-item">
            <div className="sgc-quick-bal-label">☀️ Today's Earning</div>
            <div className="sgc-quick-bal-val" style={{color:'#d97706'}}>Rs. {todayEarned.toFixed(2)}</div>
          </div>
        </div>
        <div className="sgc-quick-actions" style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <button className="sgc-quick-btn sgc-quick-btn-deposit" onClick={()=>setTab('transfer')}>
            <span className="sgc-quick-btn-icon">📲</span>
            <span>Deposit</span>
          </button>
          <button className="sgc-quick-btn sgc-quick-btn-withdraw" onClick={()=>setTab('payout')}>
            <span className="sgc-quick-btn-icon">💸</span>
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h2 className="sgc-heading" style={{margin:0}}>Dashboard</h2>
      </div>
      <div className="sgc-stats sgc-dashboard-stats">
        {[
          ['Ads Available',availableAds,'#7c3aed','📺',false],
          ['Total Clicks',earnings?.filter(e=>e.type==='click').length||0,'#0891b2','👆',false],
          ['Referrals',referrals?.total_referrals||0,'#059669','👥',false],
          ['Referral Bonus',`Rs. ${(refBonus?.total_bonus||0).toFixed(2)}`,'#db2777','🎁',false],
          ['Membership',profile.plan_active ? profile.membership.toUpperCase() : 'EXPIRED',profile.plan_active ? '#d97706' : '#ef4444','🏆',false],
        ].map(([l,v,c,icon,growth],i)=>(
          <div key={i} className="sgc-stat-card sgc-dashboard-stat-card" style={{borderLeftColor:c,'--stat-color':c}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
              <span style={{fontSize:16,background:`${c}18`,borderRadius:8,padding:'3px 6px'}}>{icon}</span>
              <div className="sgc-stat-label" style={{margin:0}}>{l}</div>
            </div>
            <div className="sgc-stat-val" style={{color:c}}>{v}</div>
            {growth && <span className="sgc-growth-badge">📈</span>}
          </div>
        ))}
        {siteSettings?.whatsapp_link && (
          <a href={siteSettings.whatsapp_link} target="_blank" rel="noreferrer" className="sgc-stat-card sgc-dashboard-stat-card sgc-whatsapp-stat-card">
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
              <span className="sgc-stat-card-icon sgc-whatsapp-icon" aria-label="WhatsApp">☎</span>
              <div className="sgc-stat-label" style={{margin:0}}>WhatsApp Group</div>
            </div>
            <div className="sgc-stat-val">Join Now →</div>
          </a>
        )}
      </div>

      {/* Quick Actions */}
      <h3 className="sgc-subheading" style={{marginBottom:12}}>Quick Actions</h3>

      {/* Advertise Big Button */}
      <button className="sgc-advertise-banner" onClick={()=>{ setTab('create-ad'); notify('ad-welcome'); }}
        style={{width:'100%',padding:'18px 20px',marginBottom:12,background:'linear-gradient(135deg,#f97316,#ea580c,#dc2626)',border:'none',borderRadius:16,color:'#fff',cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',gap:14,boxShadow:'0 4px 20px rgba(249,115,22,.4)',transition:'transform .2s,box-shadow .2s',animation:'fadeUp .3s ease both'}}
        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow='0 8px 28px rgba(249,115,22,.5)';}}
        onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 4px 20px rgba(249,115,22,.4)';}}>
        <div style={{width:48,height:48,borderRadius:12,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>📢</div>
        <div style={{textAlign:'left'}}>
          <p style={{margin:0,fontSize:16,fontWeight:800,letterSpacing:.3}}>Advertise Your Link</p>
          <p style={{margin:0,fontSize:12,opacity:.85,marginTop:2}}>Reach thousands of real members · Rs. {adRate}/member</p>
        </div>
        <span style={{marginLeft:'auto',fontSize:22,opacity:.8}}>→</span>
      </button>

      {/* Action Buttons Grid including Dynamic Account Status (KYC) Button */}
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
        {[
          ['📺','View Ads','ads'],
          ['📲','Deposit','transfer'],
          ['💸','Payout','payout'],
          ['🎫','Support','support']
        ].map(([icon,label,key])=>(
          <button className="sgc-bottom-action" key={key} onClick={()=>setTab(key)} style={{padding:'10px 18px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',cursor:'pointer',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6,transition:'all .2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            {icon} {label}
          </button>
        ))}

        {/* 5th Option: Dynamic "Account Status" (KYC) Button */}
        <button
          className="sgc-bottom-action sgc-kyc-status-btn"
          onClick={() => setTab('kyc')}
          style={{
            padding: '10px 18px',
            background: isKycVerified ? 'linear-gradient(135deg, #052e16, #064e3b)' : 'linear-gradient(135deg, #450a0a, #7f1d1d)',
            border: `1.5px solid ${isKycVerified ? '#22c55e' : '#ef4444'}`,
            borderRadius: 10,
            color: isKycVerified ? '#4ade80' : '#fca5a5',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: isKycVerified ? '0 4px 14px rgba(34,197,94,0.3)' : '0 4px 14px rgba(239,68,68,0.3)',
            transition: 'all .2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = isKycVerified ? '0 6px 18px rgba(34,197,94,0.45)' : '0 6px 18px rgba(239,68,68,0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isKycVerified ? '0 4px 14px rgba(34,197,94,0.3)' : '0 4px 14px rgba(239,68,68,0.3)';
          }}>
          <span style={{fontSize:15}}>{isKycVerified ? '✅' : '🛡️'}</span>
          <span>Account Status: <b>{isKycVerified ? 'KYC Verified' : 'Unverified Account'}</b></span>
        </button>
      </div>

      {/* Recent Transactions */}
      <h3 className="sgc-subheading" style={{marginBottom:12}}>Recent Transactions</h3>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr><th className="sgc-th">Type</th><th className="sgc-th">Amount</th><th className="sgc-th">Note</th><th className="sgc-th">Date</th></tr></thead>
          <tbody>{(showAllTx?transactions:transactions.slice(0,3)).map((t,i)=>(
            <tr key={i} className="sgc-tr">
              <td className="sgc-td"><span className="sgc-badge" style={{background:t.direction==='credit'?'#064e3b':'#450a0a'}}>{t.type}</span></td>
              <td className="sgc-td" style={{color:t.direction==='credit'?'var(--green)':'var(--red)',fontWeight:600}}>{t.direction==='credit'?'+':'-'}Rs. {t.amount?.toFixed(2)}</td>
              <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note}</td>
              <td className="sgc-td">{new Date(t.date).toLocaleString()}</td>
            </tr>
          ))}
          {transactions.length===0&&<tr><td colSpan={4} className="sgc-td" style={{textAlign:'center',padding:24}}>No transactions yet</td></tr>}
          </tbody>
        </table>
      </div>
      {transactions.length>3&&(
        <button onClick={()=>setShowAllTx(s=>!s)} style={{width:'100%',marginTop:8,padding:'10px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--accent)',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}}>
          {showAllTx?'▲ Show Less':'▼ Show More ('+( transactions.length-3)+' more)'}
        </button>
      )}

      {/* Dashboard Bottom Custom Message */}
      {dashboardMsg?.trim() &&(
        <section className="sgc-important-message" aria-label="Important message">
          <h3 className="sgc-important-message-heading">IMPORTANT MESSAGE</h3>
          <div className="sgc-important-ticker" role="status">
            <div className="sgc-important-ticker-old-title">
              <span style={{fontSize:20}}>📋</span>
              <span style={{color:'var(--accent)',fontWeight:800,fontSize:14,letterSpacing:.3}}>IMPORTANT NOTICE</span>
            </div>
            <p className="sgc-important-ticker-track" data-message={dashboardMsg}>{dashboardMsg}</p>
          </div>
        </section>
      )}
    </div>
  );
}