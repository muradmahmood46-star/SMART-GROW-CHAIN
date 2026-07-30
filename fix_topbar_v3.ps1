$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$lf = [char]10
$ham = [char]0x2630
$arrow = [char]0x2190

# Fix 1: Nav click - also collapse sidebar
$old1 = "              onClick={()=>{ setTab(key); setSidebarOpen(false); if(key==='create-ad'){ setShowAdWelcome(true); } }}>"
$new1 = "              onClick={()=>{ setTab(key); setSidebarCollapsed(true); setSidebarOpen(false); if(key==='create-ad'){ setShowAdWelcome(true); } }}>"
Write-Host "Fix1 found:" $c.Contains($old1)
if ($c.Contains($old1)) { $c = $c.Replace($old1, $new1) }

# Fix 2: Topbar - new layout
$old2 = '        <div className="sgc-topbar">' + $lf + '          <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>' + $lf + '          <button className="sgc-topbar-login-back" onClick={()=>{localStorage.clear();navigate("/login");}} aria-label="Back to login" title="Back to login">&#8592;</button>' + $lf + '          <span style={{color:''#fff'',fontWeight:800,fontSize:15}}>?? Smart Grow Chain</span>' + $lf + '          <div style={{display:''flex'',alignItems:''center'',gap:10}}>'

$new2 = '        <div className="sgc-topbar">' + $lf + '          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>' + $lf + '            <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>' + $lf + '            <button className="sgc-topbar-login-back" onClick={()=>{localStorage.clear();navigate("/login");}} aria-label="Back to login" title="Back to login">'+$arrow+'</button>' + $lf + '          </div>' + $lf + '          <span className="sgc-topbar-title">?? Smart Grow Chain</span>' + $lf + '          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>' + $lf + '            <div className="sgc-topbar-avatar">{profile.username[0].toUpperCase()}</div>'

Write-Host "Fix2 found:" $c.Contains($old2)
if ($c.Contains($old2)) { $c = $c.Replace($old2, $new2) }

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Saved!"
