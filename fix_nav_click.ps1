$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)

$old = "              onClick={()=>{ setTab(key); setSidebarCollapsed(true); setSidebarOpen(false); if(key==='create-ad'){ setShowAdWelcome(true); } }}>"
$new = "              onClick={()=>{ setTab(key); if(window.innerWidth<=768){setSidebarCollapsed(true);setSidebarOpen(false);} if(key==='create-ad'){ setShowAdWelcome(true); } }}>"

Write-Host "Found:" $c.Contains($old)
if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    [IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
    Write-Host "Done!"
}
