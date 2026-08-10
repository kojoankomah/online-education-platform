const token = getToken();

if (!token) {
    window.location.href =
        "../auth/login.html";
}


// Get quiz information from URL
const params =
    new URLSearchParams(
        window.location.search
    );

const quizId =
    params.get("quizId");

const quizTitle =
    params.get("title");


const lessonId =
    params.get("lessonId");

// Validate quiz ID
if (!quizId) {

    alert(
        "No quiz selected."
    );

    window.location.href =
        "../dashboard/student-dashboard.html";
}


// Display quiz title
document.getElementById(
    "quizTitle"
).textContent =
    quizTitle || "Quiz";


// Submit button
const submitQuizBtn =
    document.getElementById(
        "submitQuizBtn"
    );


const backToLesson =
    document.getElementById(
        "backToLesson"
    );


if (lessonId) {

    backToLesson.href =
        `../lessons/lesson.html?lessonId=${lessonId}`;

}

else {

    backToLesson.href =
        "../dashboard/student-dashboard.html";

    backToLesson.textContent =
        "Back to Dashboard";

}


// Hide submit button until
// questions load successfully
submitQuizBtn.style.display =
    "none";


let questions = [];



/**
 * Load quiz questions
 */
async function loadQuiz() {

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


        questions = data;


        // No questions available
        if (questions.length === 0) {

            document.getElementById(
                "quizContainer"
            ).innerHTML = `

                <div class="card">

                    <p>
                        No questions are available
                        for this quiz.
                    </p>

                </div>

            `;


            submitQuizBtn.style.display =
                "none";

            return;
        }


        displayQuestions();


        // Show submit button only
        // when questions are available
        submitQuizBtn.style.display =
            "inline-block";

    }

    catch (error) {

        console.error(error);


        submitQuizBtn.style.display =
            "none";


        if (
            error.message ===
            "Authentication required"
        ) {
            return;
        }


        document.getElementById(
            "quizContainer"
        ).innerHTML = `

            <div class="card">

                <p>
                    ${
                        error.message ||
                        "Unable to load quiz."
                    }
                </p>

            </div>

        `;

    }

}



/**
 * Display quiz questions
 */
function displayQuestions() {

    const container =
        document.getElementById(
            "quizContainer"
        );


    container.innerHTML = "";


    questions.forEach(
        (question, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.innerHTML = `

                <h3>
                    ${index + 1}.
                    ${question.question}
                </h3>


                <label>

                    <input
                        type="radio"
                        name="question${question.id}"
                        value="A">

                    ${question.option_a}

                </label>

                <br>


                <label>

                    <input
                        type="radio"
                        name="question${question.id}"
                        value="B">

                    ${question.option_b}

                </label>

                <br>


                <label>

                    <input
                        type="radio"
                        name="question${question.id}"
                        value="C">

                    ${question.option_c}

                </label>

                <br>


                <label>

                    <input
                        type="radio"
                        name="question${question.id}"
                        value="D">

                    ${question.option_d}

                </label>

            `;


            container.appendChild(
                card
            );

        }
    );

}



/**
 * Submit quiz
 */
async function submitQuiz() {

    // Collect answers
    const answers =
        questions.map(question => {

            const selected =
                document.querySelector(
                    `input[name="question${question.id}"]:checked`
                );


            return {

                questionId:
                    question.id,

                answer:
                    selected
                        ? selected.value
                        : null

            };

        });


    // Check for unanswered questions
    const unanswered =
        answers.some(
            answer =>
                answer.answer === null
        );


    if (unanswered) {

        alert(
            "Please answer all questions before submitting the quiz."
        );

        return;
    }


    // Prevent repeated clicks
    submitQuizBtn.disabled =
        true;

    submitQuizBtn.textContent =
        "Submitting...";


    try {

        const response = await fetch(
            apiUrl(
                `/quizzes/${quizId}/submit`
            ),
            {
                method: "POST",

                headers: authHeaders(),

                body:
                    JSON.stringify({
                        answers
                    })
            }
        );


        const data =
            await handleApiResponse(
                response
            );


        displayResult(data);


        // Submission completed successfully
        submitQuizBtn.textContent =
            "Quiz Submitted";

        submitQuizBtn.disabled =
            true;

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
            "Unable to submit quiz."
        );


        // Allow retry when request fails
        submitQuizBtn.disabled =
            false;

        submitQuizBtn.textContent =
            "Submit Quiz";

    }

}



/**
 * Display quiz result
 */
function displayResult(data) {

    const result =
        document.getElementById(
            "result"
        );


    if (data.passed) {

        result.innerHTML = `

            <div class="card">

                <h2>
                    Quiz Completed ✅
                </h2>

                <p>
                    Score:
                    ${data.score}/${data.totalQuestions}
                </p>

                <p>
                    Percentage:
                    ${data.percentage}%
                </p>

                <h3>
                    Status: Passed
                </h3>

                <p>
                    You can now return to the lesson
                    and mark it as completed.
                </p>

            </div>

        `;

    }

    else {

        result.innerHTML = `

            <div class="card">

                <h2>
                    Quiz Completed
                </h2>

                <p>
                    Score:
                    ${data.score}/${data.totalQuestions}
                </p>

                <p>
                    Percentage:
                    ${data.percentage}%
                </p>

                <h3>
                    Status: Failed
                </h3>

                <p>
                    You need 70% or higher
                    to pass this quiz.
                </p>

                <p>
                    You must pass the quiz before
                    completing the lesson.
                </p>

            </div>

        `;

    }

}



/**
 * Submit button
 */
submitQuizBtn.addEventListener(
    "click",
    submitQuiz
);


/**
 * Load quiz page
 */
loadQuiz();