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

const token = localStorage.getItem("token");


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
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }

        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(data.error || "Unable to load dashboard");

        }

        // Update statistics

        document.getElementById("courseCount").textContent =
            data.courseCount;

        document.getElementById("lessonCount").textContent =
            data.completedLessons;

        document.getElementById("quizCount").textContent =
            data.quizAttemptCount;

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

            const card = document.createElement("div");

            card.className = "card";

            card.innerHTML = `
                <h3>${course.title}</h3>

                <p>${course.description}</p>

                <button
                class="continue-btn"
                onclick="openCourse(${course.id})">

                Continue Learning

                </button>
            `;

            courseList.appendChild(card);

        });

    }


    catch (error) {

        console.error(error);

        alert("Failed to load dashboard.");

    }

}


// Open course details page
    function openCourse(courseId){

    window.location.href =
    `../courses/course-details.html?courseId=${courseId}`;

    }

// Logout functionality

const logoutBtn =
document.getElementById("logoutBtn");



logoutBtn.addEventListener(
"click",
()=>{


    /*
    Remove authentication data
    */

    localStorage.removeItem("token");

    localStorage.removeItem("user");



    /*
    Return user to login
    */

    window.location.href =
    "../auth/login.html";


});



loadStudentDashboard();