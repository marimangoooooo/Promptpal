$file = "c:\Users\MariI\prompt1\app\globals.css"
$content = [System.IO.File]::ReadAllText($file)

$newStyles = @"

@keyframes thinking-progress {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

.thinking-bar {
  position: relative;
  overflow: hidden;
  border-radius: 9999px;
  background: rgba(29, 39, 53, 0.08);
}

.thinking-bar::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(208, 123, 73, 0.5) 30%,
    rgba(24, 79, 73, 0.6) 50%,
    rgba(208, 123, 73, 0.5) 70%,
    transparent 100%
  );
  animation: thinking-progress 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.sidebar-progress-fill {
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
"@

$marker = ".animate-shimmer {"
$idx = $content.IndexOf($marker)
if ($idx -ge 0) {
  $endIdx = $content.IndexOf("}", $idx)
  $insertPoint = $endIdx + 1
  $content = $content.Insert($insertPoint, "`r`n" + $newStyles)
  [System.IO.File]::WriteAllText($file, $content)
  Write-Host "CSS updated successfully"
} else {
  Write-Host "Marker not found"
}
