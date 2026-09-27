# Local static dev server for Architect 2.0 (no Node.js required).
# Serves this folder on http://localhost:<Port>/ with SPA fallback to index.html.
param([int]$Port = 5173)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.mjs' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'; '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.ico' = 'image/x-icon'
  '.md' = 'text/markdown; charset=utf-8'; '.txt' = 'text/plain; charset=utf-8'; '.woff2' = 'font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Architect dev server running at http://localhost:$Port/ (root: $root)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request; $res = $ctx.Response
    try {
      $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '') { $rel = 'index.html' }
      $path = Join-Path $root ($rel -replace '/', '\')
      $full = [System.IO.Path]::GetFullPath($path)
      if (-not $full.StartsWith($root)) { $res.StatusCode = 403; $res.Close(); continue }
      if (-not (Test-Path $full -PathType Leaf)) {
        if ([System.IO.Path]::GetExtension($rel) -eq '') { $full = Join-Path $root 'index.html' }
        else { $res.StatusCode = 404; $b = [Text.Encoding]::UTF8.GetBytes("Not found: $rel"); $res.OutputStream.Write($b, 0, $b.Length); $res.Close(); continue }
      }
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $type = $mime[$ext]; if (-not $type) { $type = 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($full)
      $res.ContentType = $type
      $res.Headers.Add('Cache-Control', 'no-store')
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      try { $res.StatusCode = 500 } catch {}
    } finally {
      try { $res.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
