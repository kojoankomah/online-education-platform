const token = getToken();

if (!token) {
    window.location.href =
        "../auth/login.html";
}


// Ensure instructor access
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


// Get course ID from URL
const params =
    new URLSearchParams(
        window.location.search
    );

const courseId =
    params.get("courseId");


// Validate course ID
if (!courseId) {

    alert(
        "No course selected."
    );

    window.location.href =
        "../dashboard/instructor-dashboard.html";
}


document.getElementById(
    "backToCourse").href =
    `manage-course.html?courseId=${courseId}`;


/**
 * Load enrolled students
 */
async function loadStudents() {

    try {

        const response = await fetch(
            apiUrl(
                `/enrollments/course/${courseId}/students`
            ),
            {
                headers: authHeaders()
            }
        );


        const students =
            await handleApiResponse(
                response
            );


        displayStudents(
            students || []
        );

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
            "Unable to load students."
        );


        // Course does not exist or
        // instructor does not own it
        if (
            error.status === 403 ||
            error.status === 404
        ) {

            window.location.href =
                "../dashboard/instructor-dashboard.html";

        }

    }

}



/**
 * Display enrolled students
 */
function displayStudents(students) {

    const list =
        document.getElementById(
            "studentList"
        );


    list.innerHTML = "";


    if (students.length === 0) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "No students enrolled.";

        list.appendChild(
            message
        );

        return;
    }


    students.forEach(student => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "card";


        const name =
            document.createElement(
                "h3"
            );


        name.textContent =
            student.name;


        const email =
            document.createElement(
                "p"
            );


        email.textContent =
            `Email: ${student.email}`;


        card.appendChild(
            name
        );

        card.appendChild(
            email
        );


        list.appendChild(
            card
        );

    });

}



/**
 * Load page
 */
loadStudents();