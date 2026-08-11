const token = getToken();

if (!token) {
    window.location.href =
        "../auth/login.html";
}


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


if (user) {

    document.getElementById(
        "instructorName"
    ).textContent = user.name;

}


/**
 * Load instructor dashboard
 */
async function loadInstructorDashboard() {

    try {

        const response = await fetch(
            apiUrl(
                API.endpoints.instructorDashboard
            ),
            {
                headers: authHeaders()
            }
        );


        const data =
            await handleApiResponse(response);


        displayDashboard(data);

    }

    catch (error) {

        console.error(error);

        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to load instructor dashboard.",
                "error"
            );

        }
    }

}


/**
 * Display dashboard data
 */
function displayDashboard(data) {

    const courses =
        data.courses || [];

    const courseStats =
        data.courseStats || [];


    document.getElementById(
        "courseCount"
    ).textContent =
        courses.length;


    const totalStudents =
        courseStats.reduce(
            (total, course) =>
                total + Number(course.students),
            0
        );


    document.getElementById(
        "studentCount"
    ).textContent =
        totalStudents;


    const courseList =
        document.getElementById(
            "courseList"
        );


    courseList.innerHTML = "";


    if (courseStats.length === 0) {

        courseList.innerHTML =
            "<p>No courses created yet.</p>";

        return;

    }


    courseStats.forEach(course => {

        const card =
            document.createElement("div");

        card.className = "card";


        card.innerHTML = `

            <h3>
                ${course.title}
            </h3>

            <p>
                Students Enrolled:
                ${course.students}
            </p>

            <button
                type="button"
                class="btn btn-primary"
                onclick="manageCourse(${course.id})"
            >
                Manage Course
            </button>

        `;


        courseList.appendChild(card);

    });

}


/**
 * Navigate to manage course page
 */
function manageCourse(courseId) {

    window.location.href =
        `../courses/manage-course.html?courseId=${courseId}`;

}


/**
 * Logout
 */
document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        logout
    );


loadInstructorDashboard();