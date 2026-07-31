import React from 'react';

export default function AdminEmails({ adminEmails, newEmail, setNewEmail, addEmail, editEmail, setEditEmail, editEmailVal, setEditEmailVal, saveEditEmail, deleteEmail }) {
  return (
    <div>
      <h2 className="sgc-heading">📧 Admin Emails <span style={{fontSize:13,color:'var(--dim)',fontWeight:400}}>(max 5)</span></h2>

      {editEmail&&(
        <div className="sgc-modal-overlay">
          <div className="sgc-modal">
            <h3 style={{color:'var(--text)',marginBottom:12,fontSize:15,fontWeight:700}}>✏️ Edit Email</h3>
            <input className="sgc-input" type="email" value={editEmailVal} onChange={e=>setEditEmailVal(e.target.value)}/>
            <div style={{display:'flex',gap:10}}>
              <button className="sgc-btn-yellow" style={{flex:1,padding:11}} onClick={saveEditEmail}>Save</button>
              <button className="sgc-btn-sm" style={{flex:1,background:'var(--border)',color:'var(--text)',padding:11,borderRadius:10}} onClick={()=>setEditEmail(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={addEmail} className="sgc-form" style={{marginBottom:24,maxWidth:480}}>
        <label className="sgc-label">Add Admin Email</label>
        <div style={{display:'flex',gap:10}}>
          <input className="sgc-input" style={{margin:0,flex:1}} type="email" placeholder="admin@example.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required/>
          <button className="sgc-btn-yellow" style={{width:'auto',padding:'0 20px',whiteSpace:'nowrap'}} type="submit">Add</button>
        </div>
      </form>
      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr>
            <th className="sgc-th">Email</th><th className="sgc-th">Type</th><th className="sgc-th">Added</th><th className="sgc-th">Actions</th>
          </tr></thead>
          <tbody>{adminEmails.map(e=>(
            <tr key={e.id} className="sgc-tr">
              <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{e.email}</td>
              <td className="sgc-td"><span className="sgc-badge" style={{background:e.is_primary?'#451a03':'var(--border)'}}>{e.is_primary?'⭐ Primary':'Secondary'}</span></td>
              <td className="sgc-td">{new Date(e.created_at).toLocaleDateString()}</td>
              <td className="sgc-td" style={{display:'flex',gap:6}}>
                <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>{ setEditEmail(e); setEditEmailVal(e.email); }}>Edit</button>
                <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteEmail(e.id)}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}