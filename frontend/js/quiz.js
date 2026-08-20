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

    setFlashToast(
        "No quiz selected.",
        "warning"
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


// Back link
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
                headers:
                    authHeaders()
            }
        );


        const data =
            await handleApiResponse(
                response
            );


        questions =
            data;


        // No questions available
        if (
            questions.length === 0
        ) {

            const container =
                document.getElementById(
                    "quizContainer"
                );

            container.textContent = "";


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card";


            const message =
                document.createElement(
                    "p"
                );

            message.textContent =
                "No questions are available for this quiz.";


            card.appendChild(
                message
            );

            container.appendChild(
                card
            );


            submitQuizBtn.style.display =
                "none";

            return;

        }


        displayQuestions();


        // Show submit button only
        // after questions load
        submitQuizBtn.style.display =
            "inline-flex";

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


        const container =
            document.getElementById(
                "quizContainer"
            );

        container.textContent = "";


        const card =
            document.createElement(
                "div"
            );

        card.className =
            "card";


        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            error.message ||
            "Unable to load quiz.";


        card.appendChild(
            message
        );

        container.appendChild(
            card
        );


        showToast(
            error.message ||
            "Unable to load quiz.",
            "error"
        );

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


    container.textContent = "";


    questions.forEach(
        (question, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card";


            // Question text
            const heading =
                document.createElement(
                    "h3"
                );

            heading.textContent =
                `${index + 1}. ${question.question}`;


            const options = [
                {
                    value: "A",
                    text: question.option_a
                },
                {
                    value: "B",
                    text: question.option_b
                },
                {
                    value: "C",
                    text: question.option_c
                },
                {
                    value: "D",
                    text: question.option_d
                }
            ];


            card.appendChild(
                heading
            );


            options.forEach(
                option => {

                    const label =
                        document.createElement(
                            "label"
                        );


                    const input =
                        document.createElement(
                            "input"
                        );

                    input.type =
                        "radio";

                    input.name =
                        `question${question.id}`;

                    input.value =
                        option.value;


                    const optionText =
                        document.createTextNode(
                            ` ${option.text}`
                        );


                    label.appendChild(
                        input
                    );

                    label.appendChild(
                        optionText
                    );


                    card.appendChild(
                        label
                    );

                }
            );


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
        questions.map(
            question => {

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

            }
        );


    // Check for unanswered questions
    const unanswered =
        answers.some(
            answer =>
                answer.answer === null
        );


    if (unanswered) {

        showToast(
            "Please answer all questions before submitting the quiz.",
            "warning"
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

                headers:
                    authHeaders(),

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


        displayResult(
            data
        );


        // Submission completed
        submitQuizBtn.textContent =
            "Quiz Submitted";

        submitQuizBtn.disabled =
            true;


        // Result notification
        if (data.passed) {

            showToast(
                "Quiz completed successfully. You passed!",
                "success"
            );

        }

        else {

            showToast(
                "Quiz submitted. You need 70% or higher to pass.",
                "warning"
            );

        }

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
            "Unable to submit quiz.",
            "error"
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


    result.textContent = "";


    const card =
        document.createElement(
            "div"
        );

    card.className =
        "card";


    const heading =
        document.createElement(
            "h2"
        );

    heading.textContent =
        data.passed
            ? "Quiz Completed ✅"
            : "Quiz Completed";


    const score =
        document.createElement(
            "p"
        );

    score.textContent =
        `Score: ${data.score}/${data.totalQuestions}`;


    const percentage =
        document.createElement(
            "p"
        );

    percentage.textContent =
        `Percentage: ${data.percentage}%`;


    const status =
        document.createElement(
            "h3"
        );

    status.textContent =
        data.passed
            ? "Status: Passed"
            : "Status: Failed";


    const message =
        document.createElement(
            "p"
        );


    if (
        data.passed
    ) {

        message.textContent =
            "You can now return to the lesson and mark it as completed.";

    }

    else {

        message.textContent =
            "You need 70% or higher to pass this quiz.";

    }


    card.appendChild(
        heading
    );

    card.appendChild(
        score
    );

    card.appendChild(
        percentage
    );

    card.appendChild(
        status
    );

    card.appendChild(
        message
    );


    if (
        !data.passed
    ) {

        const requirement =
            document.createElement(
                "p"
            );

        requirement.textContent =
            "You must pass the quiz before completing the lesson.";

        card.appendChild(
            requirement
        );

    }


    result.appendChild(
        card
    );

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
if (quizId) {

    loadQuiz();

}