const token = getToken();

if(!token){

    window.location.href =
        "../auth/login.html";
}

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if(
    user &&
    user.role !== "instructor"
){

    window.location.href =
        "../dashboard/student-dashboard.html";
}

const params =
new URLSearchParams(
window.location.search
);

const courseId =
params.get("courseId");

if (!courseId) {

    setFlashToast(
        "No course selected.",
        "warning"
    );

    window.location.href =
        "../dashboard/instructor-dashboard.html";
}


// Load course details
async function loadCourse(){

    try{

        const response = await fetch(

            apiUrl(
                API.endpoints.courses +
                "/" +
                courseId +
                "/manage"
            ),

            {
                headers: authHeaders()
            }

        );


        const course =
            await handleApiResponse(response);


        document.getElementById(
            "courseTitle"
        ).textContent =
            course.title;


        document.getElementById(
            "courseDescription"
        ).textContent =
            course.description ||
            "No course description available.";


        displayLessons(
            course.lessons || []
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


        if (
            error.status === 403 ||
            error.status === 404
        ) {

            setFlashToast(
                error.message ||
                "Unable to access this course.",
                "error"
            );


            window.location.href =
                "../dashboard/instructor-dashboard.html";

            return;
        }


        showToast(
            error.message ||
            "Unable to load course.",
            "error"
        );

    }

}



// Display lessons
// Display lessons
function displayLessons(lessons) {

    const list =
        document.getElementById(
            "lessonList"
        );


    list.textContent = "";


    if (
        lessons.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "No lessons yet.";

        list.appendChild(
            message
        );

        return;

    }


    lessons.forEach(
        lesson => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card";


            const content =
                lesson.content || "";


            const preview =
                content.length > 100
                    ? content.substring(
                        0,
                        100
                    ) + "..."
                    : content;


            // Lesson number
            const heading =
                document.createElement(
                    "h3"
                );

            heading.textContent =
                `Lesson ${lesson.lesson_order}`;


            // Lesson title
            const title =
                document.createElement(
                    "p"
                );

            title.textContent =
                lesson.title;


            // Lesson content preview
            const previewText =
                document.createElement(
                    "p"
                );

            previewText.textContent =
                preview ||
                "No lesson content available.";


            // Edit Lesson button
            const editBtn =
                document.createElement(
                    "button"
                );

            editBtn.type =
                "button";

            editBtn.className =
                "btn btn-primary";

            editBtn.textContent =
                "Edit Lesson";

            editBtn.addEventListener(
                "click",
                () => {

                    editLesson(
                        lesson.id
                    );

                }
            );


            // Manage Chapters button
            const chaptersBtn =
                document.createElement(
                    "button"
                );

            chaptersBtn.type =
                "button";

            chaptersBtn.className =
                "btn btn-secondary";

            chaptersBtn.textContent =
                "Manage Chapters";

            chaptersBtn.addEventListener(
                "click",
                () => {

                    manageChapters(
                        lesson.id
                    );

                }
            );



            // Delete Lesson button
            const deleteBtn =
                document.createElement(
                    "button"
                );

            deleteBtn.type =
                "button";

            deleteBtn.className =
                "btn btn-danger";

            deleteBtn.textContent =
                "Delete Lesson";

            deleteBtn.addEventListener(
                "click",
                () => {

                    deleteLesson(
                        lesson.id,
                        lesson.title
                    );

                }
            );
            card.appendChild(
                heading
            );

            card.appendChild(
                title
            );

            card.appendChild(
                previewText
            );

            card.appendChild(
                editBtn
            );

            card.appendChild(
                chaptersBtn
            );


            card.appendChild(
                deleteBtn
            );

            list.appendChild(
                card
            );

        }
    );

}


// Edit course
document.getElementById(
    "editCourseBtn"
).onclick = () => {

    window.location.href =
        `edit-course.html?courseId=${courseId}`;

};



// Add lesson
document.getElementById(
"addLessonBtn"
).onclick=()=>{

window.location.href=
`add-lesson.html?courseId=${courseId}`;

};



document.getElementById(
"createQuizBtn"
).onclick=()=>{

window.location.href=
`create-quiz.html?courseId=${courseId}`;

};


// View students
document.getElementById(
"viewStudentsBtn"
).onclick=()=>{

window.location.href=
`students.html?courseId=${courseId}`;

};



// Edit lesson 
function editLesson(lessonId) {

    window.location.href =
        `edit-lesson.html?lessonId=${lessonId}&courseId=${courseId}`;

}

// Manage chapters
function manageChapters(lessonId) {

    window.location.href =
        `manage-chapters.html?lessonId=${lessonId}&courseId=${courseId}`;

}


// Delete lesson
async function deleteLesson(
    lessonId,
    lessonTitle
) {

    const confirmed =
        window.confirm(
            `Delete "${lessonTitle}"?\n\nThis will also remove its chapters, content, quizzes, and related progress. This action cannot be undone.`        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.lessons +
                    "/" +
                    lessonId
                ),
                {
                    method: "DELETE",
                    headers:
                        authHeaders()
                }
            );


        await handleApiResponse(
            response
        );


        showToast(
            "Lesson deleted successfully.",
            "success"
        );


        await loadCourse();

    }

    catch (error) {

        console.error(
            "Delete lesson error:",
            error
        );


        if (
            error.message ===
            "Authentication required"
        ) {
            return;
        }


        showToast(
            error.message ||
            "Unable to delete lesson.",
            "error"
        );

    }

}



loadCourse();