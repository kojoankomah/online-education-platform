const token = getToken();

if (!token) {

    window.location.href =
        "../auth/login.html";

}


// Get course ID
const params =
    new URLSearchParams(
        window.location.search
    );

const courseId =
    params.get("courseId");


// Validate course ID
if (!courseId) {

    setFlashToast(
        "No course selected.",
        "warning"
    );

    window.location.href =
        "../dashboard/instructor-dashboard.html";

}


// Back to current course
document.getElementById(
    "backToCourse"
).href =
    `manage-course.html?courseId=${courseId}`;


// Form event
document
    .getElementById("lessonForm")
    .addEventListener(
        "submit",
        createLesson
    );


/**
 * Create lesson
 */
async function createLesson(e) {

    e.preventDefault();


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    const title =
        document.getElementById(
            "title"
        ).value.trim();


    const content =
        document.getElementById(
            "content"
        ).value.trim();


    const lessonOrder =
        Number(
            document.getElementById(
                "lessonOrder"
            ).value
        );


    // ----------------------------
    // VALIDATION
    // ----------------------------

    if (!title || !content) {

        showToast(
            "Title and lesson content are required.",
            "warning"
        );

        return;
    }


    if (
        !Number.isInteger(lessonOrder) ||
        lessonOrder <= 0
    ) {

        showToast(
            "Lesson order must be a positive whole number.",
            "warning"
        );

        return;
    }


    // Disable only after validation passes
    button.disabled =
        true;

    button.textContent =
        "Creating...";


    try {

        const response = await fetch(
            apiUrl(
                `/lessons/course/${courseId}`
            ),
            {
                method: "POST",

                headers:
                    authHeaders(),

                body:
                    JSON.stringify({
                        title,
                        content,
                        lesson_order:
                            lessonOrder
                    })
            }
        );


        await handleApiResponse(
            response
        );


        setFlashToast(
            "Lesson created successfully!",
            "success"
        );


        window.location.href =
            `manage-course.html?courseId=${courseId}`;

    }

    catch (error) {

        console.error(error);


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to create lesson.",
                "error"
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Create Lesson";

    }

}