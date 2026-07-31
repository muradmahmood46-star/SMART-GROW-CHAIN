/* eslint-disable */
import React, { useState } from 'react';
import API from '../api';

export default function SupportTicket({ tickets, notify, loadData }) {
  const [ticket, setTicket] = useState({ subject:'', message:'' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [userReply, setUserReply] = useState('');

  React.useEffect(() => {
    let changed = false;
    tickets.forEach(t => {
      if (t.status === 'replied') {
        API.post(`/user/tickets/${t.id}/read`).catch(()=>{}).then(() => { changed = true; });
      }
    });
    if (changed && loadData) {
      setTimeout(() => loadData(), 500);
    }
  }, [tickets]);

  const handleTicket = async(e)=>{
    e.preventDefault();
    try{ 
      await API.post('/user/tickets',ticket); 
      notify('Ticket submitted!'); 
      if (loadData) loadData(); 
      setTicket({subject:'',message:''}); 
    }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
  };

  const handleUserReply = async(e)=>{
    e.preventDefault();
    if (!replyingTo) return;
    try {
      await API.post(`/user/tickets/${replyingTo.id}/respond`, { message: userReply });
      notify('Response sent!');
      setReplyingTo(null);
      setUserReply('');
      if (loadData) loadData();
    } catch(err) {
      notify(err.response?.data?.detail||'Error sending response','error');
    }
  };

  const markAsRead = async(t)=>{
    if (t.status === 'replied') {
      try {
        await API.post(`/user/tickets/${t.id}/read`);
        if (loadData) loadData();
      } catch(err) { console.error(err); }
    }
  };

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
        {tickets.map((t,i)=>{
          const isReplied = t.status === 'replied';
          return (
          <div key={i} className="sgc-form fade-in" style={{border: isReplied ? '1.5px solid rgba(13,148,136,0.3)' : undefined, background: isReplied ? 'rgba(13,148,136,0.05)' : undefined}}>
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
            {t.user_responses && t.user_responses.length > 0 && t.user_responses.map((ur, ri) => (
              <div key={ri} style={{background:'rgba(245,158,11,0.05)',padding:'10px 14px',borderRadius:8,border:'1px solid rgba(245,158,11,0.15)',marginTop:8}}>
                <p style={{color:'var(--accent)',fontSize:11,fontWeight:700,marginBottom:4}}>Your Response:</p>
                <p style={{color:'var(--muted)',fontSize:13}}>{ur.message}</p>
                <p style={{color:'var(--dim)',fontSize:10,marginTop:4}}>{new Date(ur.created_at).toLocaleString()}</p>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(t.created_at).toLocaleString()}</p>
              <div style={{display:'flex',gap:8}}>
                {(t.status === 'open' || t.status === 'replied' || t.status === 'read') && (
                  <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)',padding:'5px 12px',fontSize:11}} onClick={()=>{setReplyingTo(t);setUserReply('');}}>
                    💬 Respond
                  </button>
                )}
              </div>
            </div>
          </div>
        )})}
        {tickets.length===0&&<div className="sgc-empty">No tickets submitted yet.</div>}
      </div>

      {replyingTo && (
        <div className="sgc-modal-overlay" onClick={()=>setReplyingTo(null)}>
          <div className="sgc-modal fade-up" style={{maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <h3 className="sgc-heading" style={{marginTop:0,marginBottom:16}}>Reply to Ticket</h3>
            <p style={{color:'var(--dim)',fontSize:13,marginBottom:12}}><strong style={{color:'var(--text)'}}>Subject:</strong> {replyingTo.subject}</p>
            {replyingTo.reply && (
              <div style={{background:'var(--bg)',padding:'10px 14px',borderRadius:8,border:'1px solid var(--border)',marginBottom:16}}>
                <p style={{color:'var(--yellow)',fontSize:11,fontWeight:700,marginBottom:4}}>Admin Reply:</p>
                <p style={{color:'var(--muted)',fontSize:13}}>{replyingTo.reply}</p>
              </div>
            )}
            <form onSubmit={handleUserReply} className="sgc-form">
              <label className="sgc-label">Your Response</label>
              <textarea className="sgc-input" rows={4} placeholder="Type your response..." value={userReply} onChange={e=>setUserReply(e.target.value)} required/>
              <div style={{display:'flex',gap:10,marginTop:10}}>
                <button type="submit" className="sgc-btn-primary" style={{flex:1}}>Send Response</button>
                <button type="button" className="sgc-btn-sm" style={{padding:'0 20px'}} onClick={()=>setReplyingTo(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}