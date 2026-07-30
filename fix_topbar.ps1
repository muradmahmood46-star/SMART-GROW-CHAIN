$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)

$arrow = [char]0x2190
$ham = [char]0x2630
$lf = [char]10

$old = 'sgc-dashboard-topback" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar" title="Hide sidebar">' + $arrow + '</button>' + $lf + '          <button className="hamburger" onClick={()=>{setSidebarCollapsed(false);setSidebarOpen(true);}}>'+$ham+'</button>'

$new = 'hamburger" onClick={()=>{setSidebarCollapsed(false);setSidebarOpen(true);}}>'+$ham+'</button>' + $lf + '          <button className="sgc-dashboard-topback" onClick={()=>{setSidebarCollapsed(true);setSidebarOpen(false);}} aria-label="Hide sidebar" title="Hide sidebar">'+$arrow+'</button>'

Write-Host "Found: $($c.Contains($old))"

if ($c.Contains($old)) {
    $newContent = $c.Replace($old, $new)
    [IO.File]::WriteAllText($f, $newContent, [Text.Encoding]::UTF8)
    Write-Host "Done!"
} else {
    Write-Host "NOT FOUND - checking nearby..."
    $i = $c.IndexOf('sgc-dashboard-topback')
    Write-Host "Index: $i"
}
