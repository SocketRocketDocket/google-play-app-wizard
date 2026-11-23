# Resizes icons/*.png into the Android mipmap folders (legacy + adaptive foreground)
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$res = Join-Path $root 'android\app\src\main\res'
$src = [System.Drawing.Image]::FromFile((Join-Path $root 'icons\icon-512.png'))
$mask = [System.Drawing.Image]::FromFile((Join-Path $root 'icons\icon-maskable-512.png'))

function Save-Resized($img, [int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($img, 0, 0, $size, $size)
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$densities = @{ 'mdpi' = 48; 'hdpi' = 72; 'xhdpi' = 96; 'xxhdpi' = 144; 'xxxhdpi' = 192 }
foreach ($d in $densities.Keys) {
  $dir = Join-Path $res "mipmap-$d"
  if (-not (Test-Path $dir)) { continue }
  $s = $densities[$d]
  Save-Resized $src $s (Join-Path $dir 'ic_launcher.png')
  Save-Resized $src $s (Join-Path $dir 'ic_launcher_round.png')
  Save-Resized $mask ([int]($s * 2.25)) (Join-Path $dir 'ic_launcher_foreground.png')
  Write-Output "mipmap-$d done"
}
$src.Dispose(); $mask.Dispose()

# Adaptive icon background colour
$bg = Join-Path $res 'values\ic_launcher_background.xml'
Set-Content -Path $bg -Encoding UTF8 -Value @'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#01875F</color>
</resources>
'@
Write-Output 'Android icons updated'
