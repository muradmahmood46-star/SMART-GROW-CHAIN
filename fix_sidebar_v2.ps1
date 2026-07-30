$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$ham = [char]0x2630
$arrow = [char]0x2190
$lf = [char]10

# Fix 1: Topbar - remove topback button, keep only hamburger as toggle
$old1 = '          <button className="hamburger" onClick={()=>{if(window.innerWidth<=768){setSidebarOpen(true);setSidebarCollapsed(false);}else{setSidebarCollapsed(false);}}}>' + $ham + '</button>' + $lf + '          <button className="sgc-dashboard-topback" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar" title="Hide sidebar">' + $arrow + '</button>'

$new1 = '          <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>' + $ham + '</button>'

Write-Host "Fix1 found:" $c.Contains($old1)
if ($c.Contains($old1)) { $c = $c.Replace($old1, $new1) }

# Fix 2: Sidebar logo - make back button clearly visible on right side
$old2 = '        <div className="sgc-logo slide-l">' + $lf + '          <button className="sgc-sidebar-dashboard-back" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar" title="Hide sidebar">' + $arrow + '</button>'

$new2 = '        <div className="sgc-logo slide-l">' + $lf + '          <button className="sgc-sidebar-back-btn" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar" title="Hide sidebar">' + $arrow + '</button>'

Write-Host "Fix2 found:" $c.Contains($old2)
if ($c.Contains($old2)) { $c = $c.Replace($old2, $new2) }

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Saved!"
