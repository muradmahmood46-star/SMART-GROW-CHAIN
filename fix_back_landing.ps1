$lf = [char]10

# ── Fix 1: Dashboard back button - step navigation ──
$f1 = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c1 = [IO.File]::ReadAllText($f1, [Text.Encoding]::UTF8)
$arrow = [char]0x2190

# Replace back button click: step through dashboard -> login -> home
$old1 = '            <button className="sgc-topbar-login-back" onClick={()=>{localStorage.clear();navigate("/login");}} aria-label="Back to login" title="Back to login">'+$arrow+'</button>'
$new1 = '            <button className="sgc-topbar-login-back" onClick={()=>{ if(tab!=="dashboard"){ setTab("dashboard"); } else { localStorage.clear(); navigate("/login"); } }} aria-label="Go back" title="Go back">'+$arrow+'</button>'

Write-Host "Fix1:" $c1.Contains($old1)
if ($c1.Contains($old1)) {
    $c1 = $c1.Replace($old1, $new1)
    [IO.File]::WriteAllText($f1, $c1, [Text.Encoding]::UTF8)
    Write-Host "Fix1 Done!"
}

# ── Fix 2: Landing page Login link -> green button ──
$f2 = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Landing.js'
$c2 = [IO.File]::ReadAllText($f2, [Text.Encoding]::UTF8)

# Change navLink style for Login to green button
$old2 = '          <Link to="/login" style={s.navLink}>Login</Link>'
$new2 = '          <Link to="/login" style={s.navLoginBtn}>Login</Link>'
Write-Host "Fix2:" $c2.Contains($old2)
if ($c2.Contains($old2)) { $c2 = $c2.Replace($old2, $new2) }

# Add navLoginBtn style
$old3 = '  navBtn: { background: ''#38bdf8'', color: ''#0f172a'', textDecoration: ''none'', padding: ''8px 20px'', borderRadius: 8, fontWeight: ''bold'', fontSize: 14 },'
$new3 = '  navLoginBtn: { background: ''#22c55e'', color: ''#fff'', textDecoration: ''none'', padding: ''8px 20px'', borderRadius: 8, fontWeight: ''bold'', fontSize: 14, boxShadow: ''0 2px 10px rgba(34,197,94,.4)'' },' + $lf + '  navBtn: { background: ''#38bdf8'', color: ''#0f172a'', textDecoration: ''none'', padding: ''8px 20px'', borderRadius: 8, fontWeight: ''bold'', fontSize: 14 },'
Write-Host "Fix3:" $c2.Contains($old3)
if ($c2.Contains($old3)) { $c2 = $c2.Replace($old3, $new3) }

[IO.File]::WriteAllText($f2, $c2, [Text.Encoding]::UTF8)
Write-Host "Fix2 Done!"
