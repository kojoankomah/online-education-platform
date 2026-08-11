/**
 * Global Toast Notification System
 *
 * Types:
 * - success
 * - error
 * - warning
 * - info
 */

function showToast(
    message,
    type = "info",
    duration = 3500
) {

    if (!message) {
        return;
    }


    /**
     * Create toast container
     * the first time it is needed.
     */
    let container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "toastContainer";


        container.className =
            "toast-container";


        container.setAttribute(
            "aria-live",
            "polite"
        );


        container.setAttribute(
            "aria-atomic",
            "true"
        );


        document.body.appendChild(
            container
        );

    }


    /**
     * Allowed notification types
     */
    const allowedTypes = [
        "success",
        "error",
        "warning",
        "info"
    ];


    if (
        !allowedTypes.includes(type)
    ) {
        type = "info";
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${type}`;


    toast.setAttribute(
        "role",
        type === "error"
            ? "alert"
            : "status"
    );


    /**
     * Icon
     */
    const icon =
        document.createElement(
            "span"
        );


    icon.className =
        "toast-icon";


    const icons = {
        success: "✓",
        error: "✕",
        warning: "!",
        info: "i"
    };


    icon.textContent =
        icons[type];


    /**
     * Message
     */
    const messageElement =
        document.createElement(
            "p"
        );


    messageElement.className =
        "toast-message";


    // textContent prevents HTML injection
    messageElement.textContent =
        message;


    /**
     * Close button
     */
    const closeButton =
        document.createElement(
            "button"
        );


    closeButton.type =
        "button";


    closeButton.className =
        "toast-close";


    closeButton.setAttribute(
        "aria-label",
        "Close notification"
    );


    closeButton.textContent =
        "×";


    toast.appendChild(
        icon
    );

    toast.appendChild(
        messageElement
    );

    toast.appendChild(
        closeButton
    );


    container.appendChild(
        toast
    );


    /**
     * Trigger entrance animation
     */
    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );

        }
    );


    let timeoutId;


    /**
     * Remove notification
     */
    function removeToast() {

        toast.classList.remove(
            "show"
        );


        toast.classList.add(
            "hide"
        );


        setTimeout(
            () => {

                toast.remove();

            },
            250
        );

    }


    /**
     * Automatic removal
     */
    timeoutId =
        setTimeout(
            removeToast,
            duration
        );


    /**
     * Manual close
     */
    closeButton.addEventListener(
        "click",
        () => {

            clearTimeout(
                timeoutId
            );

            removeToast();

        }
    );


    /**
     * Pause timer while
     * user is reading it.
     */
    toast.addEventListener(
        "mouseenter",
        () => {

            clearTimeout(
                timeoutId
            );

        }
    );


    toast.addEventListener(
        "mouseleave",
        () => {

            timeoutId =
                setTimeout(
                    removeToast,
                    2000
                );

        }
    );

}



/**
 * Save a notification to display
 * after the next page loads.
 */
function setFlashToast(
    message,
    type = "info"
) {

    sessionStorage.setItem(
        "flashToast",
        JSON.stringify({
            message,
            type
        })
    );

}


/**
 * Display a saved notification
 * after navigation/redirect.
 */
function showFlashToast() {

    const savedToast =
        sessionStorage.getItem(
            "flashToast"
        );


    if (!savedToast) {
        return;
    }


    sessionStorage.removeItem(
        "flashToast"
    );


    try {

        const toast =
            JSON.parse(
                savedToast
            );


        showToast(
            toast.message,
            toast.type
        );

    }

    catch (error) {

        console.error(
            "Unable to display flash notification:",
            error
        );

    }

}


/**
 * Automatically display
 * flash notifications.
 */
document.addEventListener(
    "DOMContentLoaded",
    showFlashToast
);