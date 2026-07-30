$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\panel.css'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)

$old = '.sgc-bal-label  { font-size:11px; color:rgba(255,255,255,.7); margin-bottom:4px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; }'
$new = '.sgc-bal-label  { font-size:11px; color:rgba(255,255,255,.85) !important; margin-bottom:4px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; }'
Write-Host "label found:" $c.Contains($old)
if ($c.Contains($old)) { $c = $c.Replace($old, $new) }

$old2 = '.sgc-bal-amount { font-size:28px; font-weight:900; color:#fff; margin-bottom:2px; position:relative; z-index:1; }'
$new2 = '.sgc-bal-amount { font-size:26px; font-weight:900; color:#fff !important; margin-bottom:2px; position:relative; z-index:2; text-shadow:0 1px 4px rgba(0,0,0,.3); }'
Write-Host "amount found:" $c.Contains($old2)
if ($c.Contains($old2)) { $c = $c.Replace($old2, $new2) }

$old3 = '.sgc-bal-earned { font-size:12px; color:rgba(255,255,255,.65); position:relative; z-index:1; }'
$new3 = '.sgc-bal-earned { font-size:12px; color:rgba(255,255,255,.85) !important; position:relative; z-index:2; }'
Write-Host "earned found:" $c.Contains($old3)
if ($c.Contains($old3)) { $c = $c.Replace($old3, $new3) }

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Saved!"
