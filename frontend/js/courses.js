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


    courseList.textContent = "";


    if (
        courses.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "No courses available yet.";

        courseList.appendChild(
            message
        );

        return;

    }


    courses.forEach(
        course => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card course-browser-card";


            // Thumbnail container
            const thumbnail =
                document.createElement(
                    "div"
                );

            thumbnail.className =
                "course-thumbnail";


            if (
                course.image_url
            ) {

                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    course.image_url;

                image.alt =
                    `${course.title} course thumbnail`;

                image.loading =
                    "lazy";


                thumbnail.appendChild(
                    image
                );

            }

            else {

                const placeholder =
                    document.createElement(
                        "div"
                    );

                placeholder.className =
                    "course-thumbnail-placeholder";

                placeholder.textContent =
                    "📚";


                thumbnail.appendChild(
                    placeholder
                );

            }


            // Course body
            const body =
                document.createElement(
                    "div"
                );

            body.className =
                "course-card-body";


            const title =
                document.createElement(
                    "h2"
                );

            title.textContent =
                course.title;


            const description =
                document.createElement(
                    "p"
                );

            description.className =
                "course-description";

            description.textContent =
                course.description ||
                "No description available.";


            const instructor =
                document.createElement(
                    "p"
                );

            instructor.className =
                "course-instructor";

            instructor.textContent =
                `Instructor: ${course.instructor_name}`;


            const enrollBtn =
                document.createElement(
                    "button"
                );

            enrollBtn.type =
                "button";

            enrollBtn.className =
                "btn btn-primary";

            enrollBtn.textContent =
                "Enroll";


            enrollBtn.addEventListener(
                "click",
                () => {

                    enrollCourse(
                        course.id,
                        enrollBtn
                    );

                }
            );


            body.appendChild(
                title
            );

            body.appendChild(
                description
            );

            body.appendChild(
                instructor
            );

            body.appendChild(
                enrollBtn
            );


            card.appendChild(
                thumbnail
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