import React from 'react';

export default function SendFunds({ profile, transfers, transfer, setTransfer, handleTransfer, siteSettings }) {
  return (
    <div>
      <h2 className="sgc-heading">🔄 Send Funds</h2>
      <div className="sgc-stats" style={{maxWidth:420,marginBottom:24}}>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Available Balance</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {profile.balance.toFixed(2)}</div></div>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Min Transfer</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>Rs. 50</div></div>
      </div>
      <form onSubmit={handleTransfer} className="sgc-form" style={{marginBottom:24}}>
        <label className="sgc-label">Receiver Username</label>
        <input className="sgc-input" placeholder="Enter username" value={transfer.receiver_username} onChange={e=>setTransfer({...transfer,receiver_username:e.target.value})} required/>
        <label className="sgc-label">Amount (Rs.)</label>
        <input className="sgc-input" type="number" step="1" min="50" placeholder="Min Rs. 50" value={transfer.amount} onChange={e=>setTransfer({...transfer,amount:e.target.value})} required/>
        <label className="sgc-label">Note (optional)</label>
        <input className="sgc-input" placeholder="Add a note" value={transfer.note} onChange={e=>setTransfer({...transfer,note:e.target.value})}/>
        <button className="sgc-btn-primary" type="submit">🔄 Send Funds</button>
      </form>
      {siteSettings.transfer_message && (
        <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'12px 16px',marginBottom:24,display:'flex',gap:8,alignItems:'flex-start'}}>
          <span style={{fontSize:16,flexShrink:0}}>💬</span>
          <p style={{color:'#94a3b8',fontSize:13,margin:0,lineHeight:1.6}}>{siteSettings.transfer_message}</p>
        </div>
      )}
      <h3 className="sgc-subheading">Transfer History</h3>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr><th className="sgc-th">Direction</th><th className="sgc-th">User</th><th className="sgc-th">Amount</th><th className="sgc-th">Note</th><th className="sgc-th">Date</th></tr></thead>
          <tbody>{transfers.map((t,i)=>(
            <tr key={i} className="sgc-tr">
              <td className="sgc-td"><span className="sgc-badge" style={{background:t.direction==='received'?'#064e3b':'#450a0a'}}>{t.direction==='received'?'↓ Received':'↑ Sent'}</span></td>
              <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>@{t.direction==='received'?t.from:t.to}</td>
              <td className="sgc-td" style={{color:t.direction==='received'?'var(--green)':'var(--red)',fontWeight:700}}>{t.direction==='received'?'+':'-'}Rs. {t.amount?.toFixed(2)}</td>
              <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note||'-'}</td>
              <td className="sgc-td">{new Date(t.date).toLocaleString()}</td>
            </tr>
          ))}
          {transfers.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No transfers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}