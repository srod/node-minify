// UX: Add a copy button to all code blocks
window.addEventListener('DOMContentLoaded', () => {
    // Add styles programmatically to avoid extra files
    const style = document.createElement('style');
    style.textContent = `
        .copy-code-button {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--theme-code-bg);
            border: 1px solid var(--theme-divider);
            border-radius: 4px;
            padding: 4px;
            color: var(--theme-code-text);
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s, background-color 0.2s;
            width: 2rem;
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        pre:hover .copy-code-button, .copy-code-button:focus { opacity: 1; }
        .copy-code-button:hover { background: var(--theme-bg-hover); color: var(--theme-text); }
        .copy-code-button.copied { border-color: var(--color-green); color: var(--color-green); }
        .copy-code-button svg { pointer-events: none; }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('pre').forEach((pre) => {
        if (pre.querySelector('.copy-code-button')) return;

        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.type = 'button';
        button.ariaLabel = 'Copy code to clipboard';

        button.innerHTML = `
            <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;

        button.addEventListener('click', async () => {
            const code = pre.querySelector('code')?.innerText;
            if (!code) return;
            try {
                await navigator.clipboard.writeText(code);
                button.classList.add('copied');
                button.ariaLabel = 'Copied!';
                button.querySelector('.copy-icon').style.display = 'none';
                button.querySelector('.check-icon').style.display = 'block';
                setTimeout(() => {
                    button.classList.remove('copied');
                    button.ariaLabel = 'Copy code to clipboard';
                    button.querySelector('.copy-icon').style.display = 'block';
                    button.querySelector('.check-icon').style.display = 'none';
                }, 2000);
            } catch (err) { console.error('Failed to copy', err); }
        });

        pre.appendChild(button);
    });
});
