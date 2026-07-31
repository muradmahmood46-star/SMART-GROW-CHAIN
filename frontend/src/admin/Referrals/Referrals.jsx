import React from 'react';

export default function Referrals({ referrals, refSearch, setRefSearch, searchReferrals, loadAll }) {
  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">👥 Referrals</h2>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        <input className="sgc-input" style={{margin:0,flex:1}} placeholder="Search by username..." value={refSearch} onChange={e=>setRefSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchReferrals()}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'0 20px',whiteSpace:'nowrap'}} onClick={searchReferrals}>🔍 Search</button>
        <button className="sgc-btn-sm" style={{padding:'0 14px',background:'var(--border)',color:'var(--muted)'}} onClick={()=>{ setRefSearch(''); loadAll(); }}>Reset</button>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {referrals.map((u,i)=>(
          <div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8,marginBottom:u.referrals.length?12:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:'var(--bg)',flexShrink:0}}>{u.username[0].toUpperCase()}</div>
                <div>
                  <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{u.username}</p>
                  <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{u.email} &bull; <span style={{color:'var(--accent)',fontFamily:'monospace'}}>{u.referral_code}</span>{u.referred_by&&<span style={{color:'var(--purple)'}}> &bull; ref by @{u.referred_by}</span>}</p>
                </div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <span className="sgc-badge" style={{background:'#1e3a6e'}}>{u.membership}</span>
                <span className="sgc-badge" style={{background:'#064e3b',color:'var(--green)'}}>Rs. {u.balance.toFixed(2)}</span>
                <span className="sgc-badge" style={{background:'#2d1b69',color:'var(--purple)'}}>{u.total_referrals} refs</span>
                <span className="sgc-badge" style={{background:'#1a2e1a',color:'#4ade80'}}>Commission: Rs. {u.referral_commission_earned.toFixed(2)}</span>
              </div>
            </div>
            {u.referrals.length>0&&(
              <div style={{borderTop:'1px solid var(--border)',paddingTop:10}}>
                <p style={{color:'var(--dim)',fontSize:11,fontWeight:600,marginBottom:6}}>DIRECT REFERRALS ({u.referrals.length})</p>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {u.referrals.map((r,j)=>(
                    <div key={j} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,padding:'4px 12px',fontSize:12}}>
                      <span style={{color:'var(--text)',fontWeight:600}}>@{r.username}</span>
                      <span className="sgc-badge" style={{background:'#1e3a6e',marginLeft:6,fontSize:10}}>{r.membership}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {referrals.length===0&&<div className="sgc-empty">No referral data found</div>}
      </div>
    </div>
  );
}