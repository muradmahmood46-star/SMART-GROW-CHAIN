import React from 'react';

export default function ReferralCommission({ refSettings, toggleBonusType, addRefLevel, updateRefLevel, deleteRefLevel }) {
  return (
    <div>
      <h2 className="sgc-heading">⚙️ Referral Commission Settings</h2>
      {[['plan_purchase','💳 Plan Purchase Bonus'],['vip_plan','👑 VIP Plan Purchase Bonus'],['deposit','💰 Add Fund Bonus'],['ad_view','📺 Advertisement View Bonus']].map(([type, label])=>{
        const s = refSettings[type];
        if(!s) return null;
        return (
          <div key={type} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px',marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>{label}</p>
                <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>To activate the commission, please switch on this button.</p>
              </div>
              <div onClick={()=>toggleBonusType(type,!s.is_active)} style={{width:48,height:26,borderRadius:13,background:s.is_active?'var(--green)':'var(--border)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
                <div style={{position:'absolute',top:3,left:s.is_active?24:3,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
              </div>
            </div>
            <div className="sgc-table-wrap">
              <table className="sgc-table">
                <thead><tr><th className="sgc-th">Level</th><th className="sgc-th">Level Details</th><th className="sgc-th">Bonus %</th><th className="sgc-th">Actions</th></tr></thead>
                <tbody>
                  {s.levels.map((lvl,li)=>(
                    <tr key={lvl.id} className="sgc-tr">
                      <td className="sgc-td" style={{color:'var(--yellow)',fontWeight:700}}>LEVEL# {lvl.level}</td>
                      <td className="sgc-td">
                        <input type="text" maxLength={160}
                          defaultValue={lvl.details||''}
                          placeholder="e.g. Share link to others"
                          onBlur={e=>updateRefLevel(lvl.id, {details:e.target.value})}
                          style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',padding:'4px 10px',width:220,fontFamily:'var(--font)',fontSize:13}}/>
                      </td>
                      <td className="sgc-td">
                        <input type="number" min="0" max="100" step="0.1"
                          defaultValue={lvl.percent}
                          onBlur={e=>updateRefLevel(lvl.id, {percent:parseFloat(e.target.value)||0})}
                          style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text)',padding:'4px 10px',width:80,fontFamily:'var(--font)',fontSize:13}}/>
                        <span style={{color:'var(--dim)',marginLeft:6}}>%</span>
                      </td>
                      <td className="sgc-td">
                        <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteRefLevel(lvl.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="sgc-btn-sm" style={{marginTop:10,background:'#1e3a6e',color:'var(--accent)',padding:'6px 16px'}} onClick={()=>addRefLevel(type)}>+ Add Level</button>
          </div>
        );
      })}
    </div>
  );
}