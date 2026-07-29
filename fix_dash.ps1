$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [System.IO.File]::ReadAllText($f)
$c = $c.Replace("whiteSpace:'nowrap'}>{String.fromCharCode(10003)}", "whiteSpace:'nowrap'}}>{String.fromCharCode(10003)}")
[System.IO.File]::WriteAllText($f, $c)
$idx = $c.IndexOf('Current Plan</div>}')
Write-Host $c.Substring($idx - 25, 45)
