/* eslint-disable */
import React, { useState, useEffect } from 'react';
import API from '../../api';
import { approveKyc, rejectKyc, markKycAsSeen } from '../../services/admin/adminService';

export default function KYCRequests({ notify, loadData }) {
  const [kycRequests, setKycRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKyc = async () => {
    try {
      const res = await API.get('/admin/kyc');
      setKycRequests(res.data);
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch KYC requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
    markKycAsSeen().then(() => {
      if (loadData) loadData();
    }).catch(console.error);
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveKyc(id);
      fetchKyc();
      if (loadData) loadData();
      if (notify) notify('KYC Approved ✅');
    } catch (e) {
      if (notify) notify('Error approving KYC', 'error');
    }
  };

  const handleReject = async (id) => {
    const note = prompt('Rejection reason (optional):', '');
    if (note === null) return;
    try {
      await rejectKyc(id, note);
      fetchKyc();
      if (loadData) loadData();
      if (notify) notify('KYC Rejected');
    } catch (e) {
      if (notify) notify('Error rejecting KYC', 'error');
    }
  };

  

  return (
    <div>
      <div className="sgc-page-header">
        <h2 className="sgc-heading">🪪 KYC Requests</h2>
        <span style={{color:'var(--red)',fontSize:13,background:'var(--card)',padding:'4px 12px',borderRadius:20,border:'1px solid var(--border)'}}>{kycRequests.filter(k=>k.status==='pending').length} pending</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {kycRequests.map(k=>{
          const isPending=k.status==='pending';
          const borderCol=isPending?'#f59e0b':k.status==='approved'?'#3cb559':'#ef4444';
          return (
            <div key={k.id} className="fade-in" style={{background:'var(--card)',border:`1.5px solid ${borderCol}40`,borderRadius:14,overflow:'hidden'}}>
              <div style={{background:isPending?'#451a0320':k.status==='approved'?'#064e3b20':'#450a0a20',padding:'10px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${borderCol}30`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'var(--bg)',flexShrink:0}}>{k.username?.[0]?.toUpperCase()}</div>
                  <div>
                    <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>@{k.username}</p>
                    <p style={{color:'var(--dim)',fontSize:11,margin:0}}>{new Date(k.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span style={{background:isPending?'#451a03':k.status==='approved'?'#064e3b':'#450a0a',color:isPending?'#f59e0b':k.status==='approved'?'#4ade80':'#fca5a5',padding:'3px 14px',borderRadius:20,fontSize:11,fontWeight:700}}>{k.status.toUpperCase()}</span>
              </div>
              <div style={{padding:'16px 20px',display:'flex',gap:20,flexWrap:'wrap'}}>
                <div style={{flex:'1 1 200px'}}>
                  <div style={{background:'var(--bg)',borderRadius:8,padding:'8px 12px',marginBottom:8}}>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>FULL NAME</p>
                    <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>{k.full_name}</p>
                  </div>
                  <div style={{background:'var(--bg)',borderRadius:8,padding:'8px 12px',marginBottom:12}}>
                    <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px',fontWeight:600,letterSpacing:.5}}>CNIC</p>
                    <p style={{color:'var(--accent)',fontFamily:'monospace',fontWeight:700,fontSize:14,margin:0}}>{k.cnic}</p>
                  </div>
                  {isPending&&(
                    <div style={{display:'flex',gap:8}}>
                      <button style={{flex:1,padding:'10px',background:'#064e3b',color:'#4ade80',border:'1px solid #166534',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>handleApprove(k.id)}>✓ Approve</button>
                      <button style={{flex:1,padding:'10px',background:'#450a0a',color:'#fca5a5',border:'1px solid #7f1d1d',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:'var(--font)'}} onClick={()=>handleReject(k.id)}>✗ Reject</button>
                    </div>
                  )}
                  {k.status==='rejected' && k.admin_note && <p style={{color:'var(--red)',fontSize:12,marginTop:8}}>Reason: {k.admin_note}</p>}
                </div>
                <div style={{flex:'1 1 300px',display:'flex',gap:12,flexWrap:'wrap'}}>
                  {k.front_photo_url&&(
                    <div style={{textAlign:'center'}}>
                      <p style={{color:'var(--dim)',fontSize:10,fontWeight:600,letterSpacing:.5,marginBottom:6}}>CNIC FRONT</p>
                      <a href={k.front_photo_url} target="_blank" rel="noreferrer">
                        <img src={k.front_photo_url} alt="cnic" style={{width:150,height:110,objectFit:'cover',borderRadius:8,border:'2px solid var(--border)'}}/>
                      </a>
                    </div>
                  )}
                  {k.selfie_photo_url&&(
                    <div style={{textAlign:'center'}}>
                      <p style={{color:'var(--dim)',fontSize:10,fontWeight:600,letterSpacing:.5,marginBottom:6}}>SELFIE WITH CNIC</p>
                      <a href={k.selfie_photo_url} target="_blank" rel="noreferrer">
                        <img src={k.selfie_photo_url} alt="selfie" style={{width:150,height:110,objectFit:'cover',borderRadius:8,border:'2px solid var(--border)'}}/>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {kycRequests.length===0&&<div className="sgc-empty">No KYC requests yet</div>}
      </div>
    </div>
  );
}