# Generates the app icons (PNG) with System.Drawing: green rounded square + white play triangle + check mark
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'icons'
New-Item -ItemType Directory -Force -Path $out | Out-Null

function New-Icon([int]$size, [string]$path, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)

  $c1 = [System.Drawing.Color]::FromArgb(255, 1, 135, 95)
  $c2 = [System.Drawing.Color]::FromArgb(255, 52, 168, 83)
  $rect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 45

  if ($maskable) {
    $g.FillRectangle($brush, $rect)
    $pad = $size * 0.22   # keep content inside the maskable safe zone
  } else {
    $r = $size * 0.22
    $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $gp.AddArc(0, 0, $d, $d, 180, 90)
    $gp.AddArc($size - $d, 0, $d, $d, 270, 90)
    $gp.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $gp.AddArc(0, $size - $d, $d, $d, 90, 90)
    $gp.CloseFigure()
    $g.FillPath($brush, $gp)
    $pad = $size * 0.2
  }

  # Play triangle
  $inner = $size - 2 * $pad
  $tri = @(
    (New-Object System.Drawing.PointF ($pad + $inner * 0.12), ($pad + $inner * 0.05)),
    (New-Object System.Drawing.PointF ($pad + $inner * 0.12), ($pad + $inner * 0.95)),
    (New-Object System.Drawing.PointF ($pad + $inner * 0.95), ($pad + $inner * 0.5))
  )
  $g.FillPolygon([System.Drawing.Brushes]::White, $tri)

  # Check mark inside the triangle
  $pen = New-Object System.Drawing.Pen $c1, ($inner * 0.075)
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'; $pen.LineJoin = 'Round'
  $pts = @(
    (New-Object System.Drawing.PointF ($pad + $inner * 0.25), ($pad + $inner * 0.5)),
    (New-Object System.Drawing.PointF ($pad + $inner * 0.38), ($pad + $inner * 0.63)),
    (New-Object System.Drawing.PointF ($pad + $inner * 0.62), ($pad + $inner * 0.37))
  )
  $g.DrawLines($pen, $pts)

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "Wrote $path"
}

New-Icon 192 (Join-Path $out 'icon-192.png') $false
New-Icon 512 (Join-Path $out 'icon-512.png') $false
New-Icon 512 (Join-Path $out 'icon-maskable-512.png') $true
