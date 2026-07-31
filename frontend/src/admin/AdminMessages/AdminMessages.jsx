import React, { useState, useEffect } from 'react';
import { updateSetting } from '../../services/admin/adminService';
import API from '../../api';

export default function AdminMessages({ notify }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});

  const [whatsappInput, setWhatsappInput] = useState('');
  const [transferMsgInput, setTransferMsgInput] = useState('');
  const [referralMsgInput, setReferralMsgInput] = useState('');
  const [dashboardMsgInput, setDashboardMsgInput] = useState('');
  const [regBonusInput, setRegBonusInput] = useState('');
  const [withdrawalMsgInput, setWithdrawalMsgInput] = useState('');
  const [advertiserMsgInput, setAdvertiserMsgInput] = useState('');
  const [adSectionMsgInput, setAdSectionMsgInput] = useState('');

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSending, setNotifSending] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await API.get('/admin/settings');
      const data = res.data || {};
      setSettings(data);
      setWhatsappInput(data.whatsapp_link || '');
      setTransferMsgInput(data.transfer_message || '');
      setReferralMsgInput(data.referral_message || '');
      setDashboardMsgInput(data.dashboard_message || '');
      setRegBonusInput(String(data.registration_bonus || 0));
      setWithdrawalMsgInput(data.withdrawal_message || '');
      setAdvertiserMsgInput(data.advertiser_message || '');
      setAdSectionMsgInput(data.ad_section_message || '');
    } catch (e) {
      console.error(e);
      if (notify) notify('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key, val, stateKey) => {
    try {
      await updateSetting(key, val);
      setSettings(prev => ({ ...prev, [key]: val }));
      if (notify) notify('Saved ✅');
    } catch (err) {
      if (notify) notify('Error saving setting', 'error');
    }
  };

  const sendNotification = async () => {
    if(!notifTitle || !notifMessage) {
      if(notify) notify('Please enter title and message', 'error');
      return;
    }
    setNotifSending(true);
    try {
      await API.post('/admin/notifications/send', { title: notifTitle, message: notifMessage });
      if(notify) notify('Notification Sent to all users! 🔔');
      setNotifTitle('');
      setNotifMessage('');
    } catch(err) {
      if(notify) notify(err.response?.data?.detail || 'Error sending notification', 'error');
    } finally {
      setNotifSending(false);
    }
  };

  

  return (
    <div>
      <h2 className="sgc-heading">📣 Notifications & Messages</h2>

      {/* Broadcast Notification */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24,background:'#0f172a',padding:20,borderRadius:12,border:'1px solid #334155',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'}}>
        <h4 style={{color:'#38bdf8',fontSize:15,fontWeight:800,marginBottom:8}}>🔔 Send Broadcast Notification</h4>
        <p style={{color:'var(--dim)',fontSize:12,marginBottom:16}}>Yeh notification sab users ko bell icon (🔔) mein show hogi.</p>
        <input className="sgc-input" placeholder="Notification Title..." value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} style={{marginBottom:10}} />
        <textarea className="sgc-input" rows={3} placeholder="Notification Message..." value={notifMessage} onChange={e=>setNotifMessage(e.target.value)} style={{resize:'vertical',minHeight:70,marginBottom:10}}/>
        <button className="sgc-btn-primary" style={{width:'100%',padding:'12px',opacity:notifSending?0.7:1}} onClick={sendNotification} disabled={notifSending}>
          {notifSending ? 'Sending...' : 'Send to All Users'}
        </button>
      </div>

      {/* WhatsApp */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'#25d366',fontSize:13,fontWeight:700,marginBottom:12}}>📱 WhatsApp Group Link</h4>
        <input className="sgc-input" placeholder="https://chat.whatsapp.com/xxxxx" value={whatsappInput} onChange={e=>setWhatsappInput(e.target.value)}/>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:'10px',background:'#25d366',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}} onClick={()=>handleSave('whatsapp_link', whatsappInput)}>Save</button>
          {settings.whatsapp_link&&<button style={{flex:1,padding:'10px',background:'#450a0a',border:'none',borderRadius:10,color:'#fca5a5',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}} onClick={()=>{handleSave('whatsapp_link', ''); setWhatsappInput('');}}>Remove</button>}
        </div>
        {settings.whatsapp_link&&<p style={{color:'#25d366',fontSize:12,marginTop:8}}>Current: {settings.whatsapp_link}</p>}
      </div>

      {/* Send Funds Message */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:4}}>💬 Send Funds Section Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Send Funds form ke neeche show hoga</p>
        <textarea className="sgc-input" rows={3} placeholder="e.g. Minimum transfer Rs. 50..." value={transferMsgInput} onChange={e=>setTransferMsgInput(e.target.value)} style={{resize:'vertical',minHeight:70}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={()=>handleSave('transfer_message', transferMsgInput)}>Save</button>
      </div>

      {/* Referral Message */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'var(--purple)',fontSize:13,fontWeight:700,marginBottom:4}}>👥 Referral Section Custom Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Referral link ke sath user ko jo message show hoga</p>
        <textarea className="sgc-input" rows={3} placeholder="e.g. Apne dosto ko refer karein aur har click par commission kamayein!" value={referralMsgInput} onChange={e=>setReferralMsgInput(e.target.value)} style={{resize:'vertical',minHeight:70}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={()=>handleSave('referral_message', referralMsgInput)}>Save</button>
        {settings.referral_message&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {settings.referral_message.substring(0,80)}{settings.referral_message.length>80?'...':''}</p>}
      </div>

      {/* Dashboard Bottom Message */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'var(--yellow)',fontSize:13,fontWeight:700,marginBottom:4}}>📋 User Dashboard Bottom Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>User dashboard ke end mein show hoga</p>
        <textarea className="sgc-input" rows={4} placeholder="e.g. Roz ads dekhen aur zyada kamayen!" value={dashboardMsgInput} onChange={e=>setDashboardMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={()=>handleSave('dashboard_message', dashboardMsgInput)}>Save</button>
        {settings.dashboard_message&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {settings.dashboard_message.substring(0,80)}{settings.dashboard_message.length>80?'...':''}</p>}
      </div>

      {/* Registration Bonus */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'var(--green)',fontSize:13,fontWeight:700,marginBottom:4}}>🎁 Registration Bonus (Rs.)</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Naye user register hone par yeh bonus milega. User plan buy karne ke baad hi withdraw kar sakta hai.</p>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="0" step="0.01" placeholder="e.g. 50" value={regBonusInput} onChange={e=>setRegBonusInput(e.target.value)}/>
          <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={()=>handleSave('registration_bonus', String(regBonusInput))}>Save</button>
        </div>
        <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Current: <b style={{color:'var(--green)'}}>Rs. {settings.registration_bonus || 0}</b> per new registration</p>
      </div>

      {/* Withdrawal Page Message */}
      <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
        <h4 style={{color:'var(--red)',fontSize:13,fontWeight:700,marginBottom:4}}>💸 Withdrawal Page Custom Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Payout/Withdraw page par form ke neeche show hoga. Withdrawal timings, rules, ya koi notice likhein.</p>
        <textarea className="sgc-input" rows={4} placeholder="e.g. Withdrawal requests process hone mein 24-48 hours lag sakte hain..." value={withdrawalMsgInput} onChange={e=>setWithdrawalMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={()=>handleSave('withdrawal_message', withdrawalMsgInput)}>Save</button>
        {settings.withdrawal_message&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {settings.withdrawal_message.substring(0,80)}{settings.withdrawal_message.length>80?'...':''}</p>}
      </div>

      {/* Advertiser Message */}
      <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
        <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:4}}>📢 Advertiser Custom Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Yeh message sirf advertisers ko "Advertise" section mein dikhega. Rules, guidelines, approval policy likhein.</p>
        <textarea className="sgc-input" rows={8} placeholder="e.g. Apna ad submit karne se pehle in rules ko zaroor parhein..." value={advertiserMsgInput} onChange={e=>setAdvertiserMsgInput(e.target.value)} style={{resize:'vertical',minHeight:150}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={()=>handleSave('advertiser_message', advertiserMsgInput)}>Save</button>
        {settings.advertiser_message&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {settings.advertiser_message.substring(0,80)}{settings.advertiser_message.length>80?'...':''}</p>}
      </div>

      {/* Ad Section Message */}
      <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
        <h4 style={{color:'#f59e0b',fontSize:13,fontWeight:700,marginBottom:4}}>📺 Advertisement Section Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>User ke Advertisement tab mein ads se pehle ek notice box mein show hoga</p>
        <textarea className="sgc-input" rows={4} placeholder="e.g. Roz ads dekhen aur zyada kamayen! Har ad ke baad earning turant credit hoti hai." value={adSectionMsgInput} onChange={e=>setAdSectionMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={()=>handleSave('ad_section_message', adSectionMsgInput)}>Save</button>
        {settings.ad_section_message&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {settings.ad_section_message.substring(0,80)}{settings.ad_section_message.length>80?'...':''}</p>}
      </div>
    </div>
  );
}