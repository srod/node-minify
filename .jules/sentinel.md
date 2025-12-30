## 2024-02-14 - Subprocess Timeout
**Vulnerability:** Indefinite hanging of subprocesses (DoS risk)
**Learning:** `child_process.spawn` does not have a default timeout. Automated build systems or servers can hang indefinitely if a child process (like Java) stalls.
**Prevention:** Always implement a timeout mechanism when spawning subprocesses, especially for external tools.
