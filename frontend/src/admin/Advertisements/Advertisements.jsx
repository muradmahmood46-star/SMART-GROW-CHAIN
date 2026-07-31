import React from 'react';

export default function Advertisements({ ads, toggleAd, deleteAd, onCreateAd }) {
  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">📺 Advertisements</h2>
        <button className="sgc-btn-sm" style={{background:'var(--yellow)',color:'var(--bg)',padding:'8px 16px',fontWeight:700}} onClick={onCreateAd}>+ Create Ad</button>
      </div>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr>
            <th className="sgc-th">Title</th><th className="sgc-th">URL</th><th className="sgc-th">Earn/Click</th>
            <th className="sgc-th">Timer</th><th className="sgc-th">Clicks</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th>
          </tr></thead>
          <tbody>{ads.map(a=>(
            <tr key={a.id} className="sgc-tr">
              <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{a.title}</td>
              <td className="sgc-td" style={{fontSize:11,color:'var(--dim)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.url}</td>
              <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>Rs. {a.earning_amount}</td>
              <td className="sgc-td">{a.timer_seconds}s</td>
              <td className="sgc-td">{a.total_clicks}</td>
              <td className="sgc-td"><span className="sgc-badge" style={{background:a.is_active?'#064e3b':'#334155'}}>{a.is_active?'Active':'Paused'}</span></td>
              <td className="sgc-td" style={{display:'flex',gap:6}}>
                <button className="sgc-btn-sm" style={{background:'var(--border)',color:'var(--muted)'}} onClick={()=>toggleAd(a.id)}>{a.is_active?'Pause':'Activate'}</button>
                <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteAd(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {ads.length===0&&<tr><td colSpan={7} className="sgc-td" style={{textAlign:'center',padding:32}}>No ads yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}