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
      <style>{`
        @keyframes adminSlideUpFade {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-stat-card {
          border-radius: 16px;
          padding: 24px 20px;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          animation: adminSlideUpFade 0.6s ease-out forwards;
        }
        .admin-stat-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.3);
        }
      `}</style>
      <h2 className="sgc-heading">📊 Dashboard</h2>
      <div className="sgc-stats" style={{gap: '20px'}}>
        {[
          ['Total Users',    stats.total_users,             'linear-gradient(135deg, #1e3a8a, #3b82f6)', '#93c5fd', '👥'],
          ['Active Users',   stats.active_users,            'linear-gradient(135deg, #064e3b, #10b981)', '#6ee7b7', '✅'],
          ['Total Ads',      stats.total_ads,               'linear-gradient(135deg, #4c1d95, #8b5cf6)', '#c4b5fd', '📺'],
          ['Today Clicks',   stats.today_clicks,            'linear-gradient(135deg, #7c2d12, #f97316)', '#fdba74', '👆'],
          ['Today Earnings', `Rs. ${stats.today_earnings}`, 'linear-gradient(135deg, #713f12, #eab308)', '#fde047', '🪙'],
          ['Total Earnings', `Rs. ${stats.total_earnings}`, 'linear-gradient(135deg, #022c22, #059669)', '#6ee7b7', '💰'],
          ['Pending Payout', stats.pending_withdrawals,     'linear-gradient(135deg, #7f1d1d, #ef4444)', '#fca5a5', '🔴'],
          ['Pending Funds',  stats.pending_deposits,        'linear-gradient(135deg, #164e63, #06b6d4)', '#67e8f9', '🟦'],
          ['Tickets',        stats.open_tickets,            'linear-gradient(135deg, #831843, #ec4899)', '#f9a8d4', '🩷'],
          ['Total Clicks',   stats.total_clicks,            'linear-gradient(135deg, #312e81, #6366f1)', '#a5b4fc', '⚡'],
        ].map(([l,v,bg,textCol,icon],i)=>(
          <div key={i} className="admin-stat-card" style={{ background: bg, animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>{l}</div>
              <div style={{ fontSize: 24, opacity: 0.8, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', fontFamily: 'monospace', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{v}</div>
            
            {/* Glassmorphism subtle flare effect */}
            <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)', borderRadius: '50%', pointerEvents: 'none' }} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 className="sgc-subheading" style={{marginBottom:12}}>Quick Actions</h3>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:28}}>
        {[['➕','Create Ad','create-ad'],['📥','Fund Requests','deposits'],['💸','Payout','withdrawals'],['🎫','Tickets','tickets'],['💵','Our Accounts','easypaisa']].map(([icon,label,key])=>(
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