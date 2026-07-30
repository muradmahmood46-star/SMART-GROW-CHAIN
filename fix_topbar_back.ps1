$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$ham = [char]0x2630
$lf = [char]10

$old = '          <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>'

$new = '          <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>' + $lf + '          <button className="sgc-topbar-login-back" onClick={()=>{localStorage.clear();navigate("/login");}} aria-label="Back to login" title="Back to login">&#8592;</button>'

Write-Host "Found:" $c.Contains($old)
if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    [IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
    Write-Host "Done!"
}
