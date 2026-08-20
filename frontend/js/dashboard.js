/**
 * STUDENT DASHBOARD
 *
 * Responsibilities:
 * 1. Check authentication
 * 2. Load logged-in user
 * 3. Display dashboard statistics
 * 4. Display course progress
 * 5. Display quiz history
 * 6. Handle logout
 */


// Check authentication
const token = getToken();

if (!token) {
    window.location.href =
        "../auth/login.html";
}


// Retrieve stored user
const user =
    JSON.parse(
        localStorage.getItem("user")
    );


// Ensure student access
if (
    user &&
    user.role !== "student"
) {

    window.location.href =
        "../dashboard/instructor-dashboard.html";

}


// Display student name
if (user) {

    document.getElementById(
        "studentName"
    ).textContent =
        user.name;

}



/**
 * Load dashboard information
 */
async function loadStudentDashboard() {

    try {

        const response = await fetch(
            apiUrl(
                API.endpoints.studentDashboard
            ),
            {
                headers: authHeaders()
            }
        );


        const data =
            await handleApiResponse(
                response
            );


        // ----------------------------
        // DASHBOARD STATISTICS
        // ----------------------------

        document.getElementById(
            "courseCount"
        ).textContent =
            data.courseCount || 0;


        document.getElementById(
            "lessonCount"
        ).textContent =
            data.completedLessons || 0;


        document.getElementById(
            "quizCount"
        ).textContent =
            data.quizAttemptCount || 0;


        // ----------------------------
        // QUIZ HISTORY
        // ----------------------------

        displayQuizHistory(
            data.recentAttempts || []
        );


        // ----------------------------
        // COURSE PROGRESS
        // ----------------------------

        displayCourses(
            data.courses || []
        );

    }

    catch (error) {

        console.error(error);

        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Failed to load dashboard.",
                "error"
            );

        }
    }

}



/**
 * Display enrolled courses
 * and their progress
 */
function displayCourses(courses) {

    const courseList =
        document.getElementById(
            "courseList"
        );


    courseList.textContent = "";


    if (
        courses.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "You are not enrolled in any courses yet.";

        courseList.appendChild(
            message
        );

        return;

    }


    courses.forEach(
        course => {

            const totalLessons =
                Number(
                    course.total_lessons
                ) || 0;


            const completedLessons =
                Number(
                    course.completed_lessons
                ) || 0;


            const progress =
                totalLessons === 0
                    ? 0
                    : Math.round(
                        (
                            completedLessons /
                            totalLessons
                        ) * 100
                    );


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "course-card";


            const image =
                document.createElement(
                    "div"
                );

            image.className =
                "course-image";


            if (course.image_url) {

                const thumbnail =
                    document.createElement(
                        "img"
                    );

                thumbnail.src =
                    course.image_url;

                thumbnail.alt =
                    `${course.title} thumbnail`;

                thumbnail.loading =
                    "lazy";

                image.appendChild(
                    thumbnail
                );

            }

            else {

                image.textContent =
                    "📚";

            }


            const body =
                document.createElement(
                    "div"
                );

            body.className =
                "course-body";


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                course.title;


            const description =
                document.createElement(
                    "p"
                );

            description.textContent =
                course.description ||
                "No description available.";


            const progressContainer =
                document.createElement(
                    "div"
                );

            progressContainer.className =
                "course-progress";


            const progressBar =
                document.createElement(
                    "div"
                );

            progressBar.className =
                "progress-bar";


            const progressFill =
                document.createElement(
                    "div"
                );

            progressFill.className =
                "progress";

            progressFill.style.width =
                `${progress}%`;


            const progressText =
                document.createElement(
                    "small"
                );

            progressText.textContent =
                `${completedLessons}/${totalLessons} lessons completed (${progress}%)`;


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "btn btn-primary continue-btn";

            button.textContent =
                "Continue Learning";


            button.addEventListener(
                "click",
                () => {

                    openCourse(
                        course.id
                    );

                }
            );


            progressBar.appendChild(
                progressFill
            );

            progressContainer.appendChild(
                progressBar
            );

            progressContainer.appendChild(
                progressText
            );


            body.appendChild(
                title
            );

            body.appendChild(
                description
            );

            body.appendChild(
                progressContainer
            );

            body.appendChild(
                button
            );


            card.appendChild(
                image
            );

            card.appendChild(
                body
            );


            courseList.appendChild(
                card
            );

        }
    );

}


/**
 * Open course details page
 */
function openCourse(courseId) {

    window.location.href =
        `../courses/course-details.html?courseId=${courseId}`;

}



/**
 * Display recent quiz attempts
 */
function displayQuizHistory(attempts) {

    const container =
        document.getElementById(
            "quizHistory"
        );


    container.textContent = "";


    if (
        attempts.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "No quiz attempts yet.";

        container.appendChild(
            message
        );

        return;

    }


    attempts.forEach(
        attempt => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "quiz-card";


            const score =
                Number(
                    attempt.score
                ) || 0;


            const totalQuestions =
                Number(
                    attempt.total_questions
                ) || 0;


            const percentage =
                totalQuestions === 0
                    ? 0
                    : Math.round(
                        (
                            score /
                            totalQuestions
                        ) * 100
                    );


            const statusText =
                attempt.passed
                    ? "Passed ✅"
                    : "Failed ❌";


            const date =
                new Date(
                    attempt.submitted_at
                ).toLocaleDateString();


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                attempt.quiz_title;


            const scoreText =
                document.createElement(
                    "p"
                );

            scoreText.textContent =
                `Score: ${score}/${totalQuestions}`;


            const percentageText =
                document.createElement(
                    "p"
                );

            percentageText.textContent =
                `Percentage: ${percentage}%`;


            const status =
                document.createElement(
                    "p"
                );

            status.textContent =
                `Status: ${statusText}`;


            const dateText =
                document.createElement(
                    "small"
                );

            dateText.textContent =
                date;


            card.appendChild(
                title
            );

            card.appendChild(
                scoreText
            );

            card.appendChild(
                percentageText
            );

            card.appendChild(
                status
            );

            card.appendChild(
                dateText
            );


            container.appendChild(
                card
            );

        }
    );

}



/**
 * Logout
 */
const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


logoutBtn.addEventListener(
    "click",
    logout
);



/**
 * Load dashboard
 */
loadStudentDashboard();