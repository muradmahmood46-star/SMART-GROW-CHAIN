import React from 'react';

export default function PaymentOptions({ easypaisa, newEP, setNewEP, toggleEP, deleteEP, showAddForm, setShowAddForm, addEP, showError }) {
  if (showError) {
    return (
      <div style={{background:'#450a0a',border:'1px solid #ef4444',borderRadius:12,padding:'16px 20px',marginBottom:20,color:'#fca5a5',fontWeight:600}}>
        ⚠️ Something went wrong. Please retry.
      </div>
    );
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h2 className="sgc-heading" style={{margin:0}}>📱 Payment Options</h2>
        <button className="sgc-btn-sm" style={{background:'var(--yellow)',color:'var(--bg)',padding:'8px 16px',fontWeight:700}} onClick={()=>setShowAddForm(s=>!s)}>
          {showAddForm?'Cancel':'+ Add Payment Method'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addEP} className="sgc-form" style={{maxWidth:520,marginBottom:28}}>
          <label className="sgc-label">Method Type</label>
          <select className="sgc-input" value={newEP.method_type} onChange={e=>setNewEP({...newEP,method_type:e.target.value})} style={{marginBottom:12}}>
            <option value="easypaisa">Easypaisa</option>
            <option value="bank">Bank / IBAN</option>
            <option value="jazzcash">JazzCash</option>
          </select>
          <label className="sgc-label">Account Title (Name)</label>
          <input className="sgc-input" placeholder="e.g. Farzana Bibi" value={newEP.account_title} onChange={e=>setNewEP({...newEP,account_title:e.target.value})} required/>
          <label className="sgc-label">{newEP.method_type==='bank'?'Bank / IBAN Account Number':newEP.method_type==='easypaisa'?'Easypaisa Number':'JazzCash Number'}</label>
          <input className="sgc-input" placeholder={newEP.method_type==='bank'?'e.g. PK36HABB0000123456789012':'03XX-XXXXXXX'} value={newEP.account_number} onChange={e=>setNewEP({...newEP,account_number:e.target.value})} required/>
          <label className="sgc-label">Deposit Instructions <span style={{color:'var(--dim)',fontSize:11}}>(shown to user in deposit section)</span></label>
          <textarea className="sgc-input" rows={3} placeholder="e.g. Send payment and submit the screenshot below. Make sure sender name matches." value={newEP.deposit_message} onChange={e=>setNewEP({...newEP,deposit_message:e.target.value})} style={{resize:'vertical',minHeight:80}}/>
          <div style={{display:'flex',gap:10}}>
            <button className="sgc-btn-yellow" type="submit" style={{flex:1}}>{newEP.id?'Update Account':'Add Account'}</button>
            {newEP.id&&<button type="button" className="sgc-btn-sm" style={{padding:13,borderRadius:10,background:'var(--border)',color:'var(--text)'}} onClick={()=>{ setNewEP({id:null,account_title:'',account_number:'',method_type:'easypaisa',deposit_message:'',bank_name:''}); }}>Cancel</button>}
          </div>
        </form>
      )}

      <div className="sgc-table-wrap">
        <table className="sgc-table">
          <thead><tr>
            <th className="sgc-th">Method</th><th className="sgc-th">Title</th><th className="sgc-th">Number</th><th className="sgc-th">Status</th><th className="sgc-th">Actions</th>
          </tr></thead>
          <tbody>{easypaisa.map(a=>{
            const isEP=(a.method_type||'easypaisa')==='easypaisa';
            const isBank=a.method_type==='bank';
            const col=isEP?'#3cb559':isBank?'#3b82f6':'#e8001e';
            return (
              <tr key={a.id} className="sgc-tr">
                <td className="sgc-td"><span style={{background:isEP?'#0a2010':isBank?'#0a1628':'#200008',color:col,border:`1px solid ${col}`,padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{isEP?'📱 Easypaisa':isBank?'🏦 Bank Transfer':'💳 JazzCash'}</span></td>
                <td className="sgc-td" style={{color:'var(--text)',fontWeight:600}}>{a.account_title}</td>
                <td className="sgc-td" style={{fontFamily:'monospace',color:col,fontWeight:700,fontSize:15}}>{a.account_number}</td>
                <td className="sgc-td"><span className="sgc-badge" style={{background:a.is_active?'#064e3b':'#334155'}}>{a.is_active?'Active':'Inactive'}</span></td>
                <td className="sgc-td" style={{display:'flex',gap:6}}>
                  <button className="sgc-btn-sm" style={{background:'#451a03',color:'var(--yellow)'}} onClick={()=>{ setNewEP(a); }}>Edit</button>
                  <button className="sgc-btn-sm" style={{background:'var(--border)',color:'var(--muted)'}} onClick={()=>toggleEP(a.id)}>{a.is_active?'Disable':'Enable'}</button>
                  <button className="sgc-btn-sm" style={{background:'#450a0a',color:'#fca5a5'}} onClick={()=>deleteEP(a.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
          {easypaisa.length===0&&<tr><td colSpan={5} className="sgc-td" style={{textAlign:'center',padding:32}}>No accounts added yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}