/**
 * STUDENT DASHBOARD
 *
 * Responsibilities:
 *
 * 1. Check authentication
 * 2. Load logged-in user
 * 3. Display user information
 * 4. Handle logout
 *
 */


// Get stored JWT token
// If no token exists, redirect to login page
const token = getToken();

// If no token exists,
// user is not authenticated

if(!token){

    window.location.href =
    "../auth/login.html";

}



// Retrieve saved user data

const user =
JSON.parse(
    localStorage.getItem("user")
);



if(user){


    document.getElementById(
        "studentName"
    ).textContent =
    user.name;


}


/**
 * Load student dashboard data
 */
async function loadStudentDashboard() {

    try {

        const response = await fetch(
            apiUrl("/dashboard/student"),
            {
                headers: authHeaders()
            }
        );

        const data =
            await handleApiResponse(response);

        // Update statistics

        document.getElementById("courseCount").textContent =
            data.courseCount;

        document.getElementById("lessonCount").textContent =
            data.completedLessons;

        document.getElementById("quizCount").textContent =
            data.quizAttemptCount;

        displayQuizHistory(
        data.recentAttempts || []
        );
        // Display courses
        const courseList =
            document.getElementById("courseList");

        courseList.innerHTML = "";

        if (data.courses.length === 0) {

            courseList.innerHTML =
                "<p>You are not enrolled in any courses yet.</p>";

            return;

        }

        data.courses.forEach(course => {

            const progress =
            course.total_lessons == 0
            ?
            0
            :
            Math.round(
            (course.completed_lessons /
            course.total_lessons) * 100
            );


            const card = document.createElement("div");

            card.className = "course-card";
            card.innerHTML = `

            <div class="course-image">

                📚

            </div>


            <div class="course-body">


            <h3>
            ${course.title}
            </h3>


            <p>
            ${course.description}
            </p>



            <div class="course-progress">

                <div class="progress-bar">

                    <div
                    class="progress"
                    style="width:${progress}%">
                    </div>

                </div>

                <small>
                ${course.completed_lessons}/${course.total_lessons}
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

            courseList.appendChild(card);

        });

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


// Open course details page
    function openCourse(courseId){

    window.location.href =
    `../courses/course-details.html?courseId=${courseId}`;

    }



 // Display quiz history   
function displayQuizHistory(attempts){

    const container =
    document.getElementById(
        "quizHistory"
    );

    container.innerHTML = "";

    if(attempts.length === 0){

        container.innerHTML =
        "<p>No quiz attempts yet.</p>";

        return;

    }

    attempts.forEach(attempt=>{

        const card =
        document.createElement("div");

        card.className =
        "quiz-card";

        const percentage =
        attempt.total_questions === 0
        ?
        0
        :
        Math.round(
            (attempt.score /
            attempt.total_questions) * 100
        );

        const status =
        attempt.passed
        ?
        "Passed ✅"
        :
        "Failed ❌";

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
                ${attempt.score}/${attempt.total_questions}
            </p>

            <p>
                Percentage:
                ${percentage}%
            </p>

            <p>
                Status:
                <strong>${status}</strong>
            </p>

            <small>
                ${date}
            </small>

        `;

        container.appendChild(card);

    });

}


// Logout functionality

const logoutBtn =
document.getElementById("logoutBtn");



logoutBtn.addEventListener(
"click",
()=>{


    logoutBtn.addEventListener(
        "click",
        logout
    );


});



loadStudentDashboard();