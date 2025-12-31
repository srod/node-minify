## 2025-12-30 - Sidebar Toggle Accessibility
**Learning:** `aria-pressed` is for toggle buttons (like Bold/Italic), while `aria-expanded` is for disclosing content (like Menus/Sidebars). Screen readers treat them differently.
**Action:** Always check if a toggle button controls a region (`aria-expanded`) or changes a state (`aria-pressed`).
## 2025-12-30 - Interactive Markdown Elements
**Learning:** To add interactivity (like copy buttons) to standard Markdown elements in Astro, inject a client-side script that manipulates the DOM on load and page transition.
**Action:** Use a dedicated Astro component with a `<script>` tag and import it into the layout or page component.
