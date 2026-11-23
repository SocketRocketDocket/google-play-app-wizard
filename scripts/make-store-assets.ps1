# Generates Play Store graphic assets:
#   - play-store/app-icon-512x512.png (32-bit PNG, 512x512)
#   - play-store/feature-graphic-1024x500.png (24-bit opaque PNG, 1024x500)
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'play-store'
New-Item -ItemType Directory -Force -Path $out | Out-Null

# 1. Copy verified 512x512 App Icon
Copy-Item (Join-Path $root 'icons\icon-512.png') (Join-Path $out 'app-icon-512x512.png') -Force

# 2. Generate 1024x500 Feature Graphic (24-bit RGB, no alpha)
$w = 1024; $h = 500
$bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'

# Rich dark-to-emerald Play Console background gradient
$bgRect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$cDark = [System.Drawing.Color]::FromArgb(255, 18, 22, 24)
$cTeal = [System.Drawing.Color]::FromArgb(255, 1, 95, 68)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $bgRect, $cDark, $cTeal, 25
$g.FillRectangle($bgBrush, $bgRect)

# Subtle geometric accent circles (outside text, adding depth)
$acc1 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 52, 168, 83))
$acc2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 138, 180, 248))
$g.FillEllipse($acc1, 720, -110, 420, 420)
$g.FillEllipse($acc2, -120, 260, 380, 380)

# Draw app icon cleanly in center-left safe zone
$iconImg = [System.Drawing.Image]::FromFile((Join-Path $root 'icons\icon-512.png'))
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($iconImg, 128, 155, 190, 190)
$iconImg.Dispose()

# Center-right headline & subtitle (well inside safe zone)
$titleFont = New-Object System.Drawing.Font 'Segoe UI', 44, ([System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font 'Segoe UI', 20, ([System.Drawing.FontStyle]::Regular)
$pillFont = New-Object System.Drawing.Font 'Segoe UI', 13, ([System.Drawing.FontStyle]::Bold)
$white = [System.Drawing.Brushes]::White
$muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 200, 230, 218))

$g.DrawString('Play Publish', $titleFont, $white, 355, 148)
$g.DrawString('App Wizard', $titleFont, (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 102, 224, 163))), 355, 210)
$g.DrawString('Step-by-step Google Play launch guide & tools', $subFont, $muted, 358, 286)

# 3 clean feature pills
$pills = @('Guided Checklists', 'Asset Validator', '14-Day Test Tracker')
$px = 358
$pillBg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(65, 255, 255, 255))
foreach ($text in $pills) {
  $sz = $g.MeasureString($text, $pillFont)
  $pw = [int]$sz.Width + 24
  $ph = 32
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $r = 16
  $gp.AddArc($px, 336, $r*2, $r*2, 180, 90)
  $gp.AddArc($px + $pw - $r*2, 336, $r*2, $r*2, 270, 90)
  $gp.AddArc($px + $pw - $r*2, 336 + $ph - $r*2, $r*2, $r*2, 0, 90)
  $gp.AddArc($px, 336 + $ph - $r*2, $r*2, $r*2, 90, 90)
  $gp.CloseFigure()
  $g.FillPath($pillBg, $gp)
  $g.DrawString($text, $pillFont, $white, $px + 12, 342)
  $px += $pw + 12
}

$g.Dispose()
$fgPath = Join-Path $out 'feature-graphic-1024x500.png'
$bmp.Save($fgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output "Wrote play-store\app-icon-512x512.png"
Write-Output "Wrote play-store\feature-graphic-1024x500.png"
