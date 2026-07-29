const fs = require('fs');
const p = 'c:/Users/pc/Desktop/ptc pro/frontend/src/pages/Dashboard.js';
let lines = fs.readFileSync(p, 'utf8').split('\n');

// Fix line 1445 (index 1444): use adPayMethod instead of hardcoded 'easypaisa'
lines[1444] = "                          {epAccounts.filter(a=>a.method_type===adPayMethod).slice(0,1).map(a=>(";

// Fix line 1447 (index 1446): dynamic label
lines[1446] = "                              <p style={{color:'#3cb559',fontSize:11,fontWeight:700,margin:'0 0 10px',letterSpacing:.5}}>{adPayMethod==='jazzcash'?'💳':'📱'} SEND TO THIS {adPayMethod.toUpperCase()} ACCOUNT</p>";

// Bank block to insert after index 1469 (after the easypaisa/jazzcash closing )})
const bankBlock = `                      {adPayMethod==='bank' && (
                        <>
                          {epAccounts.filter(a=>a.method_type==='bank').slice(0,1).map(a=>(
                            <div key={a.id} style={{background:'#0a1628',border:'1.5px solid #3b82f640',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
                              <p style={{color:'#3b82f6',fontSize:11,fontWeight:700,margin:'0 0 10px',letterSpacing:.5}}>🏦 SEND TO THIS BANK ACCOUNT</p>
                              <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',marginBottom:8}}>
                                <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Bank Name</p>
                                <p style={{color:'#3b82f6',fontWeight:700,fontSize:14,margin:0}}>{a.bank_name||a.account_title}</p>
                              </div>
                              <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',marginBottom:8}}>
                                <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Account Title (Name)</p>
                                <p style={{color:'var(--text)',fontWeight:700,fontSize:14,margin:0}}>{a.account_title}</p>
                              </div>
                              <div style={{background:'#0b1a30',borderRadius:8,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                <div>
                                  <p style={{color:'var(--dim)',fontSize:10,margin:'0 0 2px'}}>Bank / IBAN Account Number</p>
                                  <p style={{color:'#3b82f6',fontFamily:'monospace',fontSize:15,fontWeight:800,letterSpacing:1,margin:0}}>{a.account_number}</p>
                                </div>
                                <button type="button" onClick={()=>{navigator.clipboard.writeText(a.account_number);notify('Copied! \uD83D\uDCCB');}} style={{background:'#3b82f622',border:'1px solid #3b82f6',color:'#3b82f6',borderRadius:7,padding:'5px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'var(--font)'}}>Copy</button>
                              </div>
                            </div>
                          ))}
                          {epAccounts.filter(a=>a.method_type==='bank').length===0&&(
                            <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:14,marginBottom:16}}>
                              <p style={{color:'var(--red)',fontSize:13,margin:0}}>\u26A0\uFE0F No Bank account available. Use wallet or contact support.</p>
                            </div>
                          )}
                          <label className="sgc-label">Payment Screenshot</label>
                          <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:10,padding:'16px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:16}}>
                            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>setAdScreenshot(e.target.files[0])}/>
                            {adScreenshot?<p style={{color:'var(--green)',margin:0}}>\u2713 {adScreenshot.name}</p>:<p style={{color:'var(--dim)',margin:0}}>\uD83D\uDCF8 Click to upload screenshot</p>}
                          </label>
                        </>
                      )}`;

// Insert after index 1469
lines.splice(1470, 0, bankBlock);

fs.writeFileSync(p, lines.join('\n'), 'utf8');
process.stderr.write('Done. Lines: ' + lines.length);
