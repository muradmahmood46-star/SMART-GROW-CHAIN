import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function FundTransfers({ notify }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      const res = await API.get('/admin/fund-transfers');
      setTransfers(res.data);
    } catch (e) {
      if (notify) notify('Failed to fetch fund transfers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">🔄 Fund Transfers</h2>
        <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{transfers.length} total</span>
      </div>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr>
            <th className="sgc-th">Sender</th>
            <th className="sgc-th">Receiver</th>
            <th className="sgc-th">Amount</th>
            <th className="sgc-th">Note</th>
            <th className="sgc-th">Date</th>
          </tr></thead>
          <tbody>{transfers.map(t=>(
            <tr key={t.id} className="sgc-tr">
              <td className="sgc-td">
                <div style={{color:'var(--red)',fontWeight:600}}>{t.sender}</div>
                <div style={{color:'var(--dim)',fontSize:11}}>{t.sender_email}</div>
              </td>
              <td className="sgc-td">
                <div style={{color:'var(--green)',fontWeight:600}}>{t.receiver}</div>
                <div style={{color:'var(--dim)',fontSize:11}}>{t.receiver_email}</div>
              </td>
              <td className="sgc-td" style={{color:'var(--accent)',fontWeight:600}}>Rs. {t.amount?.toFixed(2)}</td>
              <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{t.note||'-'}</td>
              <td className="sgc-td" style={{fontSize:12}}>{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {transfers.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No transfers yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}