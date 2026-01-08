## 2024-05-22 - Scripts in HeadCommon.astro
**Learning:** Scripts placed in `HeadCommon.astro` (or other components injected into `<head>`) with `is:inline` execute immediately. If they manipulate the DOM (e.g., querying elements by tag name), they will fail or return empty collections because the `<body>` has not been parsed yet.
**Action:** Always wrap DOM-manipulating inline scripts in `document.addEventListener("DOMContentLoaded", ...)` or place them at the end of the `<body>`.
