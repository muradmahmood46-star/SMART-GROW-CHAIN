/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function AdViewLog({ notify }) {
  const [adViewLog, setAdViewLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adLogSearch, setAdLogSearch] = useState('');

  const fetchLogs = async (search = '') => {
    try {
      setLoading(true);
      const url = search ? `/admin/ad-view-log?search=${search}` : '/admin/ad-view-log';
      const res = await API.get(url);
      setAdViewLog(res.data);
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch ad logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const searchAdLog = () => {
    if (!adLogSearch.trim()) {
      fetchLogs();
      return;
    }
    fetchLogs(adLogSearch.trim());
  };

  const handleReset = () => {
    setAdLogSearch('');
    fetchLogs();
  };

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">📌 Ad View Log</h2>
        <span style={{color:'var(--dim)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{adViewLog.length} records</span>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:16}}>
        <input className="sgc-input" style={{margin:0,flex:1}} placeholder="Search by username..." value={adLogSearch} onChange={e=>setAdLogSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchAdLog()}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'0 20px',whiteSpace:'nowrap'}} onClick={searchAdLog}>🔍 Search</button>
        <button className="sgc-btn-sm" style={{padding:'0 14px',background:'var(--border)',color:'var(--muted)'}} onClick={handleReset}>Reset</button>
      </div>
      
      {loading ? (
        <div style={{padding:20, color:'var(--dim)'}}>Loading ad logs...</div>
      ) : (
        <div className="sgc-table-wrap">
          <table className="sgc-table">
            <thead><tr>
              <th className="sgc-th">SL</th>
              <th className="sgc-th">User</th>
              <th className="sgc-th">Advertisement Name</th>
              <th className="sgc-th">Type</th>
              <th className="sgc-th">Earned</th>
              <th className="sgc-th">Date-Time</th>
            </tr></thead>
            <tbody>{adViewLog.map((l,i)=>(
              <tr key={i} className="sgc-tr">
                <td className="sgc-td" style={{color:'var(--dim)',fontWeight:600}}>{i+1}</td>
                <td className="sgc-td">
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'var(--bg)',flexShrink:0}}>
                      {l.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{color:'var(--text)',fontWeight:700,fontSize:13,margin:0}}>{l.username}</p>
                      <p style={{color:'var(--dim)',fontSize:11,margin:0}}>@{l.username}</p>
                    </div>
                  </div>
                </td>
                <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{l.ad_title}</td>
                <td className="sgc-td">
                  <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>🔗 URL/Link</span>
                </td>
                <td className="sgc-td" style={{color:'var(--green)',fontWeight:700}}>Rs. {l.amount?.toFixed(2)}</td>
                <td className="sgc-td" style={{color:'var(--dim)',fontSize:12}}>{new Date(l.clicked_at).toLocaleString()}</td>
              </tr>
            ))}
            {adViewLog.length===0&&<tr><td colSpan={6} className="sgc-td" style={{textAlign:'center',padding:32}}>No ad view logs yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}