import React from 'react';
import API from '../../api';

export default function AdminMessages({ 
  whatsappLink, whatsappInput, setWhatsappInput, setWhatsappLink,
  transferMsg, transferMsgInput, setTransferMsgInput, setTransferMsg,
  referralMsg, referralMsgInput, setReferralMsgInput, setReferralMsg,
  dashboardMsg, dashboardMsgInput, setDashboardMsgInput, setDashboardMsg,
  regBonus, registrationBonus, regBonusInput, setRegBonusInput, setRegistrationBonus,
  withdrawalMsg, withdrawalMsgInput, setWithdrawalMsgInput, setWithdrawalMsg,
  advertiserMsg, advertiserMsgInput, setAdvertiserMsgInput, setAdvertiserMsg,
  adSectionMsg, adSectionMsgInput, setAdSectionMsgInput, setAdSectionMsg,
  setTab, notify 
}) {
  return (
    <div>
      <h2 className="sgc-heading">📣 Notifications & Messages</h2>

      {/* WhatsApp */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'#25d366',fontSize:13,fontWeight:700,marginBottom:12}}>📱 WhatsApp Group Link</h4>
        <input className="sgc-input" placeholder="https://chat.whatsapp.com/xxxxx" value={whatsappInput} onChange={e=>setWhatsappInput(e.target.value)}/>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:'10px',background:'#25d366',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}} onClick={async()=>{ await API.put('/admin/settings/whatsapp_link',{value:whatsappInput}); setWhatsappLink(whatsappInput); notify('Saved ✅'); }}>Save</button>
          {whatsappLink&&<button style={{flex:1,padding:'10px',background:'#450a0a',border:'none',borderRadius:10,color:'#fca5a5',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'var(--font)'}} onClick={async()=>{ await API.put('/admin/settings/whatsapp_link',{value:''}); setWhatsappLink(''); setWhatsappInput(''); notify('Removed'); }}>Remove</button>}
        </div>
        {whatsappLink&&<p style={{color:'#25d366',fontSize:12,marginTop:8}}>Current: {whatsappLink}</p>}
      </div>

      {/* Send Funds Message */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:4}}>💬 Send Funds Section Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Send Funds form ke neeche show hoga</p>
        <textarea className="sgc-input" rows={3} placeholder="e.g. Minimum transfer Rs. 50..." value={transferMsgInput} onChange={e=>setTransferMsgInput(e.target.value)} style={{resize:'vertical',minHeight:70}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/transfer_message',{value:transferMsgInput}); setTransferMsg(transferMsgInput); notify('Saved ✅'); }}>Save</button>
      </div>

      {/* Referral Message */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'var(--purple)',fontSize:13,fontWeight:700,marginBottom:4}}>👥 Referral Section Custom Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Referral link ke sath user ko jo message show hoga</p>
        <textarea className="sgc-input" rows={3} placeholder="e.g. Apne dosto ko refer karein aur har click par commission kamayein!" value={referralMsgInput} onChange={e=>setReferralMsgInput(e.target.value)} style={{resize:'vertical',minHeight:70}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/referral_message',{value:referralMsgInput}); setReferralMsg(referralMsgInput); notify('Saved ✅'); }}>Save</button>
        {referralMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {referralMsg.substring(0,80)}{referralMsg.length>80?'...':''}</p>}
      </div>

      {/* Dashboard Bottom Message */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'var(--yellow)',fontSize:13,fontWeight:700,marginBottom:4}}>📋 User Dashboard Bottom Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>User dashboard ke end mein show hoga</p>
        <textarea className="sgc-input" rows={4} placeholder="e.g. Roz ads dekhen aur zyada kamayen!" value={dashboardMsgInput} onChange={e=>setDashboardMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/dashboard_message',{value:dashboardMsgInput}); setDashboardMsg(dashboardMsgInput); notify('Saved ✅'); }}>Save</button>
        {dashboardMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {dashboardMsg.substring(0,80)}{dashboardMsg.length>80?'...':''}</p>}
      </div>

      {/* Registration Bonus */}
      <div className="sgc-form" style={{maxWidth:480,marginBottom:24}}>
        <h4 style={{color:'var(--green)',fontSize:13,fontWeight:700,marginBottom:4}}>🎁 Registration Bonus (Rs.)</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Naye user register hone par yeh bonus milega. User plan buy karne ke baad hi withdraw kar sakta hai.</p>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="0" step="0.01" placeholder="e.g. 50" value={regBonusInput} onChange={e=>setRegBonusInput(e.target.value)}/>
          <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={async()=>{ await API.put('/admin/settings/registration_bonus',{value:String(regBonusInput)}); setRegistrationBonus(parseFloat(regBonusInput)); notify('Saved ✅'); }}>Save</button>
        </div>
        <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Current: <b style={{color:'var(--green)'}}>Rs. {registrationBonus}</b> per new registration</p>
      </div>

      {/* Withdrawal Page Message */}
      <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
        <h4 style={{color:'var(--red)',fontSize:13,fontWeight:700,marginBottom:4}}>💸 Withdrawal Page Custom Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Payout/Withdraw page par form ke neeche show hoga. Withdrawal timings, rules, ya koi notice likhein.</p>
        <textarea className="sgc-input" rows={4} placeholder="e.g. Withdrawal requests process hone mein 24-48 hours lag sakte hain..." value={withdrawalMsgInput} onChange={e=>setWithdrawalMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/withdrawal_message',{value:withdrawalMsgInput}); setWithdrawalMsg(withdrawalMsgInput); notify('Saved ✅'); }}>Save</button>
        {withdrawalMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {withdrawalMsg.substring(0,80)}{withdrawalMsg.length>80?'...':''}</p>}
      </div>

      {/* Advertiser Message */}
      <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
        <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:4}}>📢 Advertiser Custom Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>Yeh message sirf advertisers ko "Advertise" section mein dikhega. Rules, guidelines, approval policy likhein.</p>
        <textarea className="sgc-input" rows={8} placeholder="e.g. Apna ad submit karne se pehle in rules ko zaroor parhein..." value={advertiserMsgInput} onChange={e=>setAdvertiserMsgInput(e.target.value)} style={{resize:'vertical',minHeight:150}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/advertiser_message',{value:advertiserMsgInput}); setAdvertiserMsg(advertiserMsgInput); notify('Saved ✅'); }}>Save</button>
        {advertiserMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {advertiserMsg.substring(0,80)}{advertiserMsg.length>80?'...':''}</p>}
      </div>

      {/* Ad Section Message */}
      <div className="sgc-form" style={{maxWidth:480,marginTop:24}}>
        <h4 style={{color:'#f59e0b',fontSize:13,fontWeight:700,marginBottom:4}}>📺 Advertisement Section Message</h4>
        <p style={{color:'var(--dim)',fontSize:11,marginBottom:12}}>User ke Advertisement tab mein ads se pehle ek notice box mein show hoga</p>
        <textarea className="sgc-input" rows={4} placeholder="e.g. Roz ads dekhen aur zyada kamayen! Har ad ke baad earning turant credit hoti hai." value={adSectionMsgInput} onChange={e=>setAdSectionMsgInput(e.target.value)} style={{resize:'vertical',minHeight:90}}/>
        <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 24px'}} onClick={async()=>{ await API.put('/admin/settings/ad_section_message',{value:adSectionMsgInput}); setAdSectionMsg(adSectionMsgInput); notify('Saved ✅'); }}>Save</button>
        {adSectionMsg&&<p style={{color:'var(--dim)',fontSize:11,marginTop:8}}>Current: {adSectionMsg.substring(0,80)}{adSectionMsg.length>80?'...':''}</p>}
      </div>
    </div>
  );
}