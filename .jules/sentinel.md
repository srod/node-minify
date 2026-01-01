## 2024-05-23 - Missing Security Headers in Docs

**Vulnerability:** The documentation site (hosted on Cloudflare Pages) lacked standard security headers, exposing it to potential clickjacking and content sniffing attacks.
**Learning:** Static sites hosted on platforms like Cloudflare Pages often require manual configuration (e.g., `_headers` file) to serve appropriate security headers.
**Prevention:** Added a `_headers` file to `docs/public` to enforce `X-Frame-Options`, `X-Content-Type-Options`, etc.
