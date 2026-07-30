$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\panel.css'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
$lf = [char]10

# Remove old @media (min-width:769px) collapsed block
$old1 = '@media (min-width:769px) {' + $lf + '  .sgc-sidebar.collapsed {' + $lf + '    width:0;' + $lf + '    min-width:0;' + $lf + $lf + '    border-right-width:0;' + $lf + '    transform:translateX(-100%);' + $lf + $lf + '    overflow:hidden;' + $lf + '  }' + $lf + '}'
Write-Host "Old1 found:" $c.Contains($old1)
if ($c.Contains($old1)) { $c = $c.Replace($old1, '') }

# Remove duplicate .panel-main margin block (the one added in the new sidebar section)
$old2 = '.panel-main {' + $lf + '  margin-left:256px;' + $lf + $lf + '  transition:margin-left .3s cubic-bezier(.4,0,.2,1);' + $lf + '}' + $lf + '.sgc-sidebar.collapsed ~ .panel-main,' + $lf + $lf + '.panel-wrap:has(.sgc-sidebar.collapsed) .panel-main {' + $lf + '  margin-left:0;' + $lf + '}'
Write-Host "Old2 found:" $c.Contains($old2)
if ($c.Contains($old2)) { $c = $c.Replace($old2, '') }

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Saved!"
