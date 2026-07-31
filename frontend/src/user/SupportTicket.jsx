import React from 'react';

export default function SupportTicket({ tickets, ticket, setTicket, handleTicket }) {
  return (
    <div>
      <h2 className="sgc-heading">🎫 Support Ticket</h2>
      <form onSubmit={handleTicket} className="sgc-form" style={{marginBottom:24}}>
        <label className="sgc-label">Subject</label>
        <input className="sgc-input" placeholder="Enter ticket subject" value={ticket.subject} onChange={e=>setTicket({...ticket,subject:e.target.value})} required/>
        <label className="sgc-label">Message</label>
        <textarea className="sgc-input" rows={4} placeholder="Describe your issue..." value={ticket.message} onChange={e=>setTicket({...ticket,message:e.target.value})} required style={{resize:'vertical',minHeight:100}}/>
        <button className="sgc-btn-primary" type="submit">Submit Ticket</button>
      </form>
      <h3 className="sgc-subheading">My Tickets</h3>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {tickets.map((t,i)=>(
          <div key={i} className="sgc-form fade-in">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{color:'var(--text)',fontWeight:700,fontSize:14}}>{t.subject}</span>
              <span className="sgc-badge" style={{background:t.status==='open'?'#451a03':t.status==='replied'?'#064e3b':'#1e293b'}}>{t.status}</span>
            </div>
            <p style={{color:'var(--dim)',fontSize:13,marginBottom:t.reply?10:0}}>{t.message}</p>
            {t.reply&&(
              <div style={{background:'var(--bg)',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',marginTop:8}}>
                <p style={{color:'var(--yellow)',fontSize:11,fontWeight:700,marginBottom:4}}>Admin Reply:</p>
                <p style={{color:'var(--muted)',fontSize:13}}>{t.reply}</p>
              </div>
            )}
            <p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>{new Date(t.created_at).toLocaleString()}</p>
          </div>
        ))}
        {tickets.length===0&&<div className="sgc-empty">No tickets submitted yet.</div>}
      </div>
    </div>
  );
}