# Robust script to fix and update all favicon links
$root = "d:\Cipher\pookie-v3"

# Root level replacement
$rootFiles = Get-ChildItem -Path $root -Filter "*.html"
foreach ($f in $rootFiles) {
    $content = Get-Content $f.FullName -Raw
    # Handle both original and corrupted versions
    $content = $content -replace '<link rel="icon" href="data:image/svg\+xml,.*?>', '<link rel="icon" type="image/png" href="favicon.png">'
    $content = $content -replace '<link rel="icon" type="image/png" href="favicon.png"><text.*?>', '<link rel="icon" type="image/png" href="favicon.png">'
    Set-Content $f.FullName $content -ErrorAction SilentlyContinue
}

# Pages and Admin level replacement
$midFiles = Get-ChildItem -Path "$root\pages", "$root\admin" -Filter "*.html" -Recurse
foreach ($f in $midFiles) {
    $content = Get-Content $f.FullName -Raw
    $content = $content -replace '<link rel="icon" href="data:image/svg\+xml,.*?>', '<link rel="icon" type="image/png" href="../favicon.png">'
    $content = $f -replace '<link rel="icon" type="image/png" href="../favicon.png"><text.*?>', '<link rel="icon" type="image/png" href="../favicon.png">'
    Set-Content $f.FullName $content -ErrorAction SilentlyContinue
}

# Templates level replacement
$deepFiles = Get-ChildItem -Path "$root\templates" -Filter "*.html" -Recurse
foreach ($f in $deepFiles) {
    $content = Get-Content $f.FullName -Raw
    $content = $content -replace '<link rel="icon" href="data:image/svg\+xml,.*?>', '<link rel="icon" type="image/png" href="../../favicon.png">'
    $content = $content -replace '<link rel="icon" type="image/png" href="../../favicon.png"><text.*?>', '<link rel="icon" type="image/png" href="../../favicon.png">'
    Set-Content $f.FullName $content -ErrorAction SilentlyContinue
}
