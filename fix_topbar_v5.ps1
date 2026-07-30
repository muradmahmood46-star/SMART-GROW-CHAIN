$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$ham = [char]0x2630
$arrow = [char]0x2190
# plant emoji U+1F331 as surrogate pair
$plant = [char]0xD83C + [char]0xDF31

$old = 'sgc-topbar">' + [char]10 + '          <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>' + [char]10 + '          <button className="sgc-topbar-login-back" onClick={()=>{localStorage.clear();navigate("/login");}} aria-label="Back to login" title="Back to login">&#8592;</button>' + [char]10 + '          <span style={{color:''#fff'',fontWeight:800,fontSize:15}}>'+$plant+' Smart Grow Chain</span>' + [char]13 + [char]10 + '          <div style={{display:''flex'',alignItems:''center'',gap:10}}>'

Write-Host "Found:" $c.Contains($old)

$new = 'sgc-topbar">' + [char]10 + '          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>' + [char]10 + '            <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>' + [char]10 + '            <button className="sgc-topbar-login-back" onClick={()=>{localStorage.clear();navigate("/login");}} aria-label="Back to login" title="Back to login">'+$arrow+'</button>' + [char]10 + '          </div>' + [char]10 + '          <span className="sgc-topbar-title">'+$plant+' Smart Grow Chain</span>' + [char]10 + '          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>' + [char]10 + '            <div className="sgc-topbar-avatar">{profile.username[0].toUpperCase()}</div>'

if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    [IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
    Write-Host "Done!"
} else {
    # Try with \n only (no \r\n)
    $old2 = 'sgc-topbar">' + [char]10 + '          <button className="hamburger" onClick={()=>{setSidebarCollapsed(v=>!v);setSidebarOpen(false);}}>'+$ham+'</button>' + [char]10 + '          <button className="sgc-topbar-login-back" onClick={()=>{localStorage.clear();navigate("/login");}} aria-label="Back to login" title="Back to login">&#8592;</button>' + [char]10 + '          <span style={{color:''#fff'',fontWeight:800,fontSize:15}}>'+$plant+' Smart Grow Chain</span>' + [char]10 + '          <div style={{display:''flex'',alignItems:''center'',gap:10}}>'
    Write-Host "Found2:" $c.Contains($old2)
    if ($c.Contains($old2)) {
        $c = $c.Replace($old2, $new)
        [IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
        Write-Host "Done2!"
    }
}
