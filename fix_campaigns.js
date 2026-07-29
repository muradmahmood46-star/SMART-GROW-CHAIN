const fs = require('fs');
const path = require('path').join(__dirname, 'frontend', 'src', 'pages', 'Dashboard.js');
let c = fs.readFileSync(path, 'utf8');
const nl = c.includes('\r\n') ? '\r\n' : '\n';

// 1. Lighter green bg/border for approved campaigns
c = c.replace(
  "const borderCol = isApproved?'#166534':isCompleted?'#1e4080':isRejected?'#7f1d1d':'#92400e';",
  "const borderCol = isApproved?'#22c55e50':isCompleted?'#1e4080':isRejected?'#7f1d1d':'#92400e';"
);
c = c.replace(
  "const bgCol    = isApproved?'#052e16':isCompleted?'#0c1e3e':isRejected?'#1c0a0a':'#1c1000';",
  "const bgCol    = isApproved?'#0d3d20':isCompleted?'#0c1e3e':isRejected?'#1c0a0a':'#1c1000';"
);

// 2. Bigger progress bar (height 10 -> 16, borderRadius 6 -> 8)
c = c.replace(
  "<div style={{height:10,background:'#0b1120',borderRadius:6,overflow:'hidden',border:'1px solid var(--border)'}}>",
  "<div style={{height:16,background:'#0b1120',borderRadius:8,overflow:'hidden',border:'1px solid var(--border)'}}>"
);
c = c.replace(
  "borderRadius:6,transition:'width .6s ease',boxShadow:`0 0 8px ${accentCol}66`",
  "borderRadius:8,transition:'width .6s ease',boxShadow:`0 0 12px ${accentCol}99`"
);

// 3. Wider campaign column
c = c.replace(
  "                  <div style={{flex:'1 1 300px',minWidth:0}}>",
  "                  <div style={{flex:'1 1 380px',minWidth:0}}>"
);

// 4. Add reactivate button right after progress bar closing div (before Action Buttons section)
// Find the progress bar closing div and insert reactivate button after it
const progressClose = `                            </div>

                            {/* Action Buttons */}`;
const withReactivate = `                            </div>

                            {/* Reactivate Button — below progress for all statuses */}
                            <div style={{padding:'12px 16px 0'}}>
                              <button onClick={async()=>{
                                try{
                                  await API.post(\`/user/ad-request/reactivate/\${r.id}\`);
                                  notify('Campaign reactivated! 🚀');
                                  API.get('/user/ad-request/my-requests').then(res=>setMyAdRequests(res.data));
                                  API.get('/user/profile').then(res=>setProfile(res.data));
                                }catch(err){ notify(err.response?.data?.detail||'Error','error'); }
                              }} style={{width:'100%',padding:'13px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',boxShadow:'0 2px 12px rgba(124,58,237,.35)'}}>
                                <span style={{fontSize:18}}>🔄</span> Reactivate Campaign
                              </button>
                            </div>

                            {/* Action Buttons */}`;
c = c.replace(progressClose, withReactivate);

// 5. Remove old reactivate button (only for isRejected||isCompleted)
c = c.replace(
  `                              {/* Reactivate Button */}
                              {(isRejected||isCompleted) && (
                                <button onClick={async()=>{
                                  try{
                                    await API.post(\`/user/ad-request/reactivate/\${r.id}\`);
                                    notify('Campaign reactivated! 🚀');
                                    API.get('/user/ad-request/my-requests').then(res=>setMyAdRequests(res.data));
                                    API.get('/user/profile').then(res=>setProfile(res.data));
                                  }catch(err){ notify(err.response?.data?.detail||'Error','error'); }
                                }} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:14,cursor:'pointer',fontFamily:'var(--font)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s'}}>

                                  <span style={{fontSize:18}}>🔄</span> Reactivate Campaign
                                </button>
                              )}`,
  ''
);

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
