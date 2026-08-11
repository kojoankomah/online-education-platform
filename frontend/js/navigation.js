/**
 * Responsive Navigation
 *
 * Handles:
 * - Landing page hamburger menu
 * - Student dashboard mobile sidebar
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupLandingNavigation();
        setupDashboardSidebar();

    }
);



/**
 * Landing page navigation
 */
function setupLandingNavigation() {

    const toggle =
        document.getElementById(
            "landingMenuToggle"
        );

    const menu =
        document.getElementById(
            "landingMenu"
        );


    // Not a landing page
    if (!toggle || !menu) {
        return;
    }


    function openMenu() {

        menu.classList.add(
            "open"
        );

        toggle.classList.add(
            "active"
        );

        toggle.setAttribute(
            "aria-expanded",
            "true"
        );

    }


    function closeMenu() {

        menu.classList.remove(
            "open"
        );

        toggle.classList.remove(
            "active"
        );

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    toggle.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            if (
                menu.classList.contains(
                    "open"
                )
            ) {

                closeMenu();

            }

            else {

                openMenu();

            }

        }
    );


    // Close after selecting a link
    menu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                closeMenu
            );

        });


    // Close when clicking outside
    document.addEventListener(
        "click",
        event => {

            if (
                !menu.contains(event.target) &&
                !toggle.contains(event.target)
            ) {

                closeMenu();

            }

        }
    );


    // Escape key closes menu
    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeMenu();

            }

        }
    );


    // Reset when returning to desktop
    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900
            ) {

                closeMenu();

            }

        }
    );

}



/**
 * Student dashboard sidebar
 */
function setupDashboardSidebar() {

    const sidebar =
        document.getElementById(
            "studentSidebar"
        );

    const toggle =
        document.getElementById(
            "sidebarToggle"
        );

    const closeButton =
        document.getElementById(
            "sidebarClose"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    // Not a student dashboard
    if (
        !sidebar ||
        !toggle ||
        !overlay
    ) {
        return;
    }


    function openSidebar() {

        sidebar.classList.add(
            "open"
        );

        overlay.classList.add(
            "open"
        );

        toggle.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "sidebar-open"
        );

    }


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        overlay.classList.remove(
            "open"
        );

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "sidebar-open"
        );

    }


    toggle.addEventListener(
        "click",
        () => {

            if (
                sidebar.classList.contains(
                    "open"
                )
            ) {

                closeSidebar();

            }

            else {

                openSidebar();

            }

        }
    );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeSidebar
        );

    }


    overlay.addEventListener(
        "click",
        closeSidebar
    );


    // Close after selecting sidebar link
    sidebar
        .querySelectorAll("nav a")
        .forEach(link => {

            link.addEventListener(
                "click",
                closeSidebar
            );

        });


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeSidebar();

            }

        }
    );


    // Reset when returning to desktop
    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900
            ) {

                closeSidebar();

            }

        }
    );

}