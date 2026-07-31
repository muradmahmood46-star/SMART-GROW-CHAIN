import React from 'react';

export default function FundHistory({ myDeposits, transfers }) {
  return (
    <div>
      <h2 className="sgc-heading">📂 Fund History</h2>
      <div className="sgc-stats" style={{marginBottom:24}}>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Total Confirmed</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {myDeposits.filter(d=>d.status==='confirmed').reduce((s,d)=>s+d.amount_pkr,0).toFixed(2)}</div></div>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Pending</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>{myDeposits.filter(d=>d.status==='pending').length}</div></div>
      </div>

      {/* Deposits */}
      <h3 className="sgc-subheading" style={{marginBottom:10}}>💳 Deposit History</h3>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:28}}>
        {myDeposits.map((d,i)=>{
          const isPending=d.status==='pending';
          const isConfirmed=d.status==='confirmed';
          return (
            <div key={i} style={{background:'var(--card)',border:`1.5px solid ${isPending?'#92400e':isConfirmed?'#166534':'#7f1d1d'}`,borderRadius:12,padding:'14px 18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:isPending?10:0}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:22}}>{isPending?'⏳':isConfirmed?'✅':''}</span>
                  <div>
                    <p style={{color:'var(--text)',fontWeight:700,fontSize:15,margin:0}}>Rs. {d.amount_pkr}</p>
                    <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span style={{background:isPending?'#451a03':isConfirmed?'#064e3b':'#450a0a',color:isPending?'#fbbf24':isConfirmed?'#4ade80':'#fca5a5',padding:'3px 12px',borderRadius:20,fontSize:11,fontWeight:700}}>
                  {d.status.toUpperCase()}
                </span>
              </div>
              {isPending && (
                <div style={{background:'#451a0330',border:'1px solid #92400e',borderRadius:8,padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:14}}>🔔</span>
                  <p style={{color:'#fbbf24',fontSize:12,margin:0,fontWeight:600}}>Your balance will be updated once admin verifies and approves this deposit.</p>
                </div>
              )}
              {isConfirmed && (
                <p style={{color:'var(--green)',fontSize:12,margin:'6px 0 0',fontWeight:600}}>✔ Balance has been credited to your account.</p>
              )}
              {d.status==='rejected' && (
                <p style={{color:'var(--red)',fontSize:12,margin:'6px 0 0',fontWeight:600}}>✕ This deposit was rejected by admin.</p>
              )}
            </div>
          );
        })}
        {myDeposits.length===0&&<div className="sgc-empty">No deposit history yet.</div>}
      </div>

      {/* Fund Transfers */}
      <h3 className="sgc-subheading" style={{marginBottom:10}}>🔄 Transfer History</h3>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr>
            <th className="sgc-th">Direction</th>
            <th className="sgc-th">User</th>
            <th className="sgc-th">Amount</th>
            <th className="sgc-th">Note</th>
            <th className="sgc-th">Date</th>
          </tr></thead>
          <tbody>{transfers.map((t,i)=>(
            <tr key={i} className="sgc-tr">
              <td className="sgc-td">
                <span className="sgc-badge" style={{background:t.direction==='received'?'#064e3b':'#450a0a'}}>
                  {t.direction==='received'?'↓ Received':'↑ Sent'}
                </span>
              </td>
              <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>@{t.direction==='received'?t.from:t.to}</td>
              <td className="sgc-td" style={{color:t.direction==='received'?'var(--green)':'var(--red)',fontWeight:700}}>
                {t.direction==='received'?'+':'-'}Rs. {t.amount?.toFixed(2)}
              </td>
              <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note||'-'}</td>
              <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{new Date(t.date).toLocaleString()}</td>
            </tr>
          ))}
          {transfers.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:24}}>No transfers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}