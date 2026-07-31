import React from 'react';

import { parseUTCDate } from '../utils/dateUtils';

export default function MyReferral({ referrals, referralMsg, selectedRefLevel, setSelectedRefLevel, refLevelData, setRefLevelData, refLevelLoading, setRefLevelLoading, loadRefLevel, notify }) {
  return (
    <div>
      <h2 className="sgc-heading">👥 My Referral</h2>

      {/* Stats */}
      <div className="sgc-stats" style={{marginBottom:24}}>
        {[
          ['Total Referrals', referrals.total_referrals, 'var(--accent)'],
          ['Active Referrals', referrals.active_referrals||0, 'var(--green)'],
          ['Commission Earned', `Rs. ${referrals.total_commission.toFixed(2)}`, 'var(--yellow)'],
          ['Current Level', `Level ${referrals.current_level||1}`, 'var(--purple)'],
        ].map(([l,v,col],i)=>(
          <div key={i} className="sgc-stat-card">
            <div className="sgc-stat-label">{l}</div>
            <div className="sgc-stat-val" style={{color:col}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Referral Link */}
      <div className="sgc-form" style={{marginBottom:24}}>
        <p className="sgc-subheading" style={{marginBottom:10}}>🔗 Your Referral Link</p>
        <div style={{display:'flex',gap:10}}>
          <input className="sgc-input" style={{margin:0,flex:1,fontSize:12}} value={referrals.referral_link} readOnly/>
          <button className="sgc-btn-primary" style={{width:'auto',padding:'0 18px',whiteSpace:'nowrap'}}
            onClick={()=>{ navigator.clipboard.writeText(referrals.referral_link); notify('Link copied! 📋'); }}>Copy</button>
        </div>
        {referralMsg ? (
          <div style={{marginTop:12,background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'12px 16px',display:'flex',gap:8,alignItems:'flex-start'}}>
            <span style={{fontSize:16,flexShrink:0}}>💬</span>
            <p style={{color:'#166534',fontSize:13,margin:0,lineHeight:1.7,whiteSpace:'pre-wrap',fontWeight:500}}>{referralMsg}</p>
          </div>
        ) : (
          <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Earn commission from every ad click your referrals make</p>
        )}
        <div style={{marginTop:10,background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'10px 14px'}}>
          <p style={{color:'var(--accent)',fontSize:13,margin:0,fontWeight:700}}>
            {referrals.next_level_message || `Send link to ${referrals.referrals_to_next_level||referrals.required_referrals_per_level||3} users to gain next level`}
          </p>
          <p style={{color:'var(--dim)',fontSize:11,margin:'4px 0 0'}}>
            Current Level {referrals.current_level||1} - {referrals.total_referrals||0}/{referrals.required_referrals_per_level||3} referrals toward next level
          </p>
        </div>
      </div>

      {/* Level Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {[
          {lvl:1,label:'Level 1',desc:'Direct Referrals',color:'var(--accent)',bg:'#0d1e38',border:'#1e4080'},
          {lvl:2,label:'Level 2',desc:"Referral's Referrals",color:'var(--yellow)',bg:'#1c1000',border:'#92400e'},
          {lvl:3,label:'Level 3',desc:'3rd Tier Network',color:'var(--purple)',bg:'#1a0a2e',border:'#4c1d95'},
        ].map(({lvl,label,desc,color,bg,border})=>(
          <div key={lvl} onClick={()=>loadRefLevel(lvl)}
            style={{background:selectedRefLevel===lvl?bg:'var(--card)',border:`2px solid ${selectedRefLevel===lvl?border:'var(--border)'}`,borderRadius:14,padding:'16px 12px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}>
            <div style={{fontSize:26,marginBottom:6,fontWeight:900,color,fontFamily:'monospace'}}>L{lvl}</div>
            <p style={{color:selectedRefLevel===lvl?color:'var(--text)',fontWeight:700,fontSize:13,margin:'0 0 3px'}}>{label}</p>
            <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{desc}</p>
            {refLevelData[lvl]!==undefined && (
              <div style={{marginTop:8,background:'rgba(255,255,255,.05)',borderRadius:8,padding:'4px 8px'}}>
                <span style={{color,fontSize:12,fontWeight:700}}>{refLevelData[lvl].total} members</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Level Member List */}
      {selectedRefLevel && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 className="sgc-subheading" style={{margin:0}}>
              📋 Level {selectedRefLevel} Members
              {refLevelData[selectedRefLevel] && (
                <span style={{color:'var(--dim)',fontWeight:400,fontSize:12,marginLeft:8}}>
                  ({refLevelData[selectedRefLevel].total} total)
                </span>
              )}
            </h3>
            <button onClick={()=>setSelectedRefLevel(null)}
              style={{background:'none',border:'1px solid var(--border)',borderRadius:8,color:'var(--dim)',fontSize:12,padding:'4px 12px',cursor:'pointer',fontFamily:'var(--font)'}}>
              ✕ Close
            </button>
          </div>

          {refLevelLoading ? (
            <div style={{textAlign:'center',padding:32,color:'var(--dim)',fontSize:13}}>⏳ Loading...</div>
          ) : refLevelData[selectedRefLevel]?.members?.length > 0 ? (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {refLevelData[selectedRefLevel].members.map((r,i)=>{
                const kycColor = r.kyc_status==='approved'?'#4ade80':r.kyc_status==='pending'?'#fbbf24':'var(--dim)';
                const kycBg   = r.kyc_status==='approved'?'#064e3b':r.kyc_status==='pending'?'#451a03':'#334155';
                const kycLabel = r.kyc_status==='approved'?'✅ Verified':r.kyc_status==='pending'?'⏳ Pending':'❌ Not Verified';
                const expiry = parseUTCDate(r.plan_expires_at);
                return (
                  <div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px',display:'flex',flexWrap:'wrap',gap:12,alignItems:'center'}}>
                    {/* Avatar + Username */}
                    <div style={{display:'flex',alignItems:'center',gap:10,flex:'1 1 140px',minWidth:0}}>
                      <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:'#fff',flexShrink:0}}>
                        {r.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{r.username}</p>
                        <p style={{color:'var(--dim)',fontSize:11,margin:'2px 0 0'}}>{new Date(r.joined).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</p>
                      </div>
                    </div>
                    {/* KYC */}
                    <span style={{background:kycBg,color:kycColor,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0}}>{kycLabel}</span>
                    {/* Plan */}
                    <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,textTransform:'capitalize',flexShrink:0}}>
                      🏆 {r.membership}
                    </span>
                    {/* Plan Status */}
                    <span style={{background:r.plan_active?'#064e3b':'#450a0a',color:r.plan_active?'#4ade80':'#fca5a5',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0}}>
                      {r.plan_active?'🟢 Active':'🔴 Expired'}
                    </span>
                    {/* Expiry */}
                    <span style={{color:expiry&&expiry<new Date()?'var(--red)':'var(--dim)',fontSize:11,flexShrink:0}}>
                      {expiry ? `Exp: ${expiry.toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}` : 'No expiry'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="sgc-empty">No Level {selectedRefLevel} referrals yet.</div>
          )}
        </div>
      )}

      {/* Level 1 History Table (existing, shown when no level selected) */}
      {!selectedRefLevel && (
        <>
          <h3 className="sgc-subheading" style={{marginBottom:12}}>📋 Referral History <span style={{color:'var(--dim)',fontWeight:400,fontSize:12}}>({referrals.referrals.length} total)</span></h3>
          {referrals.referrals.length>0 ? (
            <div className="sgc-table-wrap">
              <table className="sgc-table">
                <thead><tr>
                  <th className="sgc-th">Username</th>
                  <th className="sgc-th">KYC</th>
                  <th className="sgc-th">Plan</th>
                  <th className="sgc-th">Plan Status</th>
                  <th className="sgc-th">Joined</th>
                </tr></thead>
                <tbody>{referrals.referrals.map((r,i)=>(
                  <tr key={i} className="sgc-tr">
                    <td className="sgc-td">
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'#fff',flexShrink:0}}>
                          {r.username[0].toUpperCase()}
                        </div>
                        <span style={{color:'var(--text)',fontWeight:600,fontSize:13}}>@{r.username}</span>
                      </div>
                    </td>
                    <td className="sgc-td">
                      <span style={{background:r.kyc_status==='approved'?'#064e3b':r.kyc_status==='pending'?'#451a03':'#334155',color:r.kyc_status==='approved'?'#4ade80':r.kyc_status==='pending'?'#fbbf24':'var(--dim)',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>
                        {r.kyc_status==='approved'?'✅ Verified':r.kyc_status==='pending'?'⏳ Pending':'❌ Not Verified'}
                      </span>
                    </td>
                    <td className="sgc-td">
                      <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600,textTransform:'capitalize'}}>
                        {r.membership}
                      </span>
                    </td>
                    <td className="sgc-td">
                      <span style={{background:r.plan_active?'#064e3b':'#450a0a',color:r.plan_active?'#4ade80':'#fca5a5',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>
                        {r.plan_active?'🟢 Active':'🔴 Expired'}
                      </span>
                    </td>
                    <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{new Date(r.joined).toLocaleDateString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <div className="sgc-empty">No referrals yet. Share your link!</div>
          )}
        </>
      )}
    </div>
  );
}