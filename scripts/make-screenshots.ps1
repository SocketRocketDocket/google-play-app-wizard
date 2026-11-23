# Generates 4 Google Play phone screenshots (1080x1920, 24-bit opaque PNG)
# framing real captured screenshots of Play Publish: App Wizard.
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'play-store\screenshots'
New-Item -ItemType Directory -Force -Path $out | Out-Null

$evDir = 'C:\Users\MDegens\.gemini\antigravity\brain\63c00f0e-3781-45ec-b8e1-fb66cacc79e9\browser_evidence\b2d2d715-b4e8-438e-a641-f02550292cd2'

$cards = @(
  @{ file='01-overview.png'; src=(Join-Path $evDir 'final_step_200.png'); h1='Launch on Google Play'; h2='With Confidence'; sub='Personalized 9-stage checklist & built-in tools'; c1='#101819'; c2='#016847' },
  @{ file='02-store-listing.png'; src=(Join-Path $evDir 'final_step_20.png'); h1='Every Requirement'; h2='Checked & Tracked'; sub='Store listing, icons, graphics & compliance'; c1='#0b2545'; c2='#1a73e8' },
  @{ file='03-testing-notes.png'; src=(Join-Path $evDir 'final_step_55.png'); h1='14-Day Closed Test'; h2='& Pro Launch Tips'; sub='Built-in notes, tester tracker & Dark mode'; c1='#0f172a'; c2='#1e293b' },
  @{ file='04-pro-generators.png'; src=(Join-Path $evDir 'final_step_223.png'); h1='Pro Launch Kit'; h2='Generators Included'; sub='Screenshots, Feature Graphics & Privacy Policy HTML'; c1='#1e1b4b'; c2='#4f46e5' }
)

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $gp.AddArc($x, $y, $d, $d, 180, 90)
  $gp.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $gp.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $gp.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $gp.CloseFigure()
  return $gp
}

foreach ($c in $cards) {
  if (-not (Test-Path $c.src)) { Write-Warning "Missing $($c.src)"; continue }
  $W = 1080; $H = 1920
  $bmp = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.TextRenderingHint = 'AntiAliasGridFit'

  $col1 = [System.Drawing.ColorTranslator]::FromHtml($c.c1)
  $col2 = [System.Drawing.ColorTranslator]::FromHtml($c.c2)
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Rectangle 0,0,$W,$H), $col1, $col2, 45
  $g.FillRectangle($bgBrush, 0, 0, $W, $H)

  $glow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(20, 255, 255, 255))
  $g.FillEllipse($glow, 680, -140, 560, 560)
  $g.FillEllipse($glow, -180, 1460, 520, 520)

  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center

  $f1 = New-Object System.Drawing.Font 'Segoe UI', 54, ([System.Drawing.FontStyle]::Bold)
  $f2 = New-Object System.Drawing.Font 'Segoe UI', 26, ([System.Drawing.FontStyle]::Regular)
  $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 110, 231, 183))
  $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(225, 235, 245, 240))

  $g.DrawString($c.h1, $f1, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF 60, 120, 960, 90), $sf)
  $g.DrawString($c.h2, $f1, $accentBrush, (New-Object System.Drawing.RectangleF 60, 205, 960, 90), $sf)
  $g.DrawString($c.sub, $f2, $subBrush, (New-Object System.Drawing.RectangleF 80, 315, 920, 80), $sf)

  # Sleek device frame holding real app screenshot
  $fx = 70; $fy = 440; $fw = 940; $fh = 1360
  $shadowPath = New-RoundedPath ($fx + 10) ($fy + 22) $fw $fh 46
  $g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(110, 0, 0, 0))), $shadowPath)

  $framePath = New-RoundedPath $fx $fy $fw $fh 44
  $g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 18, 20, 22))), $framePath)
  $g.DrawPath((New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(65, 255, 255, 255)), 4), $framePath)

  $img = [System.Drawing.Image]::FromFile($c.src)
  $sx = $fx + 20; $sy = $fy + 20; $sw = $fw - 40; $sh = $fh - 40
  $clipPath = New-RoundedPath $sx $sy $sw $sh 28
  $g.SetClip($clipPath)

  # Crop out the 300px desktop sidebar on the left so the main content fills the phone frame cleanly
  $cropX = [int]($img.Width * 0.298)
  $cropW = $img.Width - $cropX
  $cropH = $img.Height
  $srcRect = New-Object System.Drawing.Rectangle $cropX, 0, $cropW, $cropH
  # Fit width cleanly and preserve aspect ratio without clipping text on left/right
  $scale = $sw / $cropW
  $dh = [int]($cropH * $scale)
  $bgFill = if ($c.file -eq '02-store-listing.png') { [System.Drawing.ColorTranslator]::FromHtml('#f1f3f4') } else { [System.Drawing.ColorTranslator]::FromHtml('#161719') }
  $g.FillRectangle((New-Object System.Drawing.SolidBrush $bgFill), $sx, $sy, $sw, $sh)
  $dstRect = New-Object System.Drawing.Rectangle $sx, $sy, $sw, $dh
  $g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.ResetClip()
  $img.Dispose()

  $outPath = Join-Path $out $c.file
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Write-Output "Wrote play-store\screenshots\$($c.file)"
}
