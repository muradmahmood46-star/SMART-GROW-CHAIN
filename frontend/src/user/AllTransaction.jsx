import React from 'react';

export default function AllTransaction({ transactions }) {
  return (
    <div>
      <h2 className="sgc-heading">📊 All Transactions</h2>
      <div className="sgc-stats" style={{marginBottom:24}}>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Total Credits</div><div className="sgc-stat-val" style={{color:'var(--green)'}}>Rs. {transactions.filter(t=>t.direction==='credit').reduce((s,t)=>s+(t.amount||0),0).toFixed(2)}</div></div>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Total Debits</div><div className="sgc-stat-val" style={{color:'var(--red)'}}>Rs. {transactions.filter(t=>t.direction==='debit').reduce((s,t)=>s+(t.amount||0),0).toFixed(2)}</div></div>
        <div className="sgc-stat-card"><div className="sgc-stat-label">Total Entries</div><div className="sgc-stat-val" style={{color:'var(--accent)'}}>{transactions.length}</div></div>
      </div>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr><th className="sgc-th">Type</th><th className="sgc-th">Amount</th><th className="sgc-th">Note</th><th className="sgc-th">Status</th><th className="sgc-th">Date</th></tr></thead>
          <tbody>{transactions.map((t,i)=>(
            <tr key={i} className="sgc-tr">
              <td className="sgc-td"><span className="sgc-badge" style={{background:t.direction==='credit'?'#064e3b':'#450a0a'}}>{t.type}</span></td>
              <td className="sgc-td" style={{color:t.direction==='credit'?'var(--green)':'var(--red)',fontWeight:600}}>{t.direction==='credit'?'+':'-'}Rs. {t.amount?.toFixed(2)}</td>
              <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note}</td>
              <td className="sgc-td">{t.status?<span className="sgc-badge" style={{background:t.status==='approved'||t.status==='confirmed'?'#064e3b':t.status==='rejected'?'#450a0a':'#451a03'}}>{t.status}</span>:'-'}</td>
              <td className="sgc-td">{new Date(t.date).toLocaleString()}</td>
            </tr>
          ))}
          {transactions.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No transactions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}