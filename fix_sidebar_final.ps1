$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$ham = [char]0x2630
$lf = [char]10

# Fix 1: hamburger - on PC just open (setSidebarCollapsed false), on mobile toggle with overlay
$old1 = '            <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>'
$new1 = '            <button className="hamburger" onClick={()=>{if(window.innerWidth<=768){setSidebarOpen(true);}setSidebarCollapsed(false);}}>'+$ham+'</button>'
Write-Host "Fix1:" $c.Contains($old1)
if ($c.Contains($old1)) { $c = $c.Replace($old1, $new1) }

# Fix 2: remove sgc-balance div from sidebar
# Find and remove the entire sgc-balance block
$old2 = '        <div className="sgc-balance">' + $lf + '          <div className="sgc-bal-label">'
Write-Host "Fix2 start found:" $c.Contains($old2)

# Use regex to remove the balance div
$c = [regex]::Replace($c, '        <div className="sgc-balance">[\s\S]*?</div>\s*\n\s*\n\s*        <nav', '        <nav')

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Saved!"

# Verify balance removed
$c2 = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
Write-Host "Balance still present:" $c2.Contains('sgc-balance')
