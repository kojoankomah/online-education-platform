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

            alert(
                error.message ||
                "Failed to load dashboard."
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


    courseList.innerHTML = "";


    if (courses.length === 0) {

        courseList.innerHTML =
            "<p>You are not enrolled in any courses yet.</p>";

        return;

    }


    courses.forEach(course => {

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


        card.innerHTML = `

            <div class="course-image">
                📚
            </div>


            <div class="course-body">

                <h3>
                    ${course.title}
                </h3>


                <p>
                    ${
                        course.description ||
                        "No description available."
                    }
                </p>


                <div class="course-progress">

                    <div class="progress-bar">

                        <div
                            class="progress"
                            style="width: ${progress}%">
                        </div>

                    </div>


                    <small>
                        ${completedLessons}/${totalLessons}
                        lessons completed
                        (${progress}%)
                    </small>

                </div>


                <button
                    class="continue-btn"
                    onclick="openCourse(${course.id})">

                    Continue Learning

                </button>

            </div>

        `;


        courseList.appendChild(
            card
        );

    });

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


    container.innerHTML = "";


    if (attempts.length === 0) {

        container.innerHTML =
            "<p>No quiz attempts yet.</p>";

        return;

    }


    attempts.forEach(attempt => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "quiz-card";


        const score =
            Number(attempt.score) || 0;


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


        const status =
            attempt.passed
                ? "Passed ✅"
                : "Failed ❌";


        const date =
            new Date(
                attempt.submitted_at
            ).toLocaleDateString();


        card.innerHTML = `

            <h3>
                ${attempt.quiz_title}
            </h3>

            <p>
                Score:
                ${score}/${totalQuestions}
            </p>

            <p>
                Percentage:
                ${percentage}%
            </p>

            <p>
                Status:
                <strong>
                    ${status}
                </strong>
            </p>

            <small>
                ${date}
            </small>

        `;


        container.appendChild(
            card
        );

    });

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