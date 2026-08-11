const token = getToken();

if (!token) {

    window.location.href =
        "../auth/login.html";

}


// Get lesson ID from URL
const params =
    new URLSearchParams(
        window.location.search
    );

const lessonId =
    params.get("lessonId");


// Validate lesson ID
if (!lessonId) {

    setFlashToast(
        "No lesson selected.",
        "warning"
    );

    window.location.href =
        "../dashboard/student-dashboard.html";

}


// Main action buttons
const quizBtn =
    document.getElementById(
        "quizBtn"
    );

const completeBtn =
    document.getElementById(
        "completeBtn"
    );


// Do not allow completion until
// the backend confirms eligibility
completeBtn.disabled = true;

completeBtn.textContent =
    "Checking Progress...";


/**
 * Load lesson details
 */
async function loadLesson() {

    try {

        const response = await fetch(
            apiUrl(
                `/lessons/${lessonId}`
            ),
            {
                headers:
                    authHeaders()
            }
        );


        const lesson =
            await handleApiResponse(
                response
            );


        // Back to the correct course
        document.getElementById(
            "backToCourse"
        ).href =
            `../courses/course-details.html?courseId=${lesson.course_id}`;


        document.getElementById(
            "lessonTitle"
        ).textContent =
            lesson.title;


        document.getElementById(
            "lessonContent"
        ).textContent =
            lesson.content;


        // Only check these after
        // lesson access succeeds
        await loadQuizButton();

        await checkCompletion();

    }

    catch (error) {

        console.error(error);


        if (
            error.message ===
            "Authentication required"
        ) {
            return;
        }


        // Access denied or lesson missing
        if (
            error.status === 403 ||
            error.status === 404
        ) {

            setFlashToast(
                error.message ||
                "Unable to access this lesson.",
                "error"
            );


            window.location.href =
                "../dashboard/student-dashboard.html";

            return;

        }


        showToast(
            error.message ||
            "Unable to load lesson.",
            "error"
        );


        completeBtn.disabled = true;

        completeBtn.textContent =
            "Lesson Unavailable";

    }

}



/**
 * Load quiz button if a quiz exists
 * for the lesson
 */
async function loadQuizButton() {

    // Hide until valid quiz is found
    quizBtn.style.display =
        "none";


    try {

        const response = await fetch(
            apiUrl(
                `/quizzes/lesson/${lessonId}`
            ),
            {
                headers:
                    authHeaders()
            }
        );


        const quizzes =
            await handleApiResponse(
                response
            );


        if (
            quizzes.length === 0
        ) {
            return;
        }


        const quiz =
            quizzes[0];


        const quizId =
            quiz.id;


        const quizTitle =
            quiz.title;


        quizBtn.style.display =
            "inline-flex";


        quizBtn.textContent =
            `Take Quiz: ${quizTitle}`;


        quizBtn.onclick = () => {

            window.location.href =
                `../quizzes/quiz.html?quizId=${quizId}&lessonId=${lessonId}&title=${encodeURIComponent(quizTitle)}`;

        };

    }

    catch (error) {

        console.error(
            "Quiz loading error:",
            error
        );


        quizBtn.style.display =
            "none";


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to load lesson quiz.",
                "error"
            );

        }

    }

}



/**
 * Check lesson completion
 * and quiz status
 */
async function checkCompletion() {

    try {

        const response = await fetch(
            apiUrl(
                `/progress/lesson/${lessonId}`
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


        // Lesson already completed
        if (data.completed) {

            completeBtn.textContent =
                "✓ Lesson Completed";

            completeBtn.disabled =
                true;

            return;

        }


        // Lesson has no quiz
        if (!data.quizExists) {

            completeBtn.textContent =
                "Quiz Required";

            completeBtn.disabled =
                true;

            return;

        }


        // Quiz exists but has not been passed
        if (!data.quizPassed) {

            completeBtn.textContent =
                "Pass Quiz to Complete Lesson";

            completeBtn.disabled =
                true;

            return;

        }


        // Quiz passed
        completeBtn.textContent =
            "Mark Lesson Complete";

        completeBtn.disabled =
            false;

    }

    catch (error) {

        console.error(
            "Completion check error:",
            error
        );


        completeBtn.disabled =
            true;

        completeBtn.textContent =
            "Unable to Verify Progress";


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to check lesson progress.",
                "error"
            );

        }

    }

}



/**
 * Mark lesson as completed
 */
async function completeLesson() {

    completeBtn.disabled =
        true;

    completeBtn.textContent =
        "Marking Complete...";


    try {

        const response = await fetch(
            apiUrl(
                `/progress/lesson/${lessonId}/complete`
            ),
            {
                method: "POST",

                headers:
                    authHeaders()
            }
        );


        await handleApiResponse(
            response
        );


        completeBtn.textContent =
            "✓ Lesson Completed";

        completeBtn.disabled =
            true;


        showToast(
            "Lesson completed successfully!",
            "success"
        );

    }

    catch (error) {

        console.error(error);


        if (
            error.message ===
            "Authentication required"
        ) {
            return;
        }


        showToast(
            error.message ||
            "Unable to complete lesson.",
            "error"
        );


        // Recheck eligibility instead of
        // blindly enabling the button
        await checkCompletion();

    }

}



/**
 * Complete lesson button
 */
completeBtn.addEventListener(
    "click",
    completeLesson
);


/**
 * Load lesson page
 */
if (lessonId) {

    loadLesson();

}