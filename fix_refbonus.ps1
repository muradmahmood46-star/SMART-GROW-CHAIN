$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [System.IO.File]::ReadAllText($f)

# Fix: add )} after the closing </div> of ref-bonus tab, before the AD VIEW LOG comment
$old = "                </div>`r`n`r`n`r`n              </div>`r`n`r`n            {/* "
$new = "                </div>`r`n              </div>`r`n            )}`r`n`r`n            {/* "
$c2 = $c.Replace($old, $new)
if ($c2 -eq $c) {
    # try LF line endings
    $old2 = "                </div>`n`n`n              </div>`n`n            {/* "
    $new2 = "                </div>`n              </div>`n            )}`n`n            {/* "
    $c2 = $c.Replace($old2, $new2)
    Write-Host "tried LF"
}
[System.IO.File]::WriteAllText($f, $c2)
$idx = $c2.IndexOf('AD VIEW LOG')
Write-Host $c2.Substring($idx - 80, 120)
