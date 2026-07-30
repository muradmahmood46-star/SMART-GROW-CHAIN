$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)

$ham = [char]0x2630
$arrow = [char]0x2190

$old = '          <button className="hamburger" onClick={()=>{setSidebarCollapsed(false);setSidebarOpen(true);}}>'+$ham+'</button>' + [char]10 + '          <button className="sgc-dashboard-topback" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar" title="Hide sidebar">'+$arrow+'</button>'

$new = '          <button className="hamburger" onClick={()=>{if(window.innerWidth<=768){setSidebarOpen(true);setSidebarCollapsed(false);}else{setSidebarCollapsed(false);}}}>'+$ham+'</button>' + [char]10 + '          <button className="sgc-dashboard-topback" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar" title="Hide sidebar">'+$arrow+'</button>'

Write-Host "Found:" $c.Contains($old)
if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    [IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
    Write-Host "Done!"
}
