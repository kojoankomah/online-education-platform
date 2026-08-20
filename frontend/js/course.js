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

        await setupContinueLearning(
            data.lessons || [],
            completedLessons || []
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
 * Set up Continue Learning
 */
async function setupContinueLearning(
    lessons,
    completedLessons
) {

    const section =
        document.getElementById(
            "continueLearningSection"
        );

    const text =
        document.getElementById(
            "continueLearningText"
        );

    const button =
        document.getElementById(
            "continueLearningBtn"
        );


    section.style.display =
        "none";


    if (
        lessons.length === 0
    ) {

        return;

    }


    const completedIds =
        completedLessons.map(
            item =>
                Number(item.lesson_id)
        );


    // First unfinished lesson
    const nextLesson =
        lessons.find(
            lesson =>
                !completedIds.includes(
                    Number(lesson.id)
                )
        );


    // Entire course completed
    if (!nextLesson) {

        return;

    }


    let destination =
        `../lessons/lesson.html?lessonId=${nextLesson.id}`;


    let destinationText =
        `Continue with Lesson ${nextLesson.lesson_order}: ${nextLesson.title}`;


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapters +
                    "/student/lesson/" +
                    nextLesson.id
                ),
                {
                    headers:
                        authHeaders()
                }
            );


        const chapterData =
            await handleApiResponse(
                response
            );


        const chapters =
            chapterData.chapters || [];


        // Resume something already started first
        const inProgressChapter =
            chapters.find(
                chapter =>
                    !chapter.is_locked &&
                    chapter.progress_status ===
                        "in_progress"
            );


        // Otherwise continue with the next
        // incomplete required chapter
        const nextRequiredChapter =
            chapters.find(
                chapter =>
                    !chapter.is_locked &&
                    chapter.is_required &&
                    chapter.progress_status !==
                        "completed"
            );


        const targetChapter =
            inProgressChapter ||
            nextRequiredChapter;


        if (targetChapter) {

            destination =
                `../chapters/chapter.html?chapterId=${targetChapter.id}&lessonId=${nextLesson.id}&courseId=${courseId}`;


            destinationText =
                targetChapter.progress_status ===
                    "in_progress"
                    ? `Resume Chapter ${targetChapter.chapter_order}: ${targetChapter.title}`
                    : `Continue with Chapter ${targetChapter.chapter_order}: ${targetChapter.title}`;

        }

        /*
         * If all required chapters are complete
         * but the lesson itself is unfinished,
         * destination remains the lesson page.
         * This lets the student continue to
         * the quiz/completion step.
         */

    }

    catch (error) {

        console.error(
            "Continue learning error:",
            error
        );


        if (
            error.message ===
            "Authentication required"
        ) {

            return;

        }


        // Fall back safely to the lesson page.
    }


    text.textContent =
        destinationText;


    button.onclick =
        () => {

            window.location.href =
                destination;

        };


    section.style.display =
        "block";

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


    lessonList.textContent =
        "";


    if (
        lessons.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "No lessons are available yet.";

        lessonList.appendChild(
            message
        );

        return;

    }


    const completedLessonIds =
        completedLessons.map(
            lesson =>
                Number(
                    lesson.lesson_id
                )
        );


    lessons.forEach(
        lesson => {

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


            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                `${isCompleted ? "✅" : "📖"} ` +
                `Lesson ${lesson.lesson_order}: ` +
                lesson.title;


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "btn btn-primary";

            button.textContent =
                isCompleted
                    ? "Review Lesson"
                    : "Open Lesson";


            button.addEventListener(
                "click",
                () => {

                    openLesson(
                        lesson.id
                    );

                }
            );


            item.appendChild(
                title
            );

            item.appendChild(
                button
            );


            lessonList.appendChild(
                item
            );

        }
    );

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