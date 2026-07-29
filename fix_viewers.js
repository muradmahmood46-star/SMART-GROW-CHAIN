const fs = require('fs');
const p = 'c:/Users/pc/Desktop/ptc pro/frontend/src/pages/Dashboard.js';
let lines = fs.readFileSync(p, 'utf8').split('\n');

// Fix viewer row (lines 1622-1628, index 1621-1627)
// Replace simple viewer row with enriched but simplified one
const oldRow = [
  "                                      <div key={vi} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:vi<campaignViewers[r.id].length-1?'1px solid var(--border)':'none'}}>",
  "                                        <div style={{display:'flex',alignItems:'center',gap:8}}>",
  "",
  "                                          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--bg)',flexShrink:0}}>{v.username[0].toUpperCase()}</div>",
  "",
  "                                          <span style={{color:'var(--text)',fontSize:13,fontWeight:600}}>@{v.username}</span>",
  "",
  "                                        </div>",
  "",
  "                                        <span style={{color:'var(--dim)',fontSize:11}}>{new Date(v.viewed_at).toLocaleDateString()}</span>",
  "",
  "                                      </div>",
].join('\n');

const newRow = [
  "                                      <div key={vi} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderBottom:vi<campaignViewers[r.id].length-1?'1px solid var(--border)':'none'}}>",
  "                                        <div style={{display:'flex',alignItems:'center',gap:8}}>",
  "                                          <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--bg)',flexShrink:0}}>{v.username[0].toUpperCase()}</div>",
  "                                          <span style={{color:'var(--text)',fontSize:13,fontWeight:600}}>@{v.username}</span>",
  "                                        </div>",
  "                                        <div style={{display:'flex',gap:6,alignItems:'center'}}>",
  "                                          <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,textTransform:'capitalize'}}>{v.membership||'free'}</span>",
  "                                          {v.plan_expires_at&&<span style={{color:new Date(v.plan_expires_at)<new Date()?'var(--red)':'var(--green)',fontSize:10}}>{new Date(v.plan_expires_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>}",
  "                                        </div>",
  "                                      </div>",
].join('\n');

let content = lines.join('\n');
if (content.includes("span style={{color:'var(--dim)',fontSize:11}}>{new Date(v.viewed_at).toLocaleDateString()}</span>")) {
  // do targeted replacement on the viewer row section
  content = content.replace(
    `<span style={{color:'var(--dim)',fontSize:11}}>{new Date(v.viewed_at).toLocaleDateString()}</span>`,
    `<div style={{display:'flex',gap:6,alignItems:'center'}}>
                                          <span style={{background:'#1e3a6e',color:'var(--accent)',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,textTransform:'capitalize'}}>{v.membership||'free'}</span>
                                          {v.plan_expires_at&&<span style={{color:new Date(v.plan_expires_at)<new Date()?'var(--red)':'var(--green)',fontSize:10}}>{new Date(v.plan_expires_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>}
                                        </div>`
  );
  process.stderr.write('Viewer row simplified\n');
} else {
  process.stderr.write('Viewer row pattern not found\n');
}

// Also ensure "Processing" status is shown for pending campaigns (already done but verify)
if (content.includes("'⏳ Processing'")) {
  process.stderr.write('Processing badge: OK\n');
} else {
  process.stderr.write('Processing badge: MISSING\n');
}

// Verify min campaign validation exists
if (content.includes('minCampaignUsers')) {
  process.stderr.write('minCampaignUsers: OK\n');
}

// Verify free plan notification exists
if (content.includes('freePlanNotifShown')) {
  process.stderr.write('freePlan notification: OK\n');
}

// Verify info toast
if (content.includes("type==='info'")) {
  process.stderr.write('Info toast: OK\n');
}

fs.writeFileSync(p, content, 'utf8');
process.stderr.write('Dashboard.js saved\n');
