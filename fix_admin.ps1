$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\AdminPanel.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$lf = [char]10
$ham = [char]0x2630
$arrow = [char]0x2190
$plant = [char]0xD83C + [char]0xDF31

# Fix 1: Add sidebarCollapsed state
$old1 = '  const [sidebarOpen, setSidebarOpen] = useState(false);'
$new1 = '  const [sidebarOpen, setSidebarOpen] = useState(false);' + $lf + '  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);'
Write-Host "Fix1:" $c.Contains($old1)
if ($c.Contains($old1)) { $c = $c.Replace($old1, $new1) }

# Fix 2: panel-wrap div - add overlay with sidebarOpen
$old2 = '    <div className="panel-wrap">' + $lf + '      <div className={`sgc-overlay ${sidebarOpen?''open'':''''}`} onClick={()=>setSidebarOpen(false)}/>'
$new2 = '    <div className="panel-wrap">' + $lf + '      <div className={`sgc-overlay ${sidebarOpen?''open'':''''}`} onClick={()=>{setSidebarOpen(false);}}/>'
Write-Host "Fix2:" $c.Contains($old2)
if ($c.Contains($old2)) { $c = $c.Replace($old2, $new2) }

# Fix 3: sidebar aside - add collapsed class
$old3 = '      <aside className={`sgc-sidebar ${sidebarOpen?''open'':''''}`}>'
$new3 = '      <aside className={`sgc-sidebar ${sidebarOpen?''open'':''''}${sidebarCollapsed?'' collapsed'':''''}`}>'
Write-Host "Fix3:" $c.Contains($old3)
if ($c.Contains($old3)) { $c = $c.Replace($old3, $new3) }

# Fix 4: sidebar logo - add back button
$old4 = '        <div className="sgc-logo slide-l">' + $lf + '          <span className="sgc-logo-icon">' + $plant + '</span>' + $lf + '          <span className="sgc-logo-text" style={{color:''var(--yellow)''}}>Smart Grow Chain</span>' + $lf + '        </div>'
$new4 = '        <div className="sgc-logo slide-l">' + $lf + '          <span className="sgc-logo-icon">' + $plant + '</span>' + $lf + '          <span className="sgc-logo-text" style={{color:''var(--yellow)''}}>Smart Grow Chain</span>' + $lf + '          <button className="sgc-sidebar-back-btn" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar">' + $arrow + '</button>' + $lf + '        </div>'
Write-Host "Fix4:" $c.Contains($old4)
if ($c.Contains($old4)) { $c = $c.Replace($old4, $new4) }

# Fix 5: nav click - collapse sidebar
$old5 = '              onClick={()=>{ setTab(key); setSidebarOpen(false); if(key===''advertiser-mgmt''&&advertiserList.length===0){ setAdvertiserLoading(true); API.get(''/admin/advertiser-management'').then(r=>{ setAdvertiserList(r.data); setAdvertiserLoading(false); }).catch(()=>setAdvertiserLoading(false)); } }}>'
$new5 = '              onClick={()=>{ setTab(key); setSidebarCollapsed(true); setSidebarOpen(false); if(key===''advertiser-mgmt''&&advertiserList.length===0){ setAdvertiserLoading(true); API.get(''/admin/advertiser-management'').then(r=>{ setAdvertiserList(r.data); setAdvertiserLoading(false); }).catch(()=>setAdvertiserLoading(false)); } }}>'
Write-Host "Fix5:" $c.Contains($old5)
if ($c.Contains($old5)) { $c = $c.Replace($old5, $new5) }

# Fix 6: panel-main - add sidebar-hidden class
$old6 = '      <div className="panel-main">'
$new6 = '      <div className={`panel-main${sidebarCollapsed?" sidebar-hidden":""}`}>'
Write-Host "Fix6:" $c.Contains($old6)
if ($c.Contains($old6)) { $c = $c.Replace($old6, $new6) }

# Fix 7: topbar - replace old topbar with new layout
$old7 = '        <div className="sgc-topbar">' + $lf + '          <button className="sgc-topbar-back" onClick={backToLogin}>' + $arrow + ' Login</button>' + $lf + '          <button className="hamburger" onClick={()=>setSidebarOpen(true)}>' + $ham + '</button>' + $lf + '          <span style={{color:''var(--yellow)'',fontWeight:800,fontSize:15}}>' + $plant + ' SGC Admin</span>' + $lf + '          <div className="sgc-avatar" style={{background:''linear-gradient(135deg,#f59e0b,#d97706)'',width:36,height:36,fontSize:15,flexShrink:0}}>A</div>' + $lf + '        </div>'
$new7 = '        <div className="sgc-topbar">' + $lf + '          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>' + $lf + '            <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>' + $ham + '</button>' + $lf + '            <button className="sgc-topbar-login-back" onClick={backToLogin} aria-label="Back to login" title="Back to login">' + $arrow + '</button>' + $lf + '          </div>' + $lf + '          <span className="sgc-topbar-title">' + $plant + ' SGC Admin</span>' + $lf + '          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>' + $lf + '            <div className="sgc-topbar-avatar">A</div>' + $lf + '          </div>' + $lf + '        </div>'
Write-Host "Fix7:" $c.Contains($old7)
if ($c.Contains($old7)) { $c = $c.Replace($old7, $new7) }

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Saved!"
