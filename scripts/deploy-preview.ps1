<#
.SYNOPSIS
    Rebuilds the static design preview and publishes it to the gh-pages branch.

.DESCRIPTION
    GitHub Pages serves the preview from a branch rather than from Actions,
    because publishing .github/workflows/ needs the `workflow` OAuth scope and
    the branch route needs only `repo`. If that scope is ever granted, commit
    the workflow in .github/ instead and delete this script.

    This is a DESIGN PREVIEW, never the product. Pages has no server, so the
    lead form and the checkout have no endpoint; NEXT_PUBLIC_STATIC_DEMO makes
    both say so plainly. The real deployment is Vercel, per Stage 18.

.EXAMPLE
    pwsh -File scripts/deploy-preview.ps1
#>
[CmdletBinding()]
param(
    [string]$NodeDir = 'F:\dev\node-v24.19.0-win-x64',
    [string]$Repo    = 'crazy-fitness',
    [string]$Owner   = 'kalynakate-create'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$apiDir = Join-Path $root 'src\app\api'
$parked = Join-Path $env:TEMP 'cf-api-parked'

if ($NodeDir -and (Test-Path $NodeDir)) { $env:Path = "$NodeDir;$env:Path" }

Push-Location $root
try {
    # `output: export` refuses to build POST route handlers, and rightly so:
    # nothing on Pages could serve them. Park them for the preview build only.
    if (Test-Path $apiDir) {
        if (Test-Path $parked) { Remove-Item $parked -Recurse -Force }
        Move-Item $apiDir $parked -Force
    }

    $env:STATIC_EXPORT          = '1'
    $env:PAGES_BASE_PATH        = "/$Repo"
    # next/image does not apply basePath to an unoptimized src, so the app
    # prefixes public asset paths itself. See src/lib/asset.ts.
    $env:NEXT_PUBLIC_BASE_PATH  = "/$Repo"
    $env:NEXT_PUBLIC_STATIC_DEMO = 'true'
    $env:NEXT_PUBLIC_SITE_URL   = "https://$Owner.github.io/$Repo"

    Write-Host 'Building static export...' -ForegroundColor Cyan
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "next build failed ($LASTEXITCODE)" }
}
finally {
    # Always restore, even if the build blew up. Losing the API routes to a
    # failed preview build would be a genuinely nasty surprise.
    if (Test-Path $parked) { Move-Item $parked $apiDir -Force }
    Remove-Item Env:STATIC_EXPORT, Env:PAGES_BASE_PATH, Env:NEXT_PUBLIC_BASE_PATH,
                Env:NEXT_PUBLIC_STATIC_DEMO, Env:NEXT_PUBLIC_SITE_URL `
                -ErrorAction SilentlyContinue
    Pop-Location
}

$out = Join-Path $root 'out'
if (-not (Test-Path $out)) { throw 'no out/ directory produced' }

# Pages runs output through Jekyll otherwise, which drops every _-prefixed
# directory, including _next.
New-Item -ItemType File -Force -Path (Join-Path $out '.nojekyll') | Out-Null

$stage = Join-Path $env:TEMP ("cf-ghp-" + [Guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Force -Path $stage | Out-Null
Copy-Item "$out\*" $stage -Recurse -Force
Copy-Item (Join-Path $out '.nojekyll') $stage -Force

Push-Location $stage
try {
    git init -q -b gh-pages
    git remote add origin "https://github.com/$Owner/$Repo.git"
    git add -A
    git -c core.safecrlf=false commit -q -m "Static design preview $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Host 'Pushing to gh-pages...' -ForegroundColor Cyan
    git push -f origin gh-pages
    if ($LASTEXITCODE -ne 0) { throw "push failed ($LASTEXITCODE)" }
}
finally { Pop-Location }

Write-Host "Published: https://$Owner.github.io/$Repo/" -ForegroundColor Green
Write-Host 'Pages usually takes under a minute to serve the new build.'
