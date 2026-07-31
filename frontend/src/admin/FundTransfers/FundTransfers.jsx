import React from 'react';

export default function FundTransfers({ transfers }) {
  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">🔄 Fund Transfers</h2>
        <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{transfers.length} total</span>
      </div>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr>
            <th className="sgc-th">From</th><th className="sgc-th">To</th><th className="sgc-th">Amount</th><th className="sgc-th">Note</th><th className="sgc-th">Date</th>
          </tr></thead>
          <tbody>{transfers.map(t=>(
            <tr key={t.id} className="sgc-tr">
              <td className="sgc-td" style={{color:'var(--red)',fontWeight:600}}>{t.sender}</td>
              <td className="sgc-td" style={{color:'var(--green)',fontWeight:600}}>{t.receiver}</td>
              <td className="sgc-td" style={{color:'var(--accent)',fontWeight:600}}>Rs. {t.amount?.toFixed(2)}</td>
              <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note||'-'}</td>
              <td className="sgc-td">{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {transfers.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No transfers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}