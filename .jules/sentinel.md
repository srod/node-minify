## 2024-02-14 - Unbounded Buffer in Child Process Execution
**Vulnerability:** The `packages/run` utility accumulated `stdout` and `stderr` from child processes into unbounded strings, creating a Denial of Service (DoS) risk via memory exhaustion. This affected both `google-closure-compiler` and `yui` packages.
**Learning:** `child_process.spawn` does not have a built-in `maxBuffer` option like `exec` does; it must be implemented manually on the streams.
**Prevention:**
1. Implemented manual buffer size checks in `data` event listeners for `spawn`ed processes in `packages/run`.
2. Added a default `maxBuffer` of 1MB (matching Node.js `exec` default) to ensure secure-by-default behavior for all consumers.
3. Updated consumers (`google-closure-compiler`, `yui`) to respect user-provided buffer settings.
