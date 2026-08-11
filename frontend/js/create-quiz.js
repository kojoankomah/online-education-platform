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


// Get course ID from URL
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


// Set Back link only when
// a valid course ID exists
if (courseId) {

    document.getElementById(
        "backToCourse"
    ).href =
        `manage-course.html?courseId=${courseId}`;

}



/**
 * Load lessons belonging to the course
 */
async function loadLessons() {

    const select =
        document.getElementById(
            "lessonSelect"
        );


    try {

        const response =
            await fetch(
                apiUrl(
                    `/lessons/course/${courseId}`
                ),
                {
                    headers:
                        authHeaders()
                }
            );


        const data =
            await handleApiResponse(
                response
            );


        select.innerHTML = "";


        const lessons =
            data.lessons || data;


        if (lessons.length === 0) {

            select.innerHTML = `

                <option value="">
                    No lessons available
                </option>

            `;

            return;

        }


        lessons.forEach(lesson => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                lesson.id;


            option.textContent =
                `Lesson ${lesson.lesson_order}: ${lesson.title}`;


            select.appendChild(
                option
            );

        });

    }

    catch (error) {

        console.error(error);


        if (
            error.message ===
            "Authentication required"
        ) {
            return;
        }


        // Ownership failure or missing course
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


        // Error that stays on this page
        showToast(
            error.message ||
            "Unable to load lessons.",
            "error"
        );

    }

}



/**
 * Create quiz
 */
async function createQuiz(e) {

    e.preventDefault();


    const lessonId =
        document.getElementById(
            "lessonSelect"
        ).value;


    const title =
        document.getElementById(
            "quizTitle"
        ).value.trim();


    // Validate lesson
    if (!lessonId) {

        showToast(
            "Please select a lesson.",
            "warning"
        );

        return;

    }


    // Validate title
    if (!title) {

        showToast(
            "Quiz title is required.",
            "warning"
        );

        return;

    }


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    // Disable only after
    // validation passes
    button.disabled =
        true;

    button.textContent =
        "Creating...";


    try {

        const response =
            await fetch(
                apiUrl(
                    `/quizzes/lesson/${lessonId}`
                ),
                {
                    method: "POST",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
                            title
                        })
                }
            );


        const data =
            await handleApiResponse(
                response
            );


        // Flash toast because
        // we are redirecting
        setFlashToast(
            "Quiz created successfully!",
            "success"
        );


        window.location.href =
            `add-question.html?quizId=${data.quiz.id}&courseId=${courseId}`;

    }

    catch (error) {

        console.error(error);


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to create quiz.",
                "error"
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Create Quiz";

    }

}



/**
 * Quiz form
 */
document
    .getElementById(
        "quizForm"
    )
    .addEventListener(
        "submit",
        createQuiz
    );


if (courseId) {
    loadLessons();
}