[CmdletBinding()]
param(
    [string]$Version = "",
    [string]$InputDir = "",
    [string]$OutputDir = "",
    [string]$FfprobePath = "ffprobe"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
if (-not $Version) {
    $Version = ([System.IO.File]::ReadAllText((Join-Path $repoRoot "package.json"), [System.Text.Encoding]::UTF8) | ConvertFrom-Json).version
}
if ($Version -notmatch '^(0|[1-9][0-9]*)\.[0-9]\.[0-9]$') {
    throw "Version '$Version' violates decimal-carry format MAJOR.0-9.0-9."
}
if (-not $InputDir) { $InputDir = Join-Path $repoRoot ".release-input\media" }
if (-not $OutputDir) { $OutputDir = Join-Path $repoRoot ".release-input\out" }
$InputDir = [System.IO.Path]::GetFullPath($InputDir)
$OutputDir = [System.IO.Path]::GetFullPath($OutputDir)
$releaseRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot ".release-input"))
if (-not $InputDir.StartsWith($releaseRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "InputDir must stay inside .release-input." }
if (-not $OutputDir.StartsWith($releaseRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "OutputDir must stay inside .release-input." }
if (-not (Test-Path -LiteralPath $InputDir -PathType Container)) { throw "Media input directory does not exist." }

$ffprobe = Get-Command $FfprobePath -ErrorAction Stop
$catalog = [System.IO.File]::ReadAllText((Join-Path $repoRoot "catalog\manifest.json"), [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$caseIds = @($catalog.cases | ForEach-Object { [string]$_.case_id } | Sort-Object)
if ($caseIds.Count -eq 0) { throw "Catalog contains no released cases." }

$files = [System.Collections.Generic.List[object]]::new()
foreach ($caseId in $caseIds) {
    if ($caseId -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') { throw "Invalid case_id '$caseId'." }
    $videoPath = Join-Path (Join-Path $InputDir $caseId) "preview.mp4"
    if (-not (Test-Path -LiteralPath $videoPath -PathType Leaf)) { throw "Missing complete MP4 for case '$caseId'." }
    $probeRaw = & $ffprobe.Source -v error -show_entries "format=duration:stream=codec_type,codec_name" -of json -- $videoPath
    if ($LASTEXITCODE -ne 0) { throw "ffprobe failed for case '$caseId'." }
    $probe = $probeRaw | ConvertFrom-Json
    $videoStream = @($probe.streams | Where-Object { $_.codec_type -eq "video" }) | Select-Object -First 1
    $audioStream = @($probe.streams | Where-Object { $_.codec_type -eq "audio" }) | Select-Object -First 1
    if (-not $videoStream -or -not $videoStream.codec_name) { throw "No decoded video codec found for case '$caseId'." }
    $duration = [Math]::Round([double]$probe.format.duration, 3)
    if ($duration -le 0) { throw "Invalid duration for case '$caseId'." }
    $item = Get-Item -LiteralPath $videoPath
    $files.Add([ordered]@{
        case_id = $caseId
        path = "$caseId/preview.mp4"
        sha256 = (Get-FileHash -LiteralPath $videoPath -Algorithm SHA256).Hash.ToLowerInvariant()
        size_bytes = [long]$item.Length
        duration_seconds = $duration
        video_codec = [string]$videoStream.codec_name
        audio_codec = if ($audioStream -and $audioStream.codec_name) { [string]$audioStream.codec_name } else { $null }
    })
}

$communityFiles = [System.Collections.Generic.List[object]]::new()
$communityIndexPath = Join-Path $repoRoot "catalog\community-skills\manifest.json"
$communityIds = @()
if (Test-Path -LiteralPath $communityIndexPath -PathType Leaf) {
    $communityIndex = [System.IO.File]::ReadAllText($communityIndexPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    $communityIds = @($communityIndex.skills | ForEach-Object { [string]$_.id } | Sort-Object)
}
foreach ($skillId in $communityIds) {
    if ($skillId -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') { throw "Invalid community Skill id '$skillId'." }
    $relativePath = "community-skills/$skillId/preview.mp4"
    $videoPath = Join-Path $InputDir ($relativePath.Replace('/', '\'))
    if (-not (Test-Path -LiteralPath $videoPath -PathType Leaf)) { throw "Missing complete MP4 for community Skill '$skillId'." }
    $probeRaw = & $ffprobe.Source -v error -show_entries "format=duration:stream=codec_type,codec_name" -of json -- $videoPath
    if ($LASTEXITCODE -ne 0) { throw "ffprobe failed for community Skill '$skillId'." }
    $probe = $probeRaw | ConvertFrom-Json
    $videoStream = @($probe.streams | Where-Object { $_.codec_type -eq "video" }) | Select-Object -First 1
    $audioStream = @($probe.streams | Where-Object { $_.codec_type -eq "audio" }) | Select-Object -First 1
    if (-not $videoStream -or -not $videoStream.codec_name) { throw "No decoded video codec found for community Skill '$skillId'." }
    if (-not $audioStream -or -not $audioStream.codec_name) { throw "No decoded audio codec found for community Skill '$skillId'." }
    $duration = [Math]::Round([double]$probe.format.duration, 3)
    if ($duration -le 0) { throw "Invalid duration for community Skill '$skillId'." }
    $item = Get-Item -LiteralPath $videoPath
    $communityFiles.Add([ordered]@{
        skill_id = $skillId
        path = $relativePath
        sha256 = (Get-FileHash -LiteralPath $videoPath -Algorithm SHA256).Hash.ToLowerInvariant()
        size_bytes = [long]$item.Length
        duration_seconds = $duration
        video_codec = [string]$videoStream.codec_name
        audio_codec = [string]$audioStream.codec_name
    })
}

$extraMp4 = @(Get-ChildItem -LiteralPath $InputDir -Recurse -File -Filter *.mp4 | Where-Object {
    $relative = $_.FullName.Substring($InputDir.TrimEnd('\', '/').Length).TrimStart('\', '/').Replace('\', '/')
    $relative -notin @($files | ForEach-Object { $_.path }) -and $relative -notin @($communityFiles | ForEach-Object { $_.path })
})
if ($extraMp4.Count -gt 0) { throw "Media input contains MP4 files not listed by the released catalog." }
if ($Version -eq "1.0.0" -and ($files.Count -ne 7 -or $communityFiles.Count -ne 0)) { throw "v1.0.0 requires exactly 7 case MP4 files and no community Skill media." }

$manifest = [ordered]@{
    schema_version = "1.0.0"
    version = $Version
    generated_at = [DateTime]::UtcNow.ToString("o")
    case_count = $files.Count
    files = $files
    community_skill_count = $communityFiles.Count
    community_skill_files = $communityFiles
}
$manifestJson = $manifest | ConvertTo-Json -Depth 8

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$manifestOutput = Join-Path $OutputDir "media-pack-manifest.json"
[System.IO.File]::WriteAllText($manifestOutput, $manifestJson + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
$zipPath = Join-Path $OutputDir "prompt-library-media-v$Version.zip"
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in $files) {
        $source = Join-Path $InputDir ($file.path.Replace('/', '\'))
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $source, $file.path, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
    foreach ($file in $communityFiles) {
        $source = Join-Path $InputDir ($file.path.Replace('/', '\'))
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $source, $file.path, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $manifestOutput, "media-pack-manifest.json", [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}
finally {
    $archive.Dispose()
}

$zipHash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
Write-Output "Media pack: $zipPath"
Write-Output "Manifest: $manifestOutput"
Write-Output "SHA256: $zipHash"
Write-Output "Cases: $($files.Count)"
Write-Output "Community Skills: $($communityFiles.Count)"
