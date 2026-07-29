const fs = require('fs');

// ── FIX 1: Remove duplicate Account Title in AdminPanel.js ──
const apPath = 'c:/Users/pc/Desktop/ptc pro/frontend/src/pages/AdminPanel.js';
let apLines = fs.readFileSync(apPath, 'utf8').split('\n');

// Lines 767-768 (index 766-767) are the duplicate Account Title before Bank Name block
// Remove them only if they match the pattern
if (apLines[766].includes('Account Title (Name)') && apLines[767].includes('account_title') && apLines[768].includes("method_type==='bank'")) {
  apLines.splice(766, 2); // remove the first Account Title label + input
  process.stderr.write('Removed duplicate Account Title at index 766\n');
}

// ── FIX 2: Add min_campaign_users setting in ad-requests tab ──
// Find the Free Plan Days Setting block and add Min Campaign Users after it
const apContent = apLines.join('\n');
const minUsersSetting = `
                {/* Min Campaign Users Setting */}
                <div className="sgc-form" style={{maxWidth:420,marginBottom:24}}>
                  <h4 style={{color:'var(--purple)',fontSize:13,fontWeight:700,marginBottom:12}}>👥 Minimum Users Per Campaign</h4>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="1" max="10000" value={minCampaignUsers} onChange={e=>setMinCampaignUsers(parseInt(e.target.value))}/>
                    <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={async()=>{
                      await API.put('/admin/settings/min_campaign_users',{value:String(minCampaignUsers)});
                      notify('Min users updated \u2705');
                    }}>Save</button>
                  </div>
                  <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Advertisers must target at least <b style={{color:'var(--purple)'}}>{minCampaignUsers} users</b> per campaign.</p>
                </div>`;

fs.writeFileSync(apPath, apLines.join('\n'), 'utf8');
process.stderr.write('AdminPanel duplicate removed\n');

// ── FIX 3: Dashboard.js updates ──
const dbPath = 'c:/Users/pc/Desktop/ptc pro/frontend/src/pages/Dashboard.js';
let db = fs.readFileSync(dbPath, 'utf8');
let dbLines = db.split('\n');

// A) Add minCampaignUsers state in AdminPanel
// Find the line with adBudgetRate state and add minCampaignUsers after loadAll
let apFull = fs.readFileSync(apPath, 'utf8');

// Add state for minCampaignUsers
apFull = apFull.replace(
  "const [adBudgetRate, setAdBudgetRate] = useState(1);",
  "const [adBudgetRate, setAdBudgetRate] = useState(1);\n  const [minCampaignUsers, setMinCampaignUsers] = useState(50);"
);

// Load it in loadAll
apFull = apFull.replace(
  "API.get('/admin/ad-budget-rate').then(r=>{ setAdBudgetRate(r.data.rate_pkr); setNewBudgetRate(r.data.rate_pkr); setWelcomeMsg(r.data.welcome_message||''); }).catch(()=>{});",
  "API.get('/admin/ad-budget-rate').then(r=>{ setAdBudgetRate(r.data.rate_pkr); setNewBudgetRate(r.data.rate_pkr); setWelcomeMsg(r.data.welcome_message||''); }).catch(()=>{});\n    API.get('/admin/settings').then(r=>{ if(r.data.min_campaign_users) setMinCampaignUsers(parseInt(r.data.min_campaign_users)||50); }).catch(()=>{});"
);

// Add Min Campaign Users block after Free Plan Days block
apFull = apFull.replace(
  "                {/* Free Plan Days Setting */}\n                <div className=\"sgc-form\" style={{maxWidth:420,marginBottom:24}}>\n                  <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:12}}>⏰ Free Plan Duration (Days)</h4>",
  `                {/* Min Campaign Users Setting */}
                <div className="sgc-form" style={{maxWidth:420,marginBottom:24}}>
                  <h4 style={{color:'var(--purple)',fontSize:13,fontWeight:700,marginBottom:12}}>\uD83D\uDC65 Minimum Users Per Campaign</h4>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <input className="sgc-input" style={{margin:0,flex:1}} type="number" min="1" max="10000" value={minCampaignUsers} onChange={e=>setMinCampaignUsers(parseInt(e.target.value))}/>
                    <button className="sgc-btn-yellow" style={{width:'auto',padding:'10px 20px',whiteSpace:'nowrap'}} onClick={async()=>{ await API.put('/admin/settings/min_campaign_users',{value:String(minCampaignUsers)}); notify('Min users updated \u2705'); }}>Save</button>
                  </div>
                  <p style={{color:'var(--dim)',fontSize:12,marginTop:8}}>Advertisers must target at least <b style={{color:'var(--purple)'}}>{minCampaignUsers} users</b> per campaign.</p>
                </div>

                {/* Free Plan Days Setting */}
                <div className="sgc-form" style={{maxWidth:420,marginBottom:24}}>
                  <h4 style={{color:'var(--accent)',fontSize:13,fontWeight:700,marginBottom:12}}>\u23F0 Free Plan Duration (Days)</h4>`
);

