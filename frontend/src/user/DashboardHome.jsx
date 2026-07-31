import React from 'react';
import HeroSlider from './HeroSlider';

export default function DashboardHome({
  profile,
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

  return (
    <div>
      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* Free plan expiry warning */}
      {freePlanExpired && profile?.membership === 'free' && (
        <div style={{background:'linear-gradient(135deg,#450a0a,#7f1d1d)',border:'1px solid #ef4444',borderRadius:14,padding:'14px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12,boxShadow:'0 0 18px rgba(239,68,68,.18)'}}>
          <span style={{fontSize:24,filter:'drop-shadow(0 0 6px rgba(239,68,68,.7))'}}>⚠️</span>
          <div style={{flex:1}}>
            <p style={{color:'#fca5a5',fontWeight:700,fontSize:14,margin:0}}>Free Plan Expired!</p>
            <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Your free plan has expired. Please purchase a plan to continue earning.</p>
          </div>
          <button onClick={()=>setTab('plans')} style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',border:'none',borderRadius:10,padding:'8px 16px',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap',boxShadow:'0 4px 14px rgba(245,158,11,.4)',transition:'box-shadow .2s,transform .2s'}} onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 6px 20px rgba(245,158,11,.6)';e.currentTarget.style.transform='translateY(-1px)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 4px 14px rgba(245,158,11,.4)';e.currentTarget.style.transform='translateY(0)';}}>Buy Plan</button>
        </div>
      )}
      {!freePlanExpired && freePlanDaysLeft !== null && freePlanDaysLeft <= 3 && profile?.membership === 'free' && (
        <div style={{background:'#451a03',border:'1px solid #f59e0b',borderRadius:12,padding:'12px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:20}}></span>
          <p style={{color:'#fbbf24',fontSize:13,margin:0,fontWeight:600}}>Free plan expires in <b>{freePlanDaysLeft} day(s)</b>. Upgrade to keep earning!</p>
          <button onClick={()=>setTab('plans')} style={{marginLeft:'auto',background:'var(--yellow)',color:'var(--bg)',border:'none',borderRadius:8,padding:'6px 14px',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'var(--font)',whiteSpace:'nowrap'}}>Upgrade</button>
        </div>
      )}

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
        <div className="sgc-quick-actions">
          <button className="sgc-quick-btn sgc-quick-btn-deposit" onClick={()=>setTab('transfer')}><span className="sgc-quick-btn-icon">📲</span><span>Deposit</span></button>
          <button className="sgc-quick-btn sgc-quick-btn-withdraw" onClick={()=>setTab('payout')}><span className="sgc-quick-btn-icon">💸</span><span>Withdraw</span></button>
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
          ['Membership',profile.membership.toUpperCase(),'#d97706','🏆',false],
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
        {siteSettings.whatsapp_link && (
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
      <button className="sgc-advertise-banner" onClick={()=>{ setTab('create-ad'); notify('ad-welcome'); }} // Note: original also calls setShowAdWelcome(true) which is handled in parent or removed if not critical
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

      {/* Other Actions */}
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
        {[['📺','View Ads','ads'],['📲','Deposit','transfer'],['💸','Payout','payout'],['🎫','Support','support']].map(([icon,label,key])=>(
          <button className="sgc-bottom-action" key={key} onClick={()=>setTab(key)} style={{padding:'10px 18px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',cursor:'pointer',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6,transition:'all .2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            {icon} {label}
          </button>
        ))}
        {/* KYC status button - we'll need kycData passed or handle differently. For now keep minimal. */}
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