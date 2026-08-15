const token = getToken();

if (!token) {
    window.location.href =
        "../auth/login.html";
}


// Ensure this page is being used by a student
const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (
    user &&
    user.role !== "student"
) {
    window.location.href =
        "../dashboard/instructor-dashboard.html";
}


/**
 * Load all available courses
 */
async function loadCourses() {

    try {

        const response = await fetch(
            apiUrl("/courses")
        );


        const courses =
            await handleApiResponse(response);


        displayCourses(courses);

    }

    catch (error) {

        console.error(error);


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to load courses.",
                "error"
            );

        }

    }

}


/**
 * Display courses
 */
function displayCourses(courses) {

    const courseList =
        document.getElementById(
            "courseList"
        );


    courseList.innerHTML = "";


    if (courses.length === 0) {

        courseList.innerHTML =
            "<p>No courses available yet.</p>";

        return;

    }


    courses.forEach(course => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "card course-browser-card";


        card.innerHTML = `

        <div class="course-thumbnail">

            ${
                course.image_url
                    ? `
                        <img
                            src="${course.image_url}"
                            alt="${course.title} course thumbnail"
                        >
                    `
                    : `
                        <div class="course-thumbnail-placeholder">
                            📚
                        </div>
                    `
            }

        </div>


        <div class="course-card-body">

            <h2>
                ${course.title}
            </h2>

            <p class="course-description">
                ${course.description || "No description available."}
            </p>

            <p class="course-instructor">
                Instructor: ${course.instructor_name}
            </p>

            <button
                type="button"
                class="btn btn-primary"
                onclick="enrollCourse(${course.id}, this)"
            >
                Enroll
            </button>

        </div>

    `;

        courseList.appendChild(card);

    });

}


/**
 * Enroll student in a course
 */
async function enrollCourse(
    courseId,
    button
) {

    button.disabled = true;

    button.textContent =
        "Enrolling...";


    try {

        const response = await fetch(
            apiUrl("/enrollments"),
            {
                method: "POST",

                headers: authHeaders(),

                body: JSON.stringify({
                    courseId
                })
            }
        );


        await handleApiResponse(
            response
        );


        setFlashToast(
            "Enrollment successful!",
            "success"
        );

        window.location.href =
            "../dashboard/student-dashboard.html";

    }

    catch (error) {

        console.error(error);


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Enrollment failed.",
                "error"
            );

            button.disabled = false;

            button.textContent =
                "Enroll";

        }

    }

}


loadCourses();