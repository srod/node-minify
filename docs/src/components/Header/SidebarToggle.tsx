/** @jsxImportSource preact */
import type { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

const MenuToggle: FunctionalComponent = () => {
    const [sidebarShown, setSidebarShown] = useState(false);

    useEffect(() => {
        const body = document.querySelector("body");
        if (sidebarShown) {
            body?.classList.add("mobile-sidebar-toggle");
        } else {
            body?.classList.remove("mobile-sidebar-toggle");
        }
    }, [sidebarShown]);

    return (
        <button
            type="button"
            aria-expanded={sidebarShown}
            aria-controls="grid-left"
            aria-label={sidebarShown ? "Close sidebar" : "Open sidebar"}
            id="menu-toggle"
            onClick={() => setSidebarShown(!sidebarShown)}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
        </button>
    );
};

export default MenuToggle;
