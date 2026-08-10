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


// Get URL parameters
const params =
    new URLSearchParams(
        window.location.search
    );

const lessonId =
    params.get("lessonId");

const courseId =
    params.get("courseId");


// Validate lesson ID
if (!lessonId) {

    alert(
        "No lesson selected."
    );

    window.location.href =
        "../dashboard/instructor-dashboard.html";
}


// Validate course ID
if (!courseId) {

    alert(
        "Course information missing."
    );

    window.location.href =
        "../dashboard/instructor-dashboard.html";
}


document.getElementById(
    "backToCourse"
).href =
    `manage-course.html?courseId=${courseId}`;

    
/**
 * Load existing lesson details
 */
async function loadLesson() {

    try {

        const response = await fetch(
            apiUrl(
                `/lessons/${lessonId}`
            ),
            {
                headers: authHeaders()
            }
        );


        const lesson =
            await handleApiResponse(
                response
            );


        document.getElementById(
            "title"
        ).value =
            lesson.title;


        document.getElementById(
            "content"
        ).value =
            lesson.content;


        document.getElementById(
            "lessonOrder"
        ).value =
            lesson.lesson_order;

    }

    catch (error) {

        console.error(error);


        if (
            error.message ===
            "Authentication required"
        ) {
            return;
        }


        alert(
            error.message ||
            "Unable to load lesson."
        );


        if (
            error.status === 403 ||
            error.status === 404
        ) {

            window.location.href =
                `manage-course.html?courseId=${courseId}`;

        }

    }

}



/**
 * Update lesson
 */
async function updateLesson(event) {

    event.preventDefault();


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


    // Validate fields
    if (
        !title ||
        !content ||
        !lessonOrder
    ) {

        alert(
            "Title, content, and lesson order are required."
        );

        return;
    }


    if (
        !Number.isInteger(lessonOrder) ||
        lessonOrder <= 0
    ) {

        alert(
            "Lesson order must be a positive whole number."
        );

        return;
    }


    const button =
        event.target.querySelector(
            "button"
        );


    button.disabled =
        true;

    button.textContent =
        "Saving...";


    try {

        const response = await fetch(
            apiUrl(
                `/lessons/${lessonId}`
            ),
            {
                method: "PUT",

                headers: authHeaders(),

                body: JSON.stringify({
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


        alert(
            "Lesson updated successfully!"
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

            alert(
                error.message ||
                "Unable to update lesson."
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Save Changes";

    }

}



/**
 * Edit lesson form
 */
document
    .getElementById("lessonForm")
    .addEventListener(
        "submit",
        updateLesson
    );


/**
 * Load lesson when page opens
 */
loadLesson();