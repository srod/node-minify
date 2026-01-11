# Palette's Journal

## 2024-05-22 - Accessibility in Code Blocks
**Learning:** Code blocks often lack proper labeling for screen readers, making them just "blocks of text".
**Action:** Ensure code blocks or their containers have `aria-label` or `title` attributes where appropriate, or use `role="region"` with a label if they are scrollable.

## 2024-05-22 - Contrast in Documentation
**Learning:** Documentation often uses subtle colors for syntax highlighting which might fail contrast checks.
**Action:** Regularly check contrast ratios for syntax highlighting themes.
