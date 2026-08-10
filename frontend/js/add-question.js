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

const quizId =
    params.get("quizId");

const courseId =
    params.get("courseId");


// Validate quiz ID
if (!quizId) {

    alert(
        "No quiz selected."
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


// Question counter
let questionCount = 0;


/**
 * Update displayed question count
 */
function updateQuestionCount() {

    document.getElementById(
        "questionCount"
    ).textContent =
        `Questions Added: ${questionCount}`;

}


/**
 * Load number of questions
 * already saved for this quiz
 */
async function loadQuestionCount() {

    try {

        const response = await fetch(
            apiUrl(
                `/quizzes/${quizId}/questions`
            ),
            {
                headers: authHeaders()
            }
        );


        const data =
            await handleApiResponse(
                response
            );


        questionCount =
            data.length;


        updateQuestionCount();

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
            "Unable to load quiz questions."
        );


        // Instructor does not own quiz
        // or quiz does not exist
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
 * Add question to quiz
 */
async function addQuestion(e) {

    e.preventDefault();


    const button =
        document.getElementById(
            "addQuestionBtn"
        );


    const question =
        document.getElementById(
            "question"
        ).value.trim();


    const option_a =
        document.getElementById(
            "option_a"
        ).value.trim();


    const option_b =
        document.getElementById(
            "option_b"
        ).value.trim();


    const option_c =
        document.getElementById(
            "option_c"
        ).value.trim();


    const option_d =
        document.getElementById(
            "option_d"
        ).value.trim();


    const correct_answer =
        document.getElementById(
            "correct_answer"
        ).value.trim();


    // Validate fields before disabling button
    if (
        !question ||
        !option_a ||
        !option_b ||
        !option_c ||
        !option_d ||
        !correct_answer
    ) {

        alert(
            "All fields are required."
        );

        return;
    }


    // Extra validation
    if (
        !["A", "B", "C", "D"]
            .includes(correct_answer)
    ) {

        alert(
            "Please select a valid correct answer."
        );

        return;
    }


    button.disabled =
        true;

    button.textContent =
        "Adding...";


    try {

        const response = await fetch(
            apiUrl(
                `/quizzes/${quizId}/questions`
            ),
            {
                method: "POST",

                headers: authHeaders(),

                body: JSON.stringify({
                    question,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer
                })
            }
        );


        await handleApiResponse(
            response
        );


        alert(
            "Question added successfully!"
        );


        // Update question counter
        questionCount++;

        updateQuestionCount();


        // Clear form
        document
            .getElementById(
                "questionForm"
            )
            .reset();

    }

    catch (error) {

        console.error(error);


        if (
            error.message !==
            "Authentication required"
        ) {

            alert(
                error.message ||
                "Unable to add question."
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Add Question";

    }

}


/**
 * Finish quiz
 */
function finishQuiz(e) {

    e.preventDefault();


    const question =
        document.getElementById(
            "question"
        ).value.trim();

    const option_a =
        document.getElementById(
            "option_a"
        ).value.trim();

    const option_b =
        document.getElementById(
            "option_b"
        ).value.trim();

    const option_c =
        document.getElementById(
            "option_c"
        ).value.trim();

    const option_d =
        document.getElementById(
            "option_d"
        ).value.trim();


    // Check for unsaved question data
    const hasUnsavedQuestion =
        question ||
        option_a ||
        option_b ||
        option_c ||
        option_d;


    if (hasUnsavedQuestion) {

        alert(
            "You have an unsaved question. Click 'Add Question' before finishing the quiz."
        );

        return;
    }


    // Do not allow completely empty quiz
    if (questionCount === 0) {

        alert(
            "Add at least one question before finishing the quiz."
        );

        return;
    }


    window.location.href =
        `manage-course.html?courseId=${courseId}`;

}


/**
 * Event listeners
 */
document
    .getElementById("questionForm")
    .addEventListener(
        "submit",
        addQuestion
    );


document
    .getElementById("finishQuizBtn")
    .addEventListener(
        "click",
        finishQuiz
    );


/**
 * Load current question count
 */
loadQuestionCount();