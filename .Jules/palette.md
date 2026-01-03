## 2024-02-14 - Accessible Table of Contents
**Learning:** For active elements in a list (like a Table of Contents), using `aria-current="true"` on the link itself provides better context to screen readers than just visual styling.
**Action:** When creating sidebar navigation or TOCs, always ensure the active state is programmatic, not just visual. Also, auto-scrolling the active item into view improves the experience for all users, especially on long pages.
