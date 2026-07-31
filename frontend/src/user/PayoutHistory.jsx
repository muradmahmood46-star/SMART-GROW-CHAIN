import React from 'react';

export default function PayoutHistory({ withdrawals }) {
  return (
    <div>
      <h2 className="sgc-heading">📋 Payout History</h2>
      <div className="sgc-stats" style={{marginBottom:24}}>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Total Paid Out</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {withdrawals.filter(w=>w.status==='approved').reduce((s,w)=>s+w.amount,0).toFixed(2)}</div></div>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Pending</div><div className="sgc-stat-val" style={{color:'var(--yellow)'}}>{withdrawals.filter(w=>w.status==='pending').length}</div></div>
      </div>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr><th className="sgc-th">Amount</th><th className="sgc-th">Method</th><th className="sgc-th">Account</th><th className="sgc-th">Status</th><th className="sgc-th">Date</th></tr></thead>
          <tbody>{withdrawals.map((w,i)=>(
            <tr key={i} className="sgc-tr">
              <td className="sgc-td" style={{color:'var(--red)',fontWeight:600}}>-Rs. {w.amount.toFixed(2)}</td>
              <td className="sgc-td">{w.method}</td>
              <td className="sgc-td" style={{fontSize:11,color:'var(--dim)'}}>{w.wallet_address?.substring(0,18)}...</td>
              <td className="sgc-td"><span className="sgc-badge" style={{background:w.status==='approved'||w.status==='sent'?'#064e3b':w.status==='rejected'?'#450a0a':'#451a03'}}>{w.status==='sent'?'✈️ sent':w.status}</span></td>
              <td className="sgc-td">{new Date(w.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {withdrawals.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No payout history</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}