/**
 * UX Improvement: Make scrollable code blocks keyboard accessible
 * Only adds tabindex="0" if the code block actually overflows and needs scrolling.
 * Adds role="region" and aria-label to communicate this behavior to screen readers.
 */

const updateCodeBlocks = () => {
    const preElements = document.querySelectorAll("pre");

    preElements.forEach((pre) => {
        // Check if the element has horizontal overflow
        const isScrollable = pre.scrollWidth > pre.clientWidth;

        if (isScrollable) {
            // Only add tabindex if not already present
            if (!pre.hasAttribute("tabindex")) {
                pre.setAttribute("tabindex", "0");
            }
            if (!pre.hasAttribute("role")) {
                pre.setAttribute("role", "region");
            }
            if (!pre.hasAttribute("aria-label")) {
                pre.setAttribute("aria-label", "Code Snippet");
            }
        } else {
            // Clean up if it's no longer scrollable (e.g., window resized larger)
            if (pre.getAttribute("tabindex") === "0") {
                pre.removeAttribute("tabindex");
            }
            if (pre.getAttribute("role") === "region") {
                pre.removeAttribute("role");
            }
            if (pre.getAttribute("aria-label") === "Code Snippet") {
                pre.removeAttribute("aria-label");
            }
        }
    });
};

// Run on load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateCodeBlocks);
} else {
    updateCodeBlocks();
}

// Re-check on window resize (debounced slightly for performance)
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCodeBlocks, 100);
});
