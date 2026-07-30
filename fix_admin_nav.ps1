$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\AdminPanel.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$arrow = [char]0x2190
$ham = [char]0x2630

# Fix 1: back button - step navigation (dashboard first, then login)
$old1 = '            <button className="sgc-topbar-login-back" onClick={backToLogin} aria-label="Back to login" title="Back to login">'+$arrow+'</button>'
$new1 = '            <button className="sgc-topbar-login-back" onClick={()=>{ if(tab!=="dashboard"){ setTab("dashboard"); } else { navigate("/login"); } }} aria-label="Go back" title="Go back">'+$arrow+'</button>'
Write-Host "Fix1:" $c.Contains($old1)
if ($c.Contains($old1)) { $c = $c.Replace($old1, $new1) }

# Fix 2: hamburger - PC only open, mobile toggle
$old2 = '            <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>'
$new2 = '            <button className="hamburger" onClick={()=>{if(window.innerWidth<=768){setSidebarOpen(true);}setSidebarCollapsed(false);}}>'+$ham+'</button>'
Write-Host "Fix2:" $c.Contains($old2)
if ($c.Contains($old2)) { $c = $c.Replace($old2, $new2) }

# Fix 3: nav click - only collapse on mobile
$old3 = '              onClick={()=>{ setTab(key); setSidebarCollapsed(true); setSidebarOpen(false); if(key===''advertiser-mgmt''&&advertiserList.length===0){ setAdvertiserLoading(true); API.get(''/admin/advertiser-management'').then(r=>{ setAdvertiserList(r.data); setAdvertiserLoading(false); }).catch(()=>setAdvertiserLoading(false)); } }}>'
$new3 = '              onClick={()=>{ setTab(key); if(window.innerWidth<=768){setSidebarCollapsed(true);setSidebarOpen(false);} if(key===''advertiser-mgmt''&&advertiserList.length===0){ setAdvertiserLoading(true); API.get(''/admin/advertiser-management'').then(r=>{ setAdvertiserList(r.data); setAdvertiserLoading(false); }).catch(()=>setAdvertiserLoading(false)); } }}>'
Write-Host "Fix3:" $c.Contains($old3)
if ($c.Contains($old3)) { $c = $c.Replace($old3, $new3) }

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Saved!"
