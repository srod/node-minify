## 2025-12-30 - Sidebar Toggle Accessibility
**Learning:** `aria-pressed` is for toggle buttons (like Bold/Italic), while `aria-expanded` is for disclosing content (like Menus/Sidebars). Screen readers treat them differently.
**Action:** Always check if a toggle button controls a region (`aria-expanded`) or changes a state (`aria-pressed`).
