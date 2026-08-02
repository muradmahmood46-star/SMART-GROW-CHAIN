import React, { useState } from 'react';
import API from '../api';

export default function KYCVerification({ kycData, notify, setTab, loadData }) {
  const [kycForm, setKycForm] = useState({ first_name:'', last_name:'', phone:'', cnic:'' });
  const [kycFront, setKycFront] = useState(null);
  const [kycSelfie, setKycSelfie] = useState(null);

  return (
    <div>
      <h2 className="sgc-heading">🪪 KYC Verification</h2>
      {/* Status badge */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24,padding:'14px 18px',background:'var(--card)',borderRadius:12,border:'1px solid var(--border)',maxWidth:480}}>
        <span style={{fontSize:32}}>
          {kycData?.kyc_status==='approved'?'✅':kycData?.kyc_status==='pending'?'⏳':kycData?.kyc_status==='rejected'?'':'🚪'}
        </span>
        <div>
          <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>KYC Status</p>
          <p style={{color:kycData?.kyc_status==='approved'?'var(--green)':kycData?.kyc_status==='pending'?'var(--yellow)':kycData?.kyc_status==='rejected'?'var(--red)':'var(--dim)',fontSize:13,margin:'2px 0 0',fontWeight:600,textTransform:'capitalize'}}>
            {kycData?.kyc_status==='none'?'Not Submitted':kycData?.kyc_status}
          </p>
          {kycData?.kyc?.admin_note && <p style={{color:'var(--dim)',fontSize:12,margin:'4px 0 0'}}>Note: {kycData.kyc.admin_note}</p>}
        </div>
      </div>

      {kycData?.kyc_status==='approved' ? (
        <div style={{background:'#052e16',border:'1px solid #166534',borderRadius:12,padding:'20px 24px',maxWidth:480}}>
          <p style={{color:'#4ade80',fontWeight:700,fontSize:15,margin:'0 0 8px'}}>✅ KYC Verified Successfully</p>
          <p style={{color:'#fff',fontSize:13,margin:0}}>Your identity has been verified. You can now withdraw funds and access all bonuses.</p>
          {kycData.kyc && (
            <div style={{marginTop:14,borderTop:'1px solid var(--border)',paddingTop:14}}>
              <p style={{color:'#fff',fontSize:12,margin:'0 0 4px'}}>Name: <b>{kycData.kyc.full_name}</b></p>
              <p style={{color:'#fff',fontSize:12,margin:0}}>CNIC: <b>{kycData.kyc.cnic}</b></p>
            </div>
          )}
        </div>
      ) : (
        <form className="sgc-form" style={{maxWidth:480}} onSubmit={async(e)=>{
          e.preventDefault();
          if(!kycForm.first_name.trim()){ notify('First name is required','error'); return; }
          if(!kycForm.last_name.trim()){ notify('Last name is required','error'); return; }
          if(!kycForm.phone.trim()){ notify('Phone number is required','error'); return; }
          if(!kycForm.cnic.trim()){ notify('CNIC number is required','error'); return; }
          if(!kycFront){ notify('CNIC front photo is required','error'); return; }
          if(!kycSelfie){ notify('Selfie with CNIC is required','error'); return; }
          try{
            const fd=new FormData();
            fd.append('full_name', `${kycForm.first_name.trim()} ${kycForm.last_name.trim()}`);
            fd.append('phone', kycForm.phone.trim());
            fd.append('cnic', kycForm.cnic.trim());
            fd.append('front_photo', kycFront);
            fd.append('selfie_photo', kycSelfie);
            await API.post('/user/kyc/submit', fd, { headers:{'Content-Type':'multipart/form-data'} });
            notify('KYC submitted! Admin will verify shortly. ✅');
            if (loadData) loadData();
          }catch(err){ notify(err.response?.data?.detail||'Error','error'); }
        }}>
          <div style={{background:'#0d1e38',border:'1px solid #1e4080',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
            <p style={{color:'var(--accent)',fontSize:13,fontWeight:700,margin:'0 0 6px'}}>📋 KYC Requirements</p>
            <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px'}}>• First & Last name required</p>
            <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px'}}>• Valid phone number required</p>
            <p style={{color:'var(--dim)',fontSize:12,margin:'0 0 4px'}}>• Valid CNIC front photo</p>
            <p style={{color:'var(--dim)',fontSize:12,margin:0}}>• Selfie holding your CNIC</p>
          </div>
          <label className="sgc-label">First Name <span style={{color:'var(--red)'}}>*</span></label>
          <input className="sgc-input" placeholder="e.g. Muhammad" value={kycForm.first_name} onChange={e=>setKycForm({...kycForm,first_name:e.target.value})} required/>
          <label className="sgc-label">Last Name <span style={{color:'var(--red)'}}>*</span></label>
          <input className="sgc-input" placeholder="e.g. Ali" value={kycForm.last_name} onChange={e=>setKycForm({...kycForm,last_name:e.target.value})} required/>
          <label className="sgc-label">Phone Number <span style={{color:'var(--red)'}}>*</span></label>
          <input className="sgc-input" type="tel" placeholder="03XX-XXXXXXX" value={kycForm.phone} onChange={e=>setKycForm({...kycForm,phone:e.target.value})} required/>
          <label className="sgc-label">CNIC Number <span style={{color:'var(--red)'}}>*</span></label>
          <input className="sgc-input" placeholder="XXXXX-XXXXXXX-X" value={kycForm.cnic} onChange={e=>setKycForm({...kycForm,cnic:e.target.value})} required/>
          <label className="sgc-label">CNIC Front Photo <span style={{color:'var(--red)'}}>*</span></label>
          <label style={{display:'block',border:`2px dashed ${kycFront?'var(--green)':'var(--border)'}`,borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setKycFront(e.target.files[0])}/>
            {kycFront?<p style={{color:'var(--green)',margin:0}}>✓ {kycFront.name}</p>:<p style={{color:'var(--dim)',margin:0}}>📷 Upload CNIC Front <span style={{color:'var(--red)'}}>*</span></p>}
          </label>
          <label className="sgc-label">Selfie with CNIC <span style={{color:'var(--red)'}}>*</span></label>
          <label style={{display:'block',border:`2px dashed ${kycSelfie?'var(--green)':'var(--border)'}`,borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setKycSelfie(e.target.files[0])}/>
            {kycSelfie?<p style={{color:'var(--green)',margin:0}}>✓ {kycSelfie.name}</p>:<p style={{color:'var(--dim)',margin:0}}>🤳 Upload Selfie with CNIC <span style={{color:'var(--red)'}}>*</span></p>}
          </label>
          {kycData?.kyc_status==='pending' ? (
            <div style={{background:'#451a03',border:'1px solid #f59e0b',borderRadius:10,padding:'12px 16px',textAlign:'center'}}>
              <p style={{color:'#fbbf24',fontSize:13,margin:0,fontWeight:600}}>⏳ KYC is under review. Please wait for admin approval.</p>
            </div>
          ) : (
            <button className="sgc-btn-primary" type="submit">🚀 Submit KYC</button>
          )}
        </form>
      )}
    </div>
  );
}