fs.writeFileSync(apPath, apFull, 'utf8');
process.stderr.write('AdminPanel min campaign users added\n');

// ── FIX 4: Dashboard.js - Campaign status, simplified viewer list, free plan notification ──

// A) Add minCampaignUsers state to Dashboard
db = db.replace(
  "const [myAdRequests, setMyAdRequests] = useState([]);",
  "const [myAdRequests, setMyAdRequests] = useState([]);\n  const [minCampaignUsers, setMinCampaignUsers] = useState(50);"
);

// Load minCampaignUsers in user settings
db = db.replace(
  "API.get('/user/settings').then(r=>{ setSiteSettings(r.data); setReferralMsg(r.data.referral_message||''); setDashboardMsg(r.data.dashboard_message||''); setWithdrawalMsg(r.data.withdrawal_message||''); setAdvertiserMsg(r.data.advertiser_message||''); }).catch(()=>{});",
  "API.get('/user/settings').then(r=>{ setSiteSettings(r.data); setReferralMsg(r.data.referral_message||''); setDashboardMsg(r.data.dashboard_message||''); setWithdrawalMsg(r.data.withdrawal_message||''); setAdvertiserMsg(r.data.advertiser_message||''); if(r.data.min_campaign_users) setMinCampaignUsers(parseInt(r.data.min_campaign_users)||50); }).catch(()=>{});"
);

// B) Add validation in ad form submit - find members_needed append line
db = db.replace(
  "fd.append('members_needed', parseInt(adForm.members_needed));",
  `if(parseInt(adForm.members_needed) < minCampaignUsers){ notify('Minimum '+minCampaignUsers+' users required per campaign','error'); return; }
                        fd.append('members_needed', parseInt(adForm.members_needed));`
);

// C) Update members_needed input placeholder
db = db.replace(
  'placeholder="e.g. 100" value={adForm.members_needed}',
  'placeholder={`Min ${minCampaignUsers} users`} value={adForm.members_needed}'
);

// D) Add 'Processing' status badge handling - find the status display in campaign cards
db = db.replace(
  "{isApproved?'✅ ACTIVE':isCompleted?'🏁 DONE':isRejected?'REJECTED':'⏳ PENDING'}",
  "{isApproved?'✅ ACTIVE':isCompleted?'🏁 DONE':isRejected?'❌ REJECTED':'⏳ Processing'}"
);

// E) Simplify campaign viewer list - only show username, plan, expiry (remove KYC)
// Find the viewers map and simplify
db = db.replace(
  `                                      <div key={vi} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:vi<campaignViewers[r.id].length-1?'1px solid var(--border)':'none'}}>
                                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                                          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--bg)',flexShrink:0}}>{v.username[0].toUpperCase()}</div>
                                          <span style={{color:'var(--text)',fontSize:13,fontWeight:600}}>@{v.username}</span>
                                        </div>
                                        <span style={{color:'var(--dim)',fontSize:11}}>{new Date(v.viewed_at).toLocaleDateString()}</span>
                                      </div>`,
  `                                      <div key={vi} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:vi<campaignViewers[r.id].length-1?'1px solid var(--border)':'none'}}>
                                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                                          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--bg)',flexShrink:0}}>{v.username[0].toUpperCase()}</div>
                                          <span style={{color:'var(--text)',fontSize:13,fontWeight:600}}>@{v.username}</span>
                                        </div>
                                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                                          <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,textTransform:'capitalize'}}>{v.membership||'free'}</span>
                                          <span style={{color:'var(--dim)',fontSize:11}}>{new Date(v.viewed_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>`
);

// F) Add free-plan notification on dashboard load - after loadData useEffect
db = db.replace(
  "  useEffect(()=>{ loadData(); },[loadData]);",
  `  useEffect(()=>{ loadData(); },[loadData]);

  // ── Show free plan activation reminder once per session ──
  useEffect(()=>{
    const shown = sessionStorage.getItem('freePlanNotifShown');
    if(!shown){
      sessionStorage.setItem('freePlanNotifShown','1');
      setTimeout(()=>{
        setMsg({text:'\uD83C\uDF1F Please go to Membership Plan and activate your Free Plan!',type:'info'});
        setTimeout(()=>setMsg({text:'',type:''}),12000);
      },2000);
    }
  },[]);`
);

// G) Update toast to support info type (blue color)
db = db.replace(
  "{msg.text && <div className=\"sgc-toast\" style={{background:msg.type==='error'?'var(--red)':'var(--green)',color:msg.type==='error'?'#fff':'var(--bg)'}}>{msg.text}</div>}",
  "{msg.text && <div className=\"sgc-toast\" style={{background:msg.type==='error'?'var(--red)':msg.type==='info'?'#1e3a6e':'var(--green)',color:msg.type==='error'?'#fff':msg.type==='info'?'var(--accent)':'var(--bg)',border:msg.type==='info'?'1px solid var(--accent)':'none'}}>{msg.text}</div>}"
);

fs.writeFileSync(dbPath, db, 'utf8');
process.stderr.write('Dashboard.js updated\n');

process.stderr.write('All done!\n');
