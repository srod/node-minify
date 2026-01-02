// UX Improvement: Add Copy Code Button to code blocks
// This script looks for <pre> blocks and prepends a "Copy" button to them.

document.addEventListener("DOMContentLoaded", () => {
  const preBlocks = document.querySelectorAll("pre");

  preBlocks.forEach((pre) => {
    // Only add button if it doesn't already exist (avoid duplication)
    if (pre.querySelector(".copy-code-button")) return;

    // Ensure pre has relative position for absolute positioning fallback
    if (getComputedStyle(pre).position === "static") {
      pre.style.position = "relative";
    }

    const button = document.createElement("button");
    button.className = "copy-code-button";
    button.type = "button";
    button.ariaLabel = "Copy code to clipboard";
    button.innerText = "Copy";

    let timeoutId = null;

    // Functionality
    button.addEventListener("click", async () => {
      // Clone the code block to extract text without the button text
      // if the button was appended directly to pre (fallback case)
      const code = pre.querySelector("code");
      let text = "";

      if (code) {
        text = code.innerText;
      } else {
        // Fallback: Clone pre, remove button, get text
        const clone = pre.cloneNode(true);
        const buttonInClone = clone.querySelector(".copy-code-button");
        if (buttonInClone) {
          buttonInClone.remove();
        }
        text = clone.innerText;
      }

      try {
        await navigator.clipboard.writeText(text);

        // Visual feedback
        button.innerText = "Copied!";
        button.classList.add("copied");
        button.ariaLabel = "Copied to clipboard";

        // Clear existing timeout if user clicked again rapidly
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          button.innerText = "Copy";
          button.classList.remove("copied");
          button.ariaLabel = "Copy code to clipboard";
          timeoutId = null;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        button.innerText = "Error";
        setTimeout(() => {
            button.innerText = "Copy";
        }, 2000);
      }
    });

    pre.prepend(button);
  });
});
