$f = 'c:\Users\pc\Desktop\ptc pro\frontend\src\pages\Dashboard.js'
$c = [IO.File]::ReadAllText($f, [Text.Encoding]::UTF8)

$old = '  const [sidebarOpen, setSidebarOpen] = useState(false);' + [char]10 + '  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);'
$new = '  const [sidebarOpen, setSidebarOpen] = useState(false);' + [char]10 + '  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 768);'

Write-Host "Found:" $c.Contains($old)
if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    [IO.File]::WriteAllText($f, $c, [Text.Encoding]::UTF8)
    Write-Host "Done!"
}
