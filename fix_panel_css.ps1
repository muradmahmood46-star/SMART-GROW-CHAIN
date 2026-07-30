$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\panel.css'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)

# 1. Fix panel-main base: remove margin-left (will be controlled by class)
$old1 = '.panel-main  { flex:1; display:flex; flex-direction:column; overflow:hidden; margin-left:256px; transition:margin-left .3s cubic-bezier(.4,0,.2,1); }'
$new1 = '.panel-main  { flex:1; display:flex; flex-direction:column; overflow:hidden; margin-left:256px; transition:margin-left .3s cubic-bezier(.4,0,.2,1); }' + [char]10 + '.panel-main.sidebar-hidden { margin-left:0; }'
$c = $c.Replace($old1, $new1)
Write-Host "Fix1:" $c.Contains($new1)

# 2. Fix sgc-sidebar: make it position:fixed always
$old2 = '  width:256px; min-height:100vh;' + [char]10 + '  background: var(--sidebar-grad);' + [char]10 + '  border-right: none;' + [char]10 + '  display:flex; flex-direction:column;' + [char]10 + '  transition: transform .3s cubic-bezier(.4,0,.2,1);' + [char]10 + '  z-index:50; flex-shrink:0;' + [char]10 + '  overflow-y:auto;' + [char]10 + '  box-shadow: 4px 0 32px rgba(10,15,46,.45);'
$new2 = '  width:256px; height:100vh;' + [char]10 + '  position:fixed; top:0; left:0;' + [char]10 + '  background: var(--sidebar-grad);' + [char]10 + '  border-right: none;' + [char]10 + '  display:flex; flex-direction:column;' + [char]10 + '  transition: transform .3s cubic-bezier(.4,0,.2,1);' + [char]10 + '  z-index:50; flex-shrink:0;' + [char]10 + '  overflow-y:auto;' + [char]10 + '  box-shadow: 4px 0 32px rgba(10,15,46,.45);'
$c = $c.Replace($old2, $new2)
Write-Host "Fix2 done"

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Saved!"
