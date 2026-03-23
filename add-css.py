import re

file_path = r"c:\Users\MariI\prompt1\app\globals.css"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_styles = """

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
"""

# Find the .animate-shimmer block and insert after it
pattern = r'(\.animate-shimmer\s*\{[^}]+\})'
match = re.search(pattern, content)
if match:
    insert_pos = match.end()
    content = content[:insert_pos] + new_styles + content[insert_pos:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("CSS updated successfully")
else:
    print("Pattern not found in file")
    # Debug: print chars around expected location
    idx = content.find("animate-shimmer")
    if idx >= 0:
        print(f"Found 'animate-shimmer' at index {idx}")
        print(repr(content[idx-10:idx+50]))
    else:
        idx = content.find("shimmer")
        if idx >= 0:
            print(f"Found 'shimmer' at index {idx}")
            print(repr(content[idx-10:idx+50]))
        else:
            print("'shimmer' not found anywhere in file")
