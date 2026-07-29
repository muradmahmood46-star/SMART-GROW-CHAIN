f = open('frontend/src/pages/Dashboard.js', 'rb')
c = f.read()
f.close()

old = b"tab==='dashboard' && (\n              <div>\n                <h2 className=\"sgc-heading\">\xf0\x9f\x8f\xa0 Dashboard</h2>"

new = b"""tab==='dashboard' && (
              <div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h2 className=\"sgc-heading\" style={{margin:0}}>Dashboard</h2>
                  <div style={{position:'relative'}}>
                    <button onClick={()=>setShowNotifDropdown(v=>!v)}
                      style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:20,position:'relative',flexShrink:0}}>
                      \xf0\x9f\x94\x94
                      {notifications.filter(n=>!n.is_read).length>0 && (
                        <span style={{position:'absolute',top:-4,right:-4,background:'#ef4444',color:'#fff',borderRadius:'50%',width:18,height:18,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {notifications.filter(n=>!n.is_read).length}
                        </span>
                      )}
                    </button>
                    {showNotifDropdown && (
                      <div style={{position:'absolute',right:0,top:48,width:300,background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.5)',zIndex:999,overflow:'hidden'}}>
                        <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{color:'var(--text)',fontWeight:700,fontSize:13}}>Notifications</span>
                          <button onClick={()=>{setShowNotifDropdown(false);setTab('notifications');}} style={{background:'none',border:'none',color:'var(--accent)',fontSize:12,cursor:'pointer',fontFamily:'var(--font)'}}>See all</button>
                        </div>
                        {notifications.length===0 && <p style={{color:'var(--dim)',fontSize:13,textAlign:'center',padding:16,margin:0}}>No notifications</p>}
                        {notifications.slice(0,3).map((n,i)=>(
                          <div key={i} style={{padding:'10px 14px',borderBottom:i<2?'1px solid var(--border)':'none',background:n.is_read?'transparent':'#0d1e38'}}>
                            <p style={{color:n.is_read?'var(--muted)':'var(--text)',fontWeight:600,fontSize:13,margin:'0 0 2px'}}>{n.title}</p>
                            <p style={{color:'var(--dim)',fontSize:12,margin:0}}>{n.message?.substring(0,60)}{n.message?.length>60?'...':''}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>"""

print('old found:', old in c)
c2 = c.replace(old, new)
f = open('frontend/src/pages/Dashboard.js', 'wb')
f.write(c2)
f.close()
print('done')
