$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\panel.css'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)

# Remove @media (min-width:769px) { .sgc-sidebar.collapsed { ... } } block
$c = [regex]::Replace($c, '@media \(min-width:769px\) \{\s*\.sgc-sidebar\.collapsed \{[^}]+\}\s*\}', '')

# Remove duplicate .panel-main block and sibling selector block
$c = [regex]::Replace($c, '\.panel-main \{\s*margin-left:256px;\s*transition:[^}]+\}\s*\.sgc-sidebar\.collapsed ~ \.panel-main,\s*\.panel-wrap:has\(\.sgc-sidebar\.collapsed\) \.panel-main \{\s*margin-left:0;\s*\}', '')

[IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
Write-Host "Done!"

# Verify
$c2 = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)
Write-Host "min-width:769 still present:" $c2.Contains('min-width:769px')
Write-Host "collapsed ~ panel-main still present:" $c2.Contains('collapsed ~ .panel-main')
