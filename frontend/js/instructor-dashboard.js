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


    courseList.textContent = "";


    if (
        courseStats.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "No courses created yet.";

        courseList.appendChild(
            message
        );

        return;

    }


    courseStats.forEach(
        course => {

            /*
            * Find the full course record.
            * courseStats contains enrollment
            * statistics, while courses contains
            * the main course information.
            */
            const courseDetails =
                courses.find(
                    item =>
                        Number(item.id) ===
                        Number(course.id)
                ) || course;


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card course-card";


            // =========================
            // COURSE IMAGE
            // =========================

            const image =
                document.createElement(
                    "div"
                );

            image.className =
                "course-image";


            const imageUrl =
                course.image_url ||
                courseDetails.image_url;


            if (imageUrl) {

                const thumbnail =
                    document.createElement(
                        "img"
                    );

                thumbnail.src =
                    imageUrl;

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


            // =========================
            // COURSE BODY
            // =========================

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
                courseDetails.description ||
                "No course description available.";


            const students =
                document.createElement(
                    "p"
                );

            students.textContent =
                `Students Enrolled: ${course.students}`;


            const manageBtn =
                document.createElement(
                    "button"
                );

            manageBtn.type =
                "button";

            manageBtn.className =
                "btn btn-primary";

            manageBtn.textContent =
                "Manage Course";


            manageBtn.addEventListener(
                "click",
                () => {

                    manageCourse(
                        course.id
                    );

                }
            );


            // =========================
            // BUILD CARD
            // =========================

            body.appendChild(
                title
            );

            body.appendChild(
                description
            );

            body.appendChild(
                students
            );

            body.appendChild(
                manageBtn
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