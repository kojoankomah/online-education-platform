const token = getToken();

if (!token) {
    window.location.href =
        "../auth/login.html";
}


// Ensure instructor access
const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (
    user &&
    user.role !== "instructor"
) {
    window.location.href =
        "../dashboard/student-dashboard.html";
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


// Back to manage course
if (courseId) {

    document.getElementById(
        "backToCourse"
    ).href =
        `manage-course.html?courseId=${courseId}`;

}


/**
 * Load current course information
 */
async function loadCourse() {

    try {

        const response = await fetch(
            apiUrl(
                `/courses/${courseId}/manage`
            ),
            {
                headers:
                    authHeaders()
            }
        );


        const course =
            await handleApiResponse(
                response
            );


        document.getElementById(
            "courseTitle"
        ).value =
            course.title || "";


        document.getElementById(
            "courseDescription"
        ).value =
            course.description || "";

    }

    catch (error) {

        console.error(error);


        if (
            error.message ===
            "Authentication required"
        ) {
            return;
        }


        if (
            error.status === 403 ||
            error.status === 404
        ) {

            setFlashToast(
                error.message ||
                "Unable to access this course.",
                "error"
            );

            window.location.href =
                "../dashboard/instructor-dashboard.html";

            return;

        }


        showToast(
            error.message ||
            "Unable to load course.",
            "error"
        );

    }

}


/**
 * Update course
 */
async function updateCourse(e) {

    e.preventDefault();


    const title =
        document.getElementById(
            "courseTitle"
        ).value.trim();


    const description =
        document.getElementById(
            "courseDescription"
        ).value.trim();


    // Title is required
    if (!title) {

        showToast(
            "Course title is required.",
            "warning"
        );

        return;

    }


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    button.disabled = true;

    button.textContent =
        "Saving...";


    try {

        const response = await fetch(
            apiUrl(
                `/courses/${courseId}`
            ),
            {
                method: "PUT",

                headers:
                    authHeaders(),

                body:
                    JSON.stringify({
                        title,
                        description
                    })
            }
        );


        await handleApiResponse(
            response
        );


        setFlashToast(
            "Course updated successfully!",
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
                "Unable to update course.",
                "error"
            );

        }

    }

    finally {

        button.disabled = false;

        button.textContent =
            "Save Changes";

    }

}


// Form listener
document
    .getElementById(
        "editCourseForm"
    )
    .addEventListener(
        "submit",
        updateCourse
    );


// Load current values
if (courseId) {
    loadCourse();
}