import React from 'react';
import API from '../api';

export default function Advertisement({
  ads,
  earnings,
  activeAd,
  countdown,
  isWatching,
  tab,
  setTab,
  notify,
  startAd,
  kycData,
  setKycData,
  siteSettings,
  setAdPlanRequired,
  setAds,
  setEarnings,
  setTransactions,
  setActiveAd,
  setIsWatching,
  setReferralMsg,
  setDashboardMsg,
  setWithdrawalMsg,
  setAdvertiserMsg,
  setAdSectionMsg,
  setMinCampaignUsers
}) {
  const availableAds = ads.filter(a=>!a.already_clicked).length;
  const timerPct = activeAd ? ((activeAd.timer_seconds-countdown)/activeAd.timer_seconds)*100 : 0;
  const adRate = 1;

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">📺 Advertisement</h2>
        <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{availableAds} available today</span>
      </div>
      {siteSettings.ad_section_plan_required && (
        <div style={{background:'linear-gradient(135deg,#450a0a,#7f1d1d)',border:'1px solid #ef4444',borderRadius:16,padding:'32px 24px',textAlign:'center',maxWidth:480,margin:'0 auto'}}>
          <div style={{fontSize:52,marginBottom:12}}>📺</div>
          <h3 style={{color:'#fca5a5',fontSize:18,fontWeight:800,margin:'0 0 8px'}}>Plan Required</h3>
          <p style={{color:'var(--dim)',fontSize:13,margin:'0 0 20px',lineHeight:1.7}}>Please activate a plan first.</p>
          <button onClick={()=>setTab('plans')} style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)'}}>🏆 Activate Plan Now</button>
        </div>
      )}
      {!siteSettings.ad_section_plan_required && <>
        {siteSettings.ad_section_message?.trim() && (
          <div style={{background:'linear-gradient(135deg,#1c1000,#451a03)',border:'1px solid #f59e0b',borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
            <span style={{fontSize:18,flexShrink:0}}>📢</span>
            <p style={{color:'#fbbf24',fontSize:13,margin:0,lineHeight:1.7,fontWeight:600,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{siteSettings.ad_section_message}</p>
          </div>
        )}
        {activeAd && (
          <div className="sgc-timer-wrap" style={{marginBottom: 20}}>
            <div>
              <p style={{fontWeight:700,color:'var(--accent)',marginBottom:6}}>
                {isWatching ? '⏳ Watching...' : '⏸ Paused:'} {activeAd.title}
              </p>
              <div style={{width:200,height:5,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                <div style={{width:`${timerPct}%`,height:'100%',background:'linear-gradient(90deg,var(--accent),var(--green))',borderRadius:4,transition:'width 1s linear'}}/>
              </div>
            </div>
            <div className="sgc-timer-circle">{countdown}s</div>
          </div>
        )}
        <div className="sgc-ads-grid">
          {ads.filter(a=>!a.already_clicked).map((ad,i)=>(
            <div key={ad.id} className="sgc-ad-card" style={{animationDelay:`${i*.05}s`,border:ad.is_sponsored?'2px solid #f59e0b':'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div style={{flex:1,marginRight:8}}>
                  {ad.is_sponsored && <span style={{background:'#451a03',color:'#f59e0b',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,display:'inline-block',marginBottom:4}}>⭐ SPONSORED</span>}
                  <h4 style={{color:'var(--text)',fontSize:14,fontWeight:700,margin:0}}>{ad.title}</h4>
                </div>
                <span className="sgc-earn">Rs. {ad.earning_amount}</span>
              </div>
              {ad.description&&<p style={{color:'var(--dim)',fontSize:12,marginBottom:10}}>{ad.description}</p>}
              <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
                <span className="sgc-ad-meta">⏱ {ad.timer_seconds}s</span>
                <span className="sgc-ad-meta">👆 {ad.total_clicks} clicks</span>
              </div>
              {activeAd?.id===ad.id && (
                <div style={{marginBottom:10,background:'#0d1e38',border:'1px solid var(--accent)',borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
                  <div style={{flex:1}}>
                    <p style={{color:'var(--accent)',fontSize:12,fontWeight:700,margin:'0 0 4px'}}>{isWatching ? '⏳ Watching ad...' : '⏸ Paused - Click Continue'}</p>
                    <div style={{height:6,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                      <div style={{width:`${timerPct}%`,height:'100%',background:'linear-gradient(90deg,var(--accent),var(--green))',borderRadius:4,transition:'width 1s linear'}}/>
                    </div>
                  </div>
                  <div style={{fontSize:22,fontWeight:900,color:'var(--accent)',fontFamily:'monospace',minWidth:36,textAlign:'center'}}>{countdown}s</div>
                </div>
              )}
              <button className="sgc-click-btn"
                style={{background:'linear-gradient(135deg,var(--accent),var(--accent2))',color:'var(--bg)',cursor:!!activeAd&&activeAd.id!==ad.id?'not-allowed':'pointer'}}
                onClick={() => startAd(ad)} 
                disabled={!!activeAd&&activeAd.id!==ad.id}>
                {activeAd?.id===ad.id
                  ? '▶ Continue Ad'
                  : activeAd?'🔒 Complete active ad first':'▶ Click & Earn'}
              </button>
            </div>
          ))}
          {ads.filter(a=>!a.already_clicked).length===0&&<div className="sgc-empty">No ads available right now.<br/>Check back later!</div>}
        </div>

        {/* Today's Watch History */}
        {(()=>{
          const todayClicks = earnings.filter(e=>{ const d=new Date(e.clicked_at); return d.toDateString()===new Date().toDateString() && e.type==='click'; });
          const todayTotal = todayClicks.reduce((s,e)=>s+(e.amount||0),0);
          if(!todayClicks.length) return null;
          return (
            <div style={{marginTop:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                <h3 className="sgc-subheading" style={{margin:0}}>📋 Today's Watch History</h3>
                <div style={{background:'linear-gradient(135deg,#064e3b,#065f46)',border:'1px solid #166534',borderRadius:10,padding:'6px 16px',display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:14}}>💰</span>
                  <span style={{color:'var(--dim)',fontSize:12,fontWeight:600}}>Total Earned Today:</span>
                  <span style={{color:'#4ade80',fontSize:15,fontWeight:800,fontFamily:'monospace'}}>Rs. {todayTotal.toFixed(2)}</span>
                </div>
              </div>
              <div className="sgc-table-wrap">
                <table className="sgc-table">
                  <thead><tr><th className="sgc-th">#</th><th className="sgc-th">Ad</th><th className="sgc-th">Earned</th><th className="sgc-th">Time</th></tr></thead>
                  <tbody>{todayClicks.map((e,i)=>(
                    <tr key={i} className="sgc-tr">
                      <td className="sgc-td" style={{color:'var(--dim)',fontWeight:600}}>{i+1}</td>
                      <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>Ad #{e.ad_id}</td>
                      <td className="sgc-td" style={{color:'var(--green)',fontWeight:700}}>+Rs. {e.amount?.toFixed(2)}</td>
                      <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{new Date(e.clicked_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </>}
    </div>
  );
}