/**
 * UX Improvement: Make scrollable code blocks keyboard accessible
 * Only adds tabindex="0" if the code block actually overflows and needs scrolling.
 * Adds role="region" and aria-label to communicate this behavior to screen readers.
 */

const updateCodeBlocks = () => {
    const preElements = document.querySelectorAll("pre");

    preElements.forEach((pre) => {
        // Check if the element has horizontal overflow
        const isScrollable =
            pre.scrollWidth > pre.clientWidth ||
            pre.scrollHeight > pre.clientHeight;

        if (isScrollable) {
            // Only add attributes if not already present
            if (!pre.hasAttribute("tabindex")) {
                pre.setAttribute("tabindex", "0");
            }
            if (!pre.hasAttribute("role")) {
                pre.setAttribute("role", "region");
            }
            if (!pre.hasAttribute("aria-label")) {
                pre.setAttribute("aria-label", "Code Snippet");
            }
            // Mark that we modified this element
            pre.dataset.scrollableFocusable = "true";
        } else if (pre.dataset.scrollableFocusable === "true") {
            // Only clean up elements we previously modified
            pre.removeAttribute("tabindex");
            pre.removeAttribute("role");
            pre.removeAttribute("aria-label");
            delete pre.dataset.scrollableFocusable;
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
