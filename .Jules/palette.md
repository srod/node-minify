## 2025-12-30 - Sidebar Toggle Accessibility
**Learning:** `aria-pressed` is for toggle buttons (like Bold/Italic), while `aria-expanded` is for disclosing content (like Menus/Sidebars). Screen readers treat them differently.
**Action:** Always check if a toggle button controls a region (`aria-expanded`) or changes a state (`aria-pressed`).

## 2025-12-30 - Custom 404 Page
**Learning:** Providing a custom 404 page with a clear "Go back home" action is a critical empty state for user recovery.
**Action:** Always ensure a project has a dedicated `404.astro` (or similar) to handle routing errors gracefully.
