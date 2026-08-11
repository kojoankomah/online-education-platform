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


// Get course ID from URL
const params =
    new URLSearchParams(
        window.location.search
    );

const courseId =
    params.get("courseId");


// Validate course ID
if (!courseId) {

    setFlashToast(
        "No course selected.",
        "warning"
    );

    window.location.href =
        "../dashboard/student-dashboard.html";

}



/**
 * Load course details and progress
 */
async function loadCourse() {

    try {

        // ----------------------------
        // COURSE DETAILS
        // ----------------------------

        const response = await fetch(
            apiUrl(
                `/courses/${courseId}`
            ),
            {
                headers:
                    authHeaders()
            }
        );


        const data =
            await handleApiResponse(
                response
            );


        // ----------------------------
        // COMPLETED LESSONS
        // ----------------------------

        const progressResponse =
            await fetch(
                apiUrl(
                    `/progress/course/${courseId}/lessons`
                ),
                {
                    headers:
                        authHeaders()
                }
            );


        const completedLessons =
            await handleApiResponse(
                progressResponse
            );


        // ----------------------------
        // OVERALL COURSE PROGRESS
        // ----------------------------

        const courseProgressResponse =
            await fetch(
                apiUrl(
                    `/progress/course/${courseId}`
                ),
                {
                    headers:
                        authHeaders()
                }
            );


        const courseProgress =
            await handleApiResponse(
                courseProgressResponse
            );


        // ----------------------------
        // DISPLAY COURSE
        // ----------------------------

        document.getElementById(
            "courseTitle"
        ).textContent =
            data.title;


        document.getElementById(
            "courseDescription"
        ).textContent =
            data.description ||
            "No course description available.";


        displayLessons(
            data.lessons || [],
            completedLessons || []
        );


        displayProgress(
            courseProgress
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


        // Student is not enrolled
        // or course does not exist
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
                "../dashboard/student-dashboard.html";

            return;

        }


        // Error that keeps the student
        // on this page
        showToast(
            error.message ||
            "Unable to load course.",
            "error"
        );

    }

}



/**
 * Display lessons in the course
 */
function displayLessons(
    lessons,
    completedLessons
) {

    const lessonList =
        document.getElementById(
            "lessonList"
        );


    lessonList.innerHTML =
        "";


    if (
        lessons.length === 0
    ) {

        lessonList.innerHTML =
            "<p>No lessons are available yet.</p>";

        return;

    }


    // Extract completed lesson IDs
    const completedLessonIds =
        completedLessons.map(
            lesson =>
                Number(
                    lesson.lesson_id
                )
        );


    lessons.forEach(lesson => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "card";


        const isCompleted =
            completedLessonIds.includes(
                Number(
                    lesson.id
                )
            );


        item.innerHTML = `

            <h3>
                ${isCompleted ? "✅" : "📖"}
                Lesson ${lesson.lesson_order}:
                ${lesson.title}
            </h3>

            <button
                type="button"
                class="btn btn-primary"
                onclick="openLesson(${lesson.id})"
            >

                ${
                    isCompleted
                        ? "Review Lesson"
                        : "Open Lesson"
                }

            </button>

        `;


        lessonList.appendChild(
            item
        );

    });

}



/**
 * Display overall course progress
 */
function displayProgress(
    progress
) {

    const progressBar =
        document.getElementById(
            "courseProgressBar"
        );


    const progressText =
        document.getElementById(
            "courseProgressText"
        );


    const overallProgress =
        Number(
            progress.overallProgress
        ) || 0;


    progressBar.style.width =
        `${overallProgress}%`;


    progressText.textContent =
        `${overallProgress}% completed ` +
        `(${progress.lessonProgress.completed}/` +
        `${progress.lessonProgress.total} lessons completed)`;

}



/**
 * Open individual lesson
 */
function openLesson(
    lessonId
) {

    window.location.href =
        `../lessons/lesson.html?lessonId=${lessonId}`;

}


// Only load when a valid course ID exists
if (courseId) {

    loadCourse();

}