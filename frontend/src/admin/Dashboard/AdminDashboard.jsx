import React, { useState, useEffect } from 'react';
import API from '../../api';

export default function AdminDashboard({ setTab }) {
  const [stats, setStats] = useState({
    total_users: 0, active_users: 0, total_ads: 0, today_clicks: 0,
    today_earnings: 0, total_earnings: 0, pending_withdrawals: 0,
    total_clicks: 0, daily_data: []
  });
  const [pendingD, setPendingD] = useState(0);
  const [openT, setOpenT] = useState(0);

  useEffect(() => {
    let active = true;
    const loadDashboardData = async () => {
      try {
        const [statsRes, depositsRes, ticketsRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/deposits'),
          API.get('/admin/tickets'),
        ]);
        if (active) {
          setStats(statsRes.data);
          setPendingD(depositsRes.data.filter(d => d.status === 'pending').length);
          setOpenT(ticketsRes.data.filter(t => t.status === 'open').length);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadDashboardData();
    return () => { active = false; };
  }, []);

  return (
    <div>
      <h2 className="sgc-heading">📊 Dashboard</h2>
      <div className="sgc-stats">
        {[
          ['Total Users',    stats.total_users,                    'var(--accent)'],
          ['Active Users',   stats.active_users,                   'var(--green)'],
          ['Total Ads',      stats.total_ads,                      'var(--purple)'],
          ['Today Clicks',   stats.today_clicks,                   'var(--yellow)'],
          ['Today Earnings', `Rs. ${stats.today_earnings}`,        'var(--green)'],
          ['Total Earnings', `Rs. ${stats.total_earnings}`,        'var(--yellow)'],
          ['Pending Payout', stats.pending_withdrawals,            'var(--red)'],
          ['Pending Funds',  pendingD, 'var(--red)'],
          ['Open Tickets',   openT,                                '#f472b6'],
          ['Total Clicks',   stats.total_clicks,                   'var(--accent)'],
        ].map(([l,v,c],i)=>(
          <div key={i} className="sgc-stat-card">
            <div className="sgc-stat-label">{l}</div>
            <div className="sgc-stat-val" style={{color:c}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 className="sgc-subheading" style={{marginBottom:12}}>Quick Actions</h3>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
        {[['➕','Create Ad','create-ad'],['📥','Fund Requests','deposits'],['💸','Payout','withdrawals'],['🎫','Tickets','tickets'],['📱','Easypaisa','easypaisa']].map(([icon,label,key])=>(
          <button key={key} onClick={()=>setTab(key)} style={{padding:'10px 18px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,color:'var(--text)',cursor:'pointer',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:6,transition:'all .2s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--yellow)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* 7-day chart */}
      <h3 className="sgc-subheading" style={{marginBottom:12}}>Last 7 Days Clicks</h3>
      <div className="sgc-chart">
        {(stats.daily_data||[]).map((d,i)=>{
          const max=Math.max(...(stats.daily_data||[]).map(x=>x.clicks),1);
          const h=(d.clicks/max)*100;
          return (
            <div key={i} className="sgc-bar-wrap">
              <span style={{color:'var(--muted)',fontSize:11}}>{d.clicks}</span>
              <div className="sgc-bar" style={{height:`${h}%`,background:'linear-gradient(180deg,var(--yellow),#d97706)'}}/>
              <span style={{color:'var(--dim)',fontSize:10}}>{d.date.slice(5)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}