$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\panel.css'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)

$old = '.sgc-balance {' + [char]10 + [char]10 + '  margin:0 12px 20px;' + [char]10 + '  padding:18px;' + [char]10 + '  background: linear-gradient(135deg,rgba(13,148,136,.85),rgba(8,145,178,.8),rgba(99,102,241,.75));' + [char]10 + [char]10 + '  border:1px solid rgba(255,255,255,.2);' + [char]10 + '  border-radius:20px;' + [char]10 + '  animation: slideL .35s ease both;' + [char]10 + [char]10 + '  backdrop-filter: blur(12px);' + [char]10 + '  box-shadow: 0 8px 32px rgba(13,148,136,.25);' + [char]10 + [char]10 + '  position:relative; overflow:hidden;' + [char]10 + '}'

$new = '.sgc-balance {' + [char]10 + '  margin:0 12px 20px;' + [char]10 + '  padding:18px;' + [char]10 + '  background: linear-gradient(135deg,#0d9488,#0891b2,#6366f1);' + [char]10 + '  border:1px solid rgba(255,255,255,.2);' + [char]10 + '  border-radius:20px;' + [char]10 + '  box-shadow: 0 8px 32px rgba(13,148,136,.25);' + [char]10 + '  position:relative; overflow:hidden;' + [char]10 + '}'

Write-Host "Found:" $c.Contains($old)
if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    [IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
    Write-Host "Done!"
} else {
    # Try regex replace
    $c2 = [regex]::Replace($c, '\.sgc-balance \{[^}]+\}', $new)
    [IO.File]::WriteAllText($f, $c2, [Text.Encoding]::UTF8)
    Write-Host "Regex done!"
}
