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


if (!courseId) {

    alert(
        "No course selected."
    );

    window.location.href =
        "../dashboard/instructor-dashboard.html";
}


document.getElementById(
    "backToCourse").href =
    `manage-course.html?courseId=${courseId}`;
/**
 * Load lessons belonging to the course
 */
async function loadLessons() {

    const select =
        document.getElementById(
            "lessonSelect"
        );


    try {

        const response = await fetch(
            apiUrl(
                `/lessons/course/${courseId}`
            ),
            {
                headers: authHeaders()
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


        alert(
            error.message ||
            "Unable to load lessons."
        );


        // Instructor does not own the course
        if (
            error.status === 403 ||
            error.status === 404
        ) {

            window.location.href =
                "../dashboard/instructor-dashboard.html";

        }

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

        alert(
            "Please select a lesson."
        );

        return;
    }


    // Validate title
    if (!title) {

        alert(
            "Quiz title is required."
        );

        return;
    }


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    // Disable only after validation passes
    button.disabled = true;

    button.textContent =
        "Creating...";


    try {

        const response = await fetch(
            apiUrl(
                `/quizzes/lesson/${lessonId}`
            ),
            {
                method: "POST",

                headers: authHeaders(),

                body: JSON.stringify({
                    title
                })
            }
        );


        const data =
            await handleApiResponse(
                response
            );


        alert(
            "Quiz created successfully!"
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

            alert(
                error.message ||
                "Unable to create quiz."
            );

        }

    }

    finally {

        button.disabled = false;

        button.textContent =
            "Create Quiz";

    }

}



/**
 * Quiz form
 */
document
    .getElementById("quizForm")
    .addEventListener(
        "submit",
        createQuiz
    );


loadLessons();