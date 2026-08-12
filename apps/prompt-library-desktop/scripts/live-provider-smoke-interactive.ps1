param(
  [Parameter(Mandatory = $true)]
  [string]$ResultPath
)

$ErrorActionPreference = 'Stop'
$appRoot = Split-Path -Parent $PSScriptRoot
$summaryScript = Join-Path $PSScriptRoot 'live-provider-smoke-summary.cjs'

function Read-SecretText([string]$Prompt) {
  $secure = Read-Host $Prompt -AsSecureString
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function Invoke-SummarySmoke([string]$ProviderId) {
  Push-Location $appRoot
  try {
    $line = & node $summaryScript "--provider=$ProviderId" '--confirm-paid' 2>&1 | Select-Object -Last 1
    try {
      return $line | ConvertFrom-Json
    } catch {
      return [pscustomobject]@{ ok = $false; providerId = $ProviderId; code = 'invalid_smoke_output'; message = [string]$line }
    }
  } finally {
    Pop-Location
  }
}

Write-Host ''
Write-Host 'T8 Prompt Library 三渠道真实 API Smoke' -ForegroundColor Cyan
Write-Host '密钥只保存在本窗口进程内存；不会写入结果、代码、日志或命令历史。' -ForegroundColor Yellow
Write-Host '每个渠道只发一次对话请求，不自动重试。' -ForegroundColor Yellow
Write-Host ''

$seedanceKey = Read-SecretText '请输入贞贞的平价小屋 API Key'
$workshopKey = Read-SecretText '请输入贞贞的 AI 工坊 API Key（同时用于 OpenAI 兼容渠道）'

$env:SEEDANCE_API_KEY = $seedanceKey
$env:T8STAR_API_KEY = $workshopKey
$env:OPENAI_API_KEY = $workshopKey
$env:OPENAI_BASE_URL = 'https://ai.t8star.cn'
$seedanceKey = $null
$workshopKey = $null

$results = [System.Collections.Generic.List[object]]::new()
try {
  Write-Host ''
  Write-Host '[1/3] 平价小屋真实请求中…' -ForegroundColor Cyan
  $results.Add((Invoke-SummarySmoke 'seedance_nz'))

  Write-Host '[2/3] AI 工坊真实请求中…' -ForegroundColor Cyan
  $results.Add((Invoke-SummarySmoke 't8star_workshop'))

  Write-Host '[3/3] 查询 OpenAI 兼容端点的真实模型列表…' -ForegroundColor Cyan
  $modelResult = Invoke-RestMethod -Method Get -Uri 'https://ai.t8star.cn/v1/models' -Headers @{ Authorization = "Bearer $env:OPENAI_API_KEY" } -TimeoutSec 30
  $modelIds = @($modelResult.data | ForEach-Object { [string]$_.id } | Where-Object { $_ } | Sort-Object -Unique)
  if (-not $modelIds.Count) { throw 'OpenAI 兼容 /v1/models 未返回可用模型 ID。' }
  $preferred = 'gemini-3.5-flash'
  if ($modelIds -contains $preferred) {
    $env:OPENAI_MODEL = $preferred
    Write-Host "服务端已确认模型：$preferred" -ForegroundColor Green
  } else {
    Write-Host '服务端模型列表：' -ForegroundColor Yellow
    $modelIds | ForEach-Object { Write-Host "  $_" }
    $selected = Read-Host '请输入上方一个精确模型 ID'
    if ($modelIds -notcontains $selected) { throw '输入的模型 ID 不在服务端返回列表中。' }
    $env:OPENAI_MODEL = $selected
  }
  Write-Host 'OpenAI 兼容真实请求中…' -ForegroundColor Cyan
  $results.Add((Invoke-SummarySmoke 'openai_compatible'))
} catch {
  $results.Add([pscustomobject]@{ ok = $false; providerId = 'interactive_harness'; code = 'interactive_failure'; message = $_.Exception.Message })
} finally {
  $payload = [ordered]@{
    schemaVersion = 't8-live-provider-smoke-results/v1'
    testedAt = (Get-Date).ToUniversalTime().ToString('o')
    paidCallsConfirmed = $true
    automaticRetry = $false
    results = @($results)
  }
  $payload | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $ResultPath -Encoding utf8
  $env:SEEDANCE_API_KEY = $null
  $env:T8STAR_API_KEY = $null
  $env:OPENAI_API_KEY = $null
  $env:OPENAI_BASE_URL = $null
  $env:OPENAI_MODEL = $null
}

Write-Host ''
Write-Host "测试完成，脱敏结果已写入：$ResultPath" -ForegroundColor Green
Write-Host '按 Enter 关闭本窗口。'
[void](Read-Host)
