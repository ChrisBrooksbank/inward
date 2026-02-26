# Ralph Wiggum Loop - Fresh context per iteration (PowerShell 5)
# Usage: .\loop.ps1 [-Mode plan|build] [-MaxIterations N]
#
# Examples:
#   .\loop.ps1 -Mode plan          # Planning mode, default 5 iterations
#   .\loop.ps1 -Mode plan -MaxIterations 3
#   .\loop.ps1 -Mode build         # Build mode, default 25 iterations
#   .\loop.ps1 -Mode build -MaxIterations 10

param(
    [ValidateSet('plan', 'build')]
    [string]$Mode = 'build',

    [int]$MaxIterations = 0
)

$ErrorActionPreference = 'Stop'

# Default iteration limits
if ($MaxIterations -eq 0) {
    if ($Mode -eq 'plan') {
        $MaxIterations = 5
    } else {
        $MaxIterations = 25
    }
}

$PromptFile = "PROMPT_$Mode.md"

if (-not (Test-Path $PromptFile)) {
    Write-Error "Error: $PromptFile not found"
    exit 1
}

Write-Host "=========================================="
Write-Host "Ralph Wiggum Loop"
Write-Host "Mode: $Mode"
Write-Host "Prompt: $PromptFile"
Write-Host "Max iterations: $MaxIterations"
Write-Host "=========================================="

$Iteration = 0

while ($true) {
    if ($Iteration -ge $MaxIterations) {
        Write-Host ""
        Write-Host "Reached max iterations ($MaxIterations). Stopping."
        break
    }

    $Iteration++
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

    Write-Host ""
    Write-Host "=========================================="
    Write-Host "Iteration $Iteration / $MaxIterations (Mode: $Mode)"
    Write-Host $Timestamp
    Write-Host "=========================================="

    # Fresh Claude session each iteration - context resets!
    Get-Content $PromptFile -Raw | claude -p `
        --dangerously-skip-permissions `
        --model sonnet

    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Claude exited with code $LASTEXITCODE"
    }

    # Auto-commit progress after each iteration
    git add -A
    $StagedChanges = git diff --staged --quiet 2>&1
    if ($LASTEXITCODE -ne 0) {
        git commit -m "Ralph iteration $Iteration ($Mode mode)`n`nCo-Authored-By: Claude <noreply@anthropic.com>"
        Write-Host "Changes committed."
    } else {
        Write-Host "No changes to commit."
    }

    Write-Host "Iteration $Iteration complete."
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Ralph loop finished after $Iteration iterations."
