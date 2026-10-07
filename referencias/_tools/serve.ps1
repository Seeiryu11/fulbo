# Servidor estatico minimo (con soporte Range para video) para previsualizar el proyecto.
param([int]$Port = 8765)
$root = (Resolve-Path "$PSScriptRoot\..\..").Path
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Sirviendo $root en http://localhost:$Port/"
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript'; '.css'='text/css'; '.json'='application/json'; '.mov'='video/mp4'; '.mp4'='video/mp4'; '.jpeg'='image/jpeg'; '.jpg'='image/jpeg'; '.png'='image/png'; '.svg'='image/svg+xml' }
while ($l.IsListening) {
  $ctx = $l.GetContext(); $req = $ctx.Request; $res = $ctx.Response
  try {
    $path = Join-Path $root ([Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/')))
    if (Test-Path $path -PathType Container) { $path = Join-Path $path 'index.html' }
    if (-not (Test-Path $path -PathType Leaf)) { $res.StatusCode = 404; $res.Close(); continue }
    $ext = [IO.Path]::GetExtension($path).ToLower()
    $res.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
    $res.Headers.Add('Accept-Ranges', 'bytes')
    $fs = [IO.File]::OpenRead($path); $len = $fs.Length; $start = 0; $end = $len - 1
    $range = $req.Headers['Range']
    if ($range -match 'bytes=(\d*)-(\d*)') {
      if ($matches[1]) { $start = [int64]$matches[1] }
      if ($matches[2]) { $end = [int64]$matches[2] }
      if ($end -ge $len) { $end = $len - 1 }
      $res.StatusCode = 206
      $res.Headers.Add('Content-Range', "bytes $start-$end/$len")
    }
    $count = $end - $start + 1
    $res.ContentLength64 = $count
    $fs.Seek($start, 'Begin') | Out-Null
    $buf = New-Object byte[] 1048576
    while ($count -gt 0) {
      $n = $fs.Read($buf, 0, [Math]::Min($buf.Length, $count)); if ($n -le 0) { break }
      $res.OutputStream.Write($buf, 0, $n); $count -= $n
    }
    $fs.Close()
  } catch { } finally { try { $res.Close() } catch { } }
}
