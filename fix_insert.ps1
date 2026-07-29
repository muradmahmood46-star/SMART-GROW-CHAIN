$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$lines = [System.Collections.ArrayList][System.IO.File]::ReadAllLines($f)
# Insert '            )}' after line index 1354 (line 1355 in 1-based)
$lines.Insert(1355, '            )}')
[System.IO.File]::WriteAllLines($f, $lines)
Write-Host "Inserted at 1355"
for($i=1353;$i-le 1360;$i++){Write-Host ($i+1)':'$lines[$i]}
