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


if (!lessonId) {

    alert(
        "No lesson selected."
    );

    window.location.href =
        "../dashboard/student-dashboard.html";
}



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
                headers: authHeaders()
            }
        );


        const lesson =
            await handleApiResponse(
                response
            );


        document.getElementById(
            "lessonTitle"
        ).textContent =
            lesson.title;


        document.getElementById(
            "lessonContent"
        ).textContent =
            lesson.content;


        // Only load these after
        // lesson access has succeeded
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


        alert(
            error.message ||
            "Unable to load lesson."
        );


        if (
            error.status === 403 ||
            error.status === 404
        ) {

            window.location.href =
                "../dashboard/student-dashboard.html";

        }

    }

}



/**
 * Load quiz button if a quiz exists
 * for the lesson
 */
async function loadQuizButton() {

    const quizBtn =
        document.getElementById(
            "quizBtn"
        );


    // Hide until a valid quiz is found
    quizBtn.style.display =
        "none";


    try {

        const response = await fetch(
            apiUrl(
                `/quizzes/lesson/${lessonId}`
            ),
            {
                headers: authHeaders()
            }
        );


        const quizzes =
            await handleApiResponse(
                response
            );


        if (quizzes.length === 0) {
            return;
        }


        const quiz =
            quizzes[0];


        const quizId =
            quiz.id;


        const quizTitle =
            quiz.title;


        quizBtn.style.display =
            "block";


        quizBtn.textContent =
            `Take Quiz: ${quizTitle}`;


        quizBtn.onclick = () => {

            window.location.href =
                `../quizzes/quiz.html?quizId=${quizId}&title=${encodeURIComponent(quizTitle)}`;

        };

    }

    catch (error) {

        console.error(
            "Quiz loading error:",
            error
        );


        quizBtn.style.display =
            "none";

    }

}



/**
 * Check lesson completion and quiz status
 */
async function checkCompletion() {

    try {

        const response = await fetch(
            apiUrl(
                `/progress/lesson/${lessonId}`
            ),
            {
                headers: authHeaders()
            }
        );


        const data =
            await handleApiResponse(
                response
            );


        const button =
            document.getElementById(
                "completeBtn"
            );


        // Lesson already completed
        if (data.completed) {

            button.textContent =
                "✅ Lesson Completed";

            button.disabled = true;

            return;
        }


        // Lesson has no quiz yet
        if (!data.quizExists) {

            button.textContent =
                "Quiz Required";

            button.disabled = true;

            return;
        }


        // Quiz exists but student has not passed
        if (!data.quizPassed) {

            button.textContent =
                "Pass Quiz to Complete Lesson";

            button.disabled = true;

            return;
        }


        // Quiz passed — lesson can now be completed
        button.textContent =
            "Mark Lesson Complete";

        button.disabled = false;

    }

    catch (error) {

        console.error(
            "Completion check error:",
            error
        );

    }

}


/**
 * Mark lesson as completed
 */
async function completeLesson() {

    const button =
        document.getElementById(
            "completeBtn"
        );


    button.disabled =
        true;

    button.textContent =
        "Marking Complete...";


    try {

        const response = await fetch(
            apiUrl(
                `/progress/lesson/${lessonId}/complete`
            ),
            {
                method: "POST",

                headers: authHeaders()
            }
        );


        await handleApiResponse(
            response
        );


        button.textContent =
            "✅ Lesson Completed";

        button.disabled =
            true;

    }

    catch (error) {

        console.error(error);


        if (
            error.message !==
            "Authentication required"
        ) {

            alert(
                error.message ||
                "Unable to complete lesson."
            );


            button.disabled =
                false;

            button.textContent =
                "Mark Complete";

        }

    }

}



/**
 * Mark lesson complete button
 */
document
    .getElementById("completeBtn")
    .addEventListener(
        "click",
        completeLesson
    );



/**
 * Load lesson page
 */
loadLesson();