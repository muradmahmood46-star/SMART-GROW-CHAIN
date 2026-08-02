import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Deposit({ epAccounts: initialEpAccounts, notify, loadData }) {
  const [epAccounts, setEpAccounts] = useState(initialEpAccounts || []);
  const [loadingAccounts, setLoadingAccounts] = useState(!(initialEpAccounts && initialEpAccounts.length > 0));
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');
  const [deposit, setDeposit] = useState({ amount_pkr:'', easypaisa_account_id:'', sender_name:'', trx_id:'', transaction_id:'', screenshot_note:'', bank_name:'', bank_account_holder:'', bank_account_number:'' });
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minDeposit, setMinDeposit] = useState(100);

  useEffect(() => {
    if (initialEpAccounts && initialEpAccounts.length > 0) {
      setEpAccounts(initialEpAccounts);
      setLoadingAccounts(false);
    }
    API.get('/deposit/easypaisa-accounts').then(r => {
      setEpAccounts(r.data);
      setLoadingAccounts(false);
    }).catch(() => {
      setLoadingAccounts(false);
    });
    API.get('/user/settings').then(r => {
      if (r.data.min_deposit) setMinDeposit(parseInt(r.data.min_deposit) || 100);
    }).catch(()=>{});
  }, [initialEpAccounts]);

  const handleDeposit = async(e)=>{
    e.preventDefault();
    if (isSubmitting) return;
    
    if (parseFloat(deposit.amount_pkr) < minDeposit) {
      notify(`Minimum deposit is Rs. ${minDeposit}`, 'error');
      return;
    }

    setIsSubmitting(true);
    if(selectedMethod==='bank'){
      if(!deposit.bank_name||!deposit.bank_account_holder||!deposit.bank_account_number){ notify('Please fill all bank fields','error'); setIsSubmitting(false); return; }
      if(!screenshot){ notify('Please upload payment screenshot','error'); setIsSubmitting(false); return; }
      const bankAccount = epAccounts.find(a=>a.method_type==='bank');
      if(!bankAccount){ notify('No bank account available','error'); setIsSubmitting(false); return; }
      try{
        const fd = new FormData();
        fd.append('amount_pkr', parseFloat(deposit.amount_pkr));
        fd.append('easypaisa_account_id', bankAccount.id);
        fd.append('sender_name', deposit.bank_account_holder);
        fd.append('transaction_id', `BANK|${deposit.bank_name}|${deposit.bank_account_number}`);
        fd.append('screenshot_note', deposit.screenshot_note||'');
        fd.append('screenshot', screenshot);
        await API.post('/deposit/request', fd, { headers:{'Content-Type':'multipart/form-data'} });
        notify('Fund request submitted! Admin will verify shortly.');
        if (loadData) loadData();
        setDeposit({amount_pkr:'',easypaisa_account_id:'',sender_name:'',transaction_id:'',screenshot_note:'',bank_name:'',bank_account_holder:'',bank_account_number:''});
        setScreenshot(null);
      }
      catch(err){ notify(err.response?.data?.detail||'Error','error'); }
      finally { setIsSubmitting(false); }
      return;
    }
    const acc_id = deposit.easypaisa_account_id || (epAccounts[0]?.id);
    if (!acc_id){ notify('No payment account available','error'); setIsSubmitting(false); return; }
    if (!screenshot){ notify('Please upload payment screenshot','error'); setIsSubmitting(false); return; }
    try{
      const fd = new FormData();
      fd.append('amount_pkr', parseFloat(deposit.amount_pkr));
      fd.append('easypaisa_account_id', parseInt(acc_id));
      fd.append('sender_name', deposit.sender_name);
      fd.append('transaction_id', deposit.trx_id || deposit.transaction_id);
      fd.append('screenshot_note', deposit.screenshot_note||'');
      fd.append('screenshot', screenshot);
      await API.post('/deposit/request', fd, { headers:{'Content-Type':'multipart/form-data'} });
      notify('Fund request submitted! Admin will verify shortly.');
      if (loadData) loadData();
      setDeposit({amount_pkr:'',easypaisa_account_id:'',sender_name:'',trx_id:'',transaction_id:'',screenshot_note:'',bank_name:'',bank_account_holder:'',bank_account_number:''});
      setScreenshot(null);
    }
    catch(err){ notify(err.response?.data?.detail||'Error','error'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div>
      <h2 className="sgc-heading">📲 Deposit</h2>

      {/* Our Accounts */}
      <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:12}}>OUR ACCOUNTS</p>
      {loadingAccounts && epAccounts.length === 0 ? (
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'24px 20px',textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:24,marginBottom:8}}>⏳</div>
          <p style={{color:'var(--dim)',fontSize:13,margin:0,fontWeight:600}}>Loading payment accounts...</p>
        </div>
      ) : epAccounts.length > 0 ? (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16,marginBottom:28}}>
          {epAccounts.map(a=>{
            const isEP=(a.method_type||'easypaisa')==='easypaisa';
            const isBank=a.method_type==='bank';
            const col=isEP?'#22c55e':isBank?'#3b82f6':'#ef4444';
            const bg=isEP?'linear-gradient(135deg,#dcfce7,#86efac)':isBank?'linear-gradient(135deg,#dbeafe,#60a5fa)':'linear-gradient(135deg,#fee2e2,#f87171)';
            const methodLabel=isEP?'EASYPAISA':isBank?'BANK TRANSFER':'JAZZCASH';
            return (
              <div key={a.id} style={{background:bg,border:`2px solid ${col}`,borderRadius:16,padding:'20px 22px',minHeight:210,boxShadow:`0 10px 24px ${col}26`,color:'#0f172a'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{width:46,height:46,borderRadius:12,background:'#0f172a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,flexShrink:0}}>
                    {isEP?'EP':isBank?'BK':'JC'}
                  </div>
                  <div>
                    <p style={{color:'#0f172a',fontSize:12,fontWeight:900,margin:'0 0 3px',letterSpacing:.6}}>{methodLabel}</p>
                    <p style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)',fontWeight:900,fontSize:18,margin:0}}>{a.account_title}</p>
                  </div>
                </div>
                <div style={{background:'rgba(15,23,42,.9)',borderRadius:12,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                  <div>
                    <p style={{color:'#cbd5e1',fontSize:10,margin:'0 0 3px',fontWeight:700}}>Account Number</p>
                    <p style={{color:'#facc15',fontFamily:'monospace',fontSize:17,fontWeight:900,letterSpacing:1,margin:0,wordBreak:'break-all'}}>{a.account_number}</p>
                  </div>
                  <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Number copied! 📋');}} style={{background:'#facc15',border:'none',color:'#111827',borderRadius:8,padding:'7px 12px',cursor:'pointer',fontSize:12,fontWeight:900,fontFamily:'var(--font)'}}>Copy</button>
                </div>
                {isBank&&(
                  <div style={{marginTop:10,color:'#0f172a',fontSize:13,lineHeight:1.7,fontWeight:700}}>
                    <div>Bank: <b style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)'}}>{a.bank_name||'Bank Transfer'}</b></div>
                    <div>Account title: <b style={{color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.55)'}}>{a.account_title}</b></div>
                  </div>
                )}
                {a.deposit_message && (
                  <div style={{marginTop:12,background:'rgba(255,255,255,.72)',border:'1px solid rgba(15,23,42,.15)',borderRadius:10,padding:'10px 12px',display:'flex',gap:8,alignItems:'flex-start'}}>
                    <span style={{fontSize:15,flexShrink:0}}>💬</span>
                    <p style={{color:'#0f172a',fontSize:12,margin:0,lineHeight:1.6,whiteSpace:'pre-wrap',fontWeight:700}}>{a.deposit_message}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:16,marginBottom:28}}>
          <p style={{color:'var(--red)',fontSize:13,margin:0}}>⚠️ No payment accounts available. Contact support.</p>
        </div>
      )}

      {/* Method Selector */}
      {epAccounts.length>0&&(
        <>
          <p style={{color:'var(--muted)',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:12}}>PAYMENT METHOD</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:14,marginBottom:22,maxWidth:760}}>
            {['easypaisa','jazzcash'].map(m=>{
              const isEP=m==='easypaisa'; const col=isEP?'#3cb559':'#e8001e';
              const hasAccs=epAccounts.some(a=>(a.method_type||'easypaisa')===m);
              return (
                <div key={m} onClick={()=>hasAccs&&setSelectedMethod(m)}
                  style={{minHeight:92,padding:'18px 14px',borderRadius:16,border:`2px solid ${selectedMethod===m?col:'var(--border)'}`,background:selectedMethod===m?(isEP?'#dcfce7':'#fee2e2'):'var(--card)',cursor:hasAccs?'pointer':'not-allowed',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',boxShadow:selectedMethod===m?`0 8px 22px ${col}33`:'none',opacity:hasAccs?1:.55}}>
                  <span style={{fontSize:18,fontWeight:900,color:selectedMethod===m?'#0f172a':'var(--muted)'}}>{isEP?'EP':'JC'}</span>
                  <span style={{color:selectedMethod===m?'#0f172a':'var(--muted)',fontWeight:900,fontSize:15}}>{isEP?'Easypaisa':'JazzCash'}</span>
                  {!hasAccs&&<span style={{color:'var(--dim)',fontSize:10,fontWeight:700}}>Not available</span>}
                </div>
              );
            })}
            <div onClick={()=>epAccounts.some(a=>a.method_type==='bank')&&setSelectedMethod('bank')}
              style={{minHeight:92,padding:'18px 14px',borderRadius:16,border:`2px solid ${selectedMethod==='bank'?'#3b82f6':'var(--border)'}`,background:selectedMethod==='bank'?'#dbeafe':'var(--card)',cursor:epAccounts.some(a=>a.method_type==='bank')?'pointer':'not-allowed',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',boxShadow:selectedMethod==='bank'?'0 8px 22px #3b82f633':'none',opacity:epAccounts.some(a=>a.method_type==='bank')?1:.55}}>
              <span style={{fontSize:18,fontWeight:900,color:selectedMethod==='bank'?'#0f172a':'var(--muted)'}}>BK</span>
              <span style={{color:selectedMethod==='bank'?'#0f172a':'var(--muted)',fontWeight:900,fontSize:15}}>Bank Transfer</span>
              {!epAccounts.some(a=>a.method_type==='bank')&&<span style={{color:'var(--dim)',fontSize:10,fontWeight:700}}>Not available</span>}
            </div>
          </div>
        </>
      )}

      {/* Submit Form */}
      {(()=>{
        if(selectedMethod==='bank'){
          return (
            <form onSubmit={handleDeposit} className="sgc-form" style={{background:'#0a1628',border:'1px solid #1e4080',maxWidth:520}}>
              <label className="sgc-label">Amount (PKR)</label>
              <input className="sgc-input" type="number" min={minDeposit} placeholder={`Min Rs. ${minDeposit}`} value={deposit.amount_pkr} onChange={e=>setDeposit({...deposit,amount_pkr:e.target.value})} required/>
              <label className="sgc-label">Bank Name</label>
              <input className="sgc-input" placeholder="e.g. HBL, UBL, Meezan Bank" value={deposit.bank_name} onChange={e=>setDeposit({...deposit,bank_name:e.target.value})} required/>
              <label className="sgc-label">Account Holder Name</label>
              <input className="sgc-input" placeholder="e.g. Ali Hassan" value={deposit.bank_account_holder} onChange={e=>setDeposit({...deposit,bank_account_holder:e.target.value})} required/>
              <label className="sgc-label">Account Number / IBAN</label>
              <input className="sgc-input" placeholder="e.g. PK36HABB0000123456789012" value={deposit.bank_account_number} onChange={e=>setDeposit({...deposit,bank_account_number:e.target.value})} required/>
              <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
              <div style={{marginBottom:16}}>
                <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'20px',textAlign:'center',cursor:'pointer',background:'var(--bg)',transition:'border-color .2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setScreenshot(e.target.files[0])}/>
                  {screenshot?(
                    <div><img src={URL.createObjectURL(screenshot)} alt="preview" style={{maxHeight:120,borderRadius:8,marginBottom:6}}/><p style={{color:'var(--green)',fontSize:12,margin:0}}>✓ {screenshot.name}</p></div>
                  ):(
                    <div><p style={{fontSize:28,margin:'0 0 6px'}}>📸</p><p style={{color:'var(--dim)',fontSize:13,margin:0}}>Click to upload screenshot</p><p style={{color:'var(--dim)',fontSize:11,margin:'4px 0 0'}}>JPG, PNG supported</p></div>
                  )}
                </label>
              </div>
              <label className="sgc-label">Note (optional)</label>
              <input className="sgc-input" placeholder="Any note for admin" value={deposit.screenshot_note} onChange={e=>setDeposit({...deposit,screenshot_note:e.target.value})}/>
              <button className="sgc-btn-primary" type="submit" disabled={isSubmitting} style={{background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', opacity: isSubmitting ? 0.7 : 1}}>
                {isSubmitting ? '⏳ Submitting...' : '📤 Submit Deposit Request'}
              </button>
            </form>
          );
        }
        const col=selectedMethod==='easypaisa'?'#3cb559':'#e8001e';
        const filtered=epAccounts.filter(a=>(a.method_type||'easypaisa')===selectedMethod);
        if(!filtered.length) return <p style={{color:'var(--dim)',fontSize:13}}>No {selectedMethod} account available.</p>;
        return (
          <form onSubmit={handleDeposit} className="sgc-form" style={{background:'#0d1e38',border:'1px solid #1e4080',maxWidth:520}}>
            <label className="sgc-label">Amount (PKR)</label>
            <input className="sgc-input" type="number" min={minDeposit} placeholder={`Min Rs. ${minDeposit}`} value={deposit.amount_pkr} onChange={e=>setDeposit({...deposit,amount_pkr:e.target.value,easypaisa_account_id:filtered[0].id})} required/>
            <label className="sgc-label">Send By (Your Account Name)</label>
            <input className="sgc-input" placeholder="e.g. Ali Hassan" value={deposit.sender_name} onChange={e=>setDeposit({...deposit,sender_name:e.target.value})} required/>
            <label className="sgc-label">Your {selectedMethod==='easypaisa'?'Easypaisa':'JazzCash'} Number</label>
            <input className="sgc-input" type="tel" placeholder="03XX-XXXXXXX" value={deposit.transaction_id} onChange={e=>setDeposit({...deposit,transaction_id:e.target.value})} required/>
            <label className="sgc-label">TRX ID (Transaction ID)</label>
            <input className="sgc-input" placeholder="Enter transaction ID" value={deposit.trx_id} onChange={e=>setDeposit({...deposit,trx_id:e.target.value})} required/>
            <label className="sgc-label">Payment Screenshot <span style={{color:'var(--red)'}}>*</span></label>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'20px',textAlign:'center',cursor:'pointer',background:'var(--bg)',transition:'border-color .2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor=col} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setScreenshot(e.target.files[0])}/>
                {screenshot?(
                  <div><img src={URL.createObjectURL(screenshot)} alt="preview" style={{maxHeight:120,borderRadius:8,marginBottom:6}}/><p style={{color:'var(--green)',fontSize:12,margin:0}}>✓ {screenshot.name}</p></div>
                ):(
                  <div><p style={{fontSize:28,margin:'0 0 6px'}}>📸</p><p style={{color:'var(--dim)',fontSize:13,margin:0}}>Click to upload screenshot</p><p style={{color:'var(--dim)',fontSize:11,margin:'4px 0 0'}}>JPG, PNG supported</p></div>
                )}
              </label>
            </div>
            <label className="sgc-label">Note (optional)</label>
            <input className="sgc-input" placeholder="Any note for admin" value={deposit.screenshot_note} onChange={e=>setDeposit({...deposit,screenshot_note:e.target.value})}/>
            <button className="sgc-btn-primary" type="submit" disabled={isSubmitting} style={{background:`linear-gradient(135deg,${col},${selectedMethod==='easypaisa'?'#2a8c42':'#b5001a'})`, opacity: isSubmitting ? 0.7 : 1}}>
              {isSubmitting ? '⏳ Submitting...' : '📤 Submit Deposit Request'}
            </button>
          </form>
        );
      })()}
    </div>
  );
}