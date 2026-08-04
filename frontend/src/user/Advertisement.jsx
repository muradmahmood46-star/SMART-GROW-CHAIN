/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

export default function Advertisement({
  ads,
  earnings,
  tab,
  setTab,
  notify,
  kycData,
  siteSettings,
  setAds,
  loadData,
  profile,
  adPlanRequired
}) {
  const availableAds = ads.filter(a=>!a.already_clicked).length;
  
  const [activeAd, setActiveAd] = useState(() => { try { return JSON.parse(sessionStorage.getItem('sgc_active_ad')); } catch { return null; } });
  const [countdown, setCountdown] = useState(() => parseInt(sessionStorage.getItem('sgc_ad_countdown')) || 0);
  const [isWatching, setIsWatching] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(10);
  const isCompletingRef = React.useRef(false);

  const handleReturnToSite = useCallback(() => {
    const hiddenAt = parseInt(sessionStorage.getItem('sgc_hidden_at'));
    if (hiddenAt) {
      const elapsed = (Date.now() - hiddenAt) / 1000;
      if (elapsed > 0) {
        setCountdown(prev => {
          const newC = Math.max(0, prev - elapsed);
          sessionStorage.setItem('sgc_ad_countdown', Math.ceil(newC));
          return Math.ceil(newC);
        });
      }
      sessionStorage.removeItem('sgc_hidden_at');
    }
    setIsWatching(false);
  }, []);

  useEffect(()=>{
    handleReturnToSite();
    const onVis = () => { if (!document.hidden) { handleReturnToSite(); } };
    const onFocus = () => { handleReturnToSite(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  },[handleReturnToSite]);

  useEffect(() => {
    let t;
    if (isWatching && activeAd) {
      t = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 0) return 0;
          const newC = prev - 1;
          sessionStorage.setItem('sgc_ad_countdown', newC);
          return newC;
        });
        sessionStorage.setItem('sgc_hidden_at', Date.now());
      }, 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [isWatching, activeAd]);

  const startAd = async (ad) => {
    if (ad.already_clicked) return;
    if (activeAd && activeAd.id !== ad.id) {
      notify("You are already watching an ad. Please complete it first.", "error");
      return;
    }
    try {
      if (!activeAd || activeAd.id !== ad.id) {
        await API.post(`/user/click/start/${ad.id}`);
        setActiveAd(ad);
        setCountdown(ad.timer_seconds);
        sessionStorage.setItem('sgc_active_ad', JSON.stringify(ad));
        sessionStorage.setItem('sgc_ad_countdown', ad.timer_seconds);
      }
      setIsWatching(true);
      sessionStorage.setItem('sgc_hidden_at', Date.now());
      window.location.href = ad.url;
    } catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  useEffect(()=>{
    if (!activeAd) return;
    if (countdown <= 0 && !isCompletingRef.current){
      isCompletingRef.current = true;
      API.post(`/user/click/complete/${activeAd.id}`)
        .then(r=>{
          notify(`+Rs. ${r.data.amount.toFixed(2)} earned! 🎉`);
          setActiveAd(null);
          setIsWatching(false);
          isCompletingRef.current = false;
          sessionStorage.removeItem('sgc_active_ad');
          sessionStorage.removeItem('sgc_ad_countdown');
          sessionStorage.removeItem('sgc_hidden_at');
          if(loadData) loadData(); // Reloads profile, ads, earnings, transactions
        })
        .catch(err=>{ 
          notify(err.response?.data?.detail||'Error','error'); 
          setActiveAd(null); 
          setIsWatching(false); 
          isCompletingRef.current = false;
          sessionStorage.removeItem('sgc_active_ad'); 
          sessionStorage.removeItem('sgc_hidden_at'); 
        });
    }
  },[countdown,activeAd,loadData,notify]);

  const timerPct = activeAd ? ((activeAd.timer_seconds-countdown)/activeAd.timer_seconds)*100 : 0;

  const now = new Date();
  const parseUTCDate = (str) => {
    if (!str) return null;
    try {
      const s = String(str).trim();
      if (!s) return null;
      if (s.includes('T') || s.includes('Z')) return new Date(s);
      return new Date(s.replace(' ', 'T') + 'Z');
    } catch { return null; }
  };

  const freeExpiry = parseUTCDate(profile?.free_plan_expires_at);
  const paidExpiry = parseUTCDate(profile?.plan_expires_at);
  const isFreeValid = Boolean(profile?.membership === 'free' && freeExpiry && freeExpiry > now);
  const isPaidValid = Boolean(profile?.membership && profile?.membership !== 'none' && profile?.membership !== 'free' && paidExpiry && paidExpiry > now);
  const hasValidPlanInProfile = isFreeValid || isPaidValid || profile?.plan_active === true;

  const isPlanActive = !adPlanRequired && (hasValidPlanInProfile || (ads && ads.length > 0));

  if (!isPlanActive) {
    return (
      <div>
        <div className="sgc-page-header">
          <h2 className="sgc-heading">📺 Advertisement</h2>
        </div>
        <div style={{background:'linear-gradient(135deg,#450a0a,#7f1d1d)',border:'1px solid #ef4444',borderRadius:16,padding:'32px 24px',textAlign:'center',maxWidth:480,margin:'40px auto'}}>
          <div style={{fontSize:52,marginBottom:12}}>📺</div>
          <h3 style={{color:'#fca5a5',fontSize:20,fontWeight:800,margin:'0 0 8px'}}>Plan Required</h3>
          <p style={{color:'#fecaca',fontSize:14,margin:'0 0 20px',lineHeight:1.7,fontWeight:600}}>Please activate a membership plan first.</p>
          <button onClick={()=>setTab('plans')} style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',border:'none',borderRadius:10,padding:'12px 28px',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)',boxShadow:'0 4px 14px rgba(245,158,11,0.4)'}}>🏆 Activate Plan Now</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">📺 Advertisement</h2>
        <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>
          {availableAds > 10 ? '10+' : availableAds} available today
        </span>
      </div>
      {siteSettings?.ad_section_message?.trim() && (
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
        {ads.filter(a=>!a.already_clicked).slice(0, 10).map((ad,i)=>(
          <div key={ad.id} className="sgc-ad-card" style={{
            animationDelay:`${i*.05}s`,
            border: ad.is_own_ad ? '2px solid #f59e0b' : ad.is_sponsored ? '2px solid #eab308' : '1px solid var(--border)',
            boxShadow: ad.is_own_ad ? '0 4px 20px rgba(245,158,11,0.25)' : ad.is_sponsored ? '0 4px 20px rgba(234,179,8,0.25)' : 'none'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div style={{flex:1,marginRight:8}}>
                {ad.is_own_ad ? (
                  <span style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#ffffff',fontSize:11,fontWeight:900,padding:'4px 12px',borderRadius:20,display:'inline-flex',alignItems:'center',gap:4,marginBottom:6,boxShadow:'0 3px 10px rgba(245,158,11,0.5)',letterSpacing:.5,border:'1px solid #fbbf24'}}>
                    👑⭐ YOUR AD
                  </span>
                ) : ad.is_sponsored ? (
                  <span style={{background:'linear-gradient(135deg,#eab308,#ca8a04)',color:'#000000',fontSize:11,fontWeight:900,padding:'4px 12px',borderRadius:20,display:'inline-flex',alignItems:'center',gap:4,marginBottom:6,boxShadow:'0 3px 10px rgba(234,179,8,0.5)',letterSpacing:.5,border:'1px solid #fef08a'}}>
                    🚀🔥 SPONSORED CAMPAIGN
                  </span>
                ) : null}
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

      {/* Watch History */}
      {(()=>{
        const watchHistory = earnings.filter(e => e.type === 'click');
        const shownHistory = watchHistory.slice(0, historyLimit);

        return (
          <div style={{marginTop:32}}>
            <h3 className="sgc-subheading" style={{marginBottom:16}}>📋 Watch History</h3>
            
            {watchHistory.length === 0 ? (
              <div className="sgc-empty">No advertisement history available.</div>
            ) : (
              <div className="sgc-table-wrap">
                <table className="sgc-table">
                  <thead><tr><th className="sgc-th">Advertisement Title</th><th className="sgc-th">Date & Time Watched</th><th className="sgc-th">Reward Earned</th><th className="sgc-th">Status</th></tr></thead>
                  <tbody>{shownHistory.map((e,i)=>(
                    <tr key={i} className="sgc-tr">
                      <td className="sgc-td" style={{color:'var(--text)',fontWeight:700}}>{e.ad_title || `Advertisement #${e.ad_id}`}</td>
                      <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{new Date(e.clicked_at).toLocaleString()}</td>
                      <td className="sgc-td" style={{color:'var(--green)',fontWeight:700}}>+Rs. {e.amount?.toFixed(2)}</td>
                      <td className="sgc-td"><span style={{background:'#064e3b',color:'#4ade80',padding:'3px 10px',borderRadius:6,fontSize:10,fontWeight:800}}>COMPLETED</span></td>
                    </tr>
                  ))}</tbody>
                </table>
                
                {watchHistory.length > historyLimit && (
                  <div style={{textAlign:'center',marginTop:16}}>
                    <button type="button" onClick={() => setHistoryLimit(20)} style={{background:'linear-gradient(135deg,#1e3a8a,#1e40af)',color:'#fff',border:'none',borderRadius:10,padding:'10px 24px',fontSize:13,fontWeight:800,cursor:'pointer',fontFamily:'var(--font)',boxShadow:'0 4px 14px rgba(30,58,138,0.4)'}}>
                      See More
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}