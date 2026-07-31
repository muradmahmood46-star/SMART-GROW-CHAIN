import React from 'react';
import { readAllNotifications, readNotification } from '../services/user/actionService';

export default function Notifications({ notifications, notify, loadData }) {
  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">🔔 Notifications</h2>
        {notifications.filter(n=>!n.is_read).length>0 && (
          <button onClick={async()=>{ await readAllNotifications(); if (loadData) loadData(); }}
            style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--accent)',fontSize:12,fontWeight:600,padding:'6px 14px',cursor:'pointer',fontFamily:'var(--font)'}}>
            ✓ Mark all read
          </button>
        )}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {notifications.map((n,i)=>(
          <div key={i} onClick={async()=>{ if(!n.is_read){ await readNotification(n.id); if (loadData) loadData(); } }}
            style={{background:n.is_read?'var(--card)':'rgba(13, 148, 136, 0.1)',border:`1px solid ${n.is_read?'var(--border)':'rgba(13, 148, 136, 0.2)'}`,borderRadius:12,padding:'14px 18px',cursor:'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
              <div style={{flex:1}}>
                <p style={{color:n.is_read?'var(--muted)':'var(--text)',fontWeight:700,fontSize:14,margin:'0 0 4px'}}>
                  {!n.is_read&&<span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:'var(--accent)',marginRight:8,verticalAlign:'middle'}}/>}
                  {n.title}
                </p>
                <p style={{color:n.is_read?'var(--dim)':'var(--muted)',fontSize:13,margin:0,lineHeight:1.6}}>{n.message}</p>
              </div>
              <span style={{color:'var(--dim)',fontSize:11,whiteSpace:'nowrap',flexShrink:0}}>{new Date(n.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {notifications.length===0&&<div className="sgc-empty">🔔 No notifications yet</div>}
      </div>
    </div>
  );
}