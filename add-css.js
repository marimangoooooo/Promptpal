const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'MariI', 'prompt1', 'app', 'globals.css');
let content = fs.readFileSync(filePath, 'utf-8');

const newStyles = `

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
`;

const marker = '.animate-shimmer';
const idx = content.indexOf(marker);
if (idx >= 0) {
  const braceIdx = content.indexOf('}', idx);
  if (braceIdx >= 0) {
    content = content.slice(0, braceIdx + 1) + newStyles + content.slice(braceIdx + 1);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('CSS updated successfully');
  } else {
    console.log('Closing brace not found');
  }
} else {
  console.log('Marker not found. Checking for shimmer...');
  const sIdx = content.indexOf('shimmer');
  console.log(sIdx >= 0 ? `Found shimmer at ${sIdx}` : 'shimmer not found');
  console.log('File length:', content.length);
}
