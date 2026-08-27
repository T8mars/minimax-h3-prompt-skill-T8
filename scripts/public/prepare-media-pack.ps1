[CmdletBinding()]
param(
    [string]$Version = "",
    [string]$InputDir = "",
    [string]$OutputDir = "",
    [string]$FfprobePath = "ffprobe"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-Sha256Lower {
    param([Parameter(Mandatory = $true)][string]$LiteralPath)
    $stream = [System.IO.File]::OpenRead($LiteralPath)
    $algorithm = [System.Security.Cryptography.SHA256]::Create()
    try {
        return ([System.BitConverter]::ToString($algorithm.ComputeHash($stream))).Replace("-", "").ToLowerInvariant()
    }
    finally {
        $algorithm.Dispose()
        $stream.Dispose()
    }
}

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
$caseEntries = @($catalog.cases | Sort-Object case_id)
$caseIds = @($caseEntries | ForEach-Object { [string]$_.case_id })
if ($caseIds.Count -eq 0) { throw "Catalog contains no released cases." }

$files = [System.Collections.Generic.List[object]]::new()
$catalogRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot "catalog"))
foreach ($caseEntry in $caseEntries) {
    $caseId = [string]$caseEntry.case_id
    if ($caseId -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') { throw "Invalid case_id '$caseId'." }
    $caseManifestRelative = [string]$caseEntry.manifest_path
    if (-not $caseManifestRelative) { throw "Catalog case '$caseId' has no manifest_path." }
    $caseManifestPath = [System.IO.Path]::GetFullPath((Join-Path $catalogRoot $caseManifestRelative))
    if (-not $caseManifestPath.StartsWith($catalogRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Catalog case '$caseId' manifest escapes catalog/."
    }
    if (-not (Test-Path -LiteralPath $caseManifestPath -PathType Leaf)) { throw "Catalog case '$caseId' manifest is missing." }
    $caseManifest = [System.IO.File]::ReadAllText($caseManifestPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    $mediaStatus = [string]$caseManifest.preview_status.mp4
    $videoPath = Join-Path (Join-Path $InputDir $caseId) "preview.mp4"
    if ($mediaStatus -ne "available_in_electron_media_pack") {
        throw "Released case '$caseId' must be staged as available_in_electron_media_pack; got '$mediaStatus'."
    }
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
        sha256 = Get-Sha256Lower -LiteralPath $videoPath
        size_bytes = [long]$item.Length
        duration_seconds = $duration
        video_codec = [string]$videoStream.codec_name
        audio_codec = if ($audioStream -and $audioStream.codec_name) { [string]$audioStream.codec_name } else { $null }
        audio_mode = if ($audioStream -and $audioStream.codec_name) { "present" } else { "source_silent" }
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
        sha256 = Get-Sha256Lower -LiteralPath $videoPath
        size_bytes = [long]$item.Length
        duration_seconds = $duration
        video_codec = [string]$videoStream.codec_name
        audio_codec = [string]$audioStream.codec_name
        audio_mode = "present"
    })
}

$extraMp4 = @(Get-ChildItem -LiteralPath $InputDir -Recurse -File -Filter *.mp4 | Where-Object {
    $relative = $_.FullName.Substring($InputDir.TrimEnd('\', '/').Length).TrimStart('\', '/').Replace('\', '/')
    $relative -notin @($files | ForEach-Object { $_.path }) -and $relative -notin @($communityFiles | ForEach-Object { $_.path })
})
if ($extraMp4.Count -gt 0) { throw "Media input contains MP4 files not listed by the released catalog." }
if ($Version -eq "1.0.0" -and ($files.Count -ne 7 -or $communityFiles.Count -ne 0)) { throw "v1.0.0 requires exactly 7 case MP4 files and no community Skill media." }

$manifest = [ordered]@{
    schema_version = "1.2.0"
    version = $Version
    generated_at = [DateTime]::UtcNow.ToString("o")
    archive_part_count = 2
    archive_layout = "balanced_lossless_zip_parts"
    catalog_case_count = $caseIds.Count
    case_count = $files.Count
    files = $files
    unavailable_case_count = 0
    unavailable_cases = @()
    community_skill_count = $communityFiles.Count
    community_skill_files = $communityFiles
}
$manifestJson = $manifest | ConvertTo-Json -Depth 8

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$manifestOutput = Join-Path $OutputDir "media-pack-manifest.json"
[System.IO.File]::WriteAllText($manifestOutput, $manifestJson + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
$stagedManifest = Join-Path $InputDir "media-pack-manifest.json"
[System.IO.File]::WriteAllText($stagedManifest, $manifestJson + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
$legacyZipPath = Join-Path $OutputDir "prompt-library-media-v$Version.zip"
if (Test-Path -LiteralPath $legacyZipPath) { Remove-Item -LiteralPath $legacyZipPath -Force }
$zipPaths = @(
    (Join-Path $OutputDir "prompt-library-media-v$Version-part1.zip"),
    (Join-Path $OutputDir "prompt-library-media-v$Version-part2.zip")
)
foreach ($zipPath in $zipPaths) {
    if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
}

$archiveInputs = @()
foreach ($file in $files) {
    $source = Join-Path $InputDir ($file.path.Replace('/', '\'))
    $archiveInputs += [pscustomobject]@{ Source = $source; Path = $file.path; Size = [long](Get-Item -LiteralPath $source).Length }
}
foreach ($file in $communityFiles) {
    $source = Join-Path $InputDir ($file.path.Replace('/', '\'))
    $archiveInputs += [pscustomobject]@{ Source = $source; Path = $file.path; Size = [long](Get-Item -LiteralPath $source).Length }
}
$partFiles = @(
    [System.Collections.Generic.List[object]]::new(),
    [System.Collections.Generic.List[object]]::new()
)
$partBytes = [long[]]@(0, 0)
foreach ($archiveInput in ($archiveInputs | Sort-Object @{ Expression = "Size"; Descending = $true }, @{ Expression = "Path"; Ascending = $true })) {
    $partIndex = if ($partBytes[0] -le $partBytes[1]) { 0 } else { 1 }
    $partFiles[$partIndex].Add($archiveInput)
    $partBytes[$partIndex] += $archiveInput.Size
}
if ($partFiles[0].Count -eq 0 -or $partFiles[1].Count -eq 0) { throw "Media pack must produce two non-empty parts." }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipHashes = @()
for ($partIndex = 0; $partIndex -lt $zipPaths.Count; $partIndex += 1) {
    $zipPath = $zipPaths[$partIndex]
    $archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($archiveInput in $partFiles[$partIndex]) {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $archiveInput.Source, $archiveInput.Path, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $manifestOutput, "media-pack-manifest.json", [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
    finally {
        $archive.Dispose()
    }
    $zipItem = Get-Item -LiteralPath $zipPath
    if ($zipItem.Length -ge 2147483648) { throw "$($zipItem.Name) exceeds GitHub's per-asset size limit." }
    $zipHashes += Get-Sha256Lower -LiteralPath $zipPath
    Write-Output "Media pack part $($partIndex + 1): $zipPath"
    Write-Output "Part $($partIndex + 1) bytes: $($zipItem.Length)"
    Write-Output "Part $($partIndex + 1) SHA256: $($zipHashes[$partIndex])"
}
Write-Output "Manifest: $manifestOutput"
Write-Output "Workflow media_sha256: $($zipHashes -join ',')"
Write-Output "Cases: $($files.Count)"
Write-Output "Unavailable released cases: 0"
Write-Output "Community Skills: $($communityFiles.Count)"
