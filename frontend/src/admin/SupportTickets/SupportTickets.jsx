import React from 'react';

export default function SupportTickets({ tickets, openT, replyTicket, closeTicket }) {
  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">🎫 Support Tickets</h2>
        <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{openT} open</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {tickets.map(t=>{
          const isOpen=t.status==='open';
          const isClosed=t.status==='closed';
          const borderCol=isOpen?'#f59e0b':isClosed?'#3cb559':'#ef4444';
          return (
            <div key={t.id} className="fade-in" style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
              <div style={{background:isOpen?'#451a0320':isClosed?'#064e3b20':'#450a0a20',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}30`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'var(--bg)',flexShrink:0}}>
                    {t.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{t.username}</p>
                    <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(t.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span style={{background:isOpen?'#451a03':isClosed?'#064e3b':'#450a0a',color:isOpen?'#f59e0b':isClosed?'#4ade80':'#fca5a5',padding:'3px 12px',borderRadius:20,fontSize:11,fontWeight:700}}>
                  {t.status.toUpperCase()}
                </span>
              </div>
              <div style={{padding:'16px 20px'}}>
                <p style={{color:'var(--text)',fontWeight:600,fontSize:14,margin:'0 0 8px'}}>{t.subject}</p>
                <p style={{color:'var(--dim)',fontSize:13,margin:'0 0 16px',lineHeight:1.5}}>{t.message}</p>
                {isOpen && (
                  <div style={{display:'flex',gap:8}}>
                    <input className="sgc-input" placeholder="Write reply..." onKeyDown={e=>{if(e.key==='Enter'&&e.target.value.trim()){replyTicket(t.id,e.target.value.trim());e.target.value='';}}}/>
                    <button className="sgc-btn-yellow" style={{whiteSpace:'nowrap'}} onClick={()=>{const input=document.querySelector(`[data-ticket-id="${t.id}"] input`);if(input&&input.value.trim()){replyTicket(t.id,input.value.trim());input.value='';}}}>Reply</button>
                    <button className="sgc-btn-sm" style={{background:'#064e3b',color:'#4ade80',padding:'8px 14px'}} onClick={()=>closeTicket(t.id)}>Close</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {tickets.length===0&&<div className="sgc-empty">No tickets yet</div>}
      </div>
    </div>
  );
}