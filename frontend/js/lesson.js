const token = getToken();

if (!token) {

    window.location.href =
        "../auth/login.html";

}


// Get lesson ID from URL
const params =
    new URLSearchParams(
        window.location.search
    );

const lessonId =
    params.get("lessonId");


// Validate lesson ID
if (!lessonId) {

    setFlashToast(
        "No lesson selected.",
        "warning"
    );

    window.location.href =
        "../dashboard/student-dashboard.html";

}


// Main action buttons
const quizBtn =
    document.getElementById(
        "quizBtn"
    );

const completeBtn =
    document.getElementById(
        "completeBtn"
    );


const chapterSection =
    document.getElementById(
        "chapterSection"
    );

const chapterList =
    document.getElementById(
        "chapterList"
    );

const chapterProgress =
    document.getElementById(
        "chapterProgress"
    );


// Do not allow completion until
// the backend confirms eligibility
completeBtn.disabled = true;

completeBtn.textContent =
    "Checking Progress...";


/**
 * Load lesson details
 */
async function loadLesson() {

    try {

        const response = await fetch(
            apiUrl(
                `/lessons/${lessonId}`
            ),
            {
                headers:
                    authHeaders()
            }
        );


        const lesson =
            await handleApiResponse(
                response
            );


        // Back to the correct course
        document.getElementById(
            "backToCourse"
        ).href =
            `../courses/course-details.html?courseId=${lesson.course_id}`;


        document.getElementById(
            "lessonTitle"
        ).textContent =
            lesson.title;


        document.getElementById(
            "lessonContent"
        ).textContent =
            lesson.content;


        await loadStudentChapters();

        // Only check these after
        // lesson access succeeds
        await loadQuizButton();

        await checkCompletion();

    }

    catch (error) {

        console.error(error);


        if (
            error.message ===
            "Authentication required"
        ) {
            return;
        }


        // Access denied or lesson missing
        if (
            error.status === 403 ||
            error.status === 404
        ) {

            setFlashToast(
                error.message ||
                "Unable to access this lesson.",
                "error"
            );


            window.location.href =
                "../dashboard/student-dashboard.html";

            return;

        }


        showToast(
            error.message ||
            "Unable to load lesson.",
            "error"
        );


        completeBtn.disabled = true;

        completeBtn.textContent =
            "Lesson Unavailable";

    }

}



/**
 * Load chapters for the student
 */
async function loadStudentChapters() {

    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapters +
                    "/student/lesson/" +
                    lessonId
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


        const chapters =
            data.chapters || [];


        // Legacy lesson with no chapters
        if (
            chapters.length === 0
        ) {

            chapterSection.style.display =
                "none";

            return;

        }


        // Chapter-based lesson
        chapterSection.style.display =
            "block";


        // Hide old lesson-level content
        document.getElementById(
            "lessonContent"
        ).style.display =
            "none";


        chapterProgress.textContent =
            `${data.completed_required_chapters} of ${data.required_chapter_count} required chapters completed`;


        chapterList.innerHTML =
            "";


        chapters.forEach(
            chapter => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "card";


                let statusText =
                    "Not Started";


                if (
                    chapter.progress_status ===
                    "in_progress"
                ) {

                    statusText =
                        "In Progress";

                }


                if (
                    chapter.progress_status ===
                    "completed"
                ) {

                    statusText =
                        "Completed";

                }


                if (
                    chapter.is_locked
                ) {

                    statusText =
                        "Locked";

                }


                // Chapter title
                const title =
                    document.createElement(
                        "h3"
                    );

                title.textContent =
                    `Chapter ${chapter.chapter_order}: ${chapter.title}`;


                // Description
                const description =
                    document.createElement(
                        "p"
                    );

                description.textContent =
                    chapter.description ||
                    "No description available.";


                // Estimated time
                const estimatedTime =
                    document.createElement(
                        "p"
                    );

                estimatedTime.textContent =
                    chapter.estimated_minutes
                        ? `${chapter.estimated_minutes} minutes`
                        : "Estimated time not specified";


                // Status
                const status =
                    document.createElement(
                        "p"
                    );

                status.textContent =
                    `Status: ${statusText}`;


                // Requirement
                const requirement =
                    document.createElement(
                        "p"
                    );

                requirement.textContent =
                    chapter.is_required
                        ? "Required"
                        : "Optional";


                // Chapter button
                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "btn btn-primary";

                button.disabled =
                    Boolean(
                        chapter.is_locked
                    );


                if (
                    chapter.is_locked
                ) {

                    button.textContent =
                        "Locked";

                }

                else if (
                    chapter.progress_status ===
                    "completed"
                ) {

                    button.textContent =
                        "Review Chapter";

                }

                else {

                    button.textContent =
                        "Open Chapter";

                }


                if (
                    !chapter.is_locked
                ) {

                    button.addEventListener(
                        "click",
                        () => {

                            openChapter(
                                chapter.id,
                                data.lesson.course_id
                            );

                        }
                    );

                }


                card.appendChild(
                    title
                );

                card.appendChild(
                    description
                );

                card.appendChild(
                    estimatedTime
                );

                card.appendChild(
                    status
                );

                card.appendChild(
                    requirement
                );

                card.appendChild(
                    button
                );


                chapterList.appendChild(
                    card
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Chapter loading error:",
            error
        );


        chapterSection.style.display =
            "none";


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to load lesson chapters.",
                "error"
            );

        }

    }

}



/**
 * Open an available chapter
 */
function openChapter(
    chapterId,
    courseId
) {

    window.location.href =
        `../chapters/chapter.html?chapterId=${chapterId}&lessonId=${lessonId}&courseId=${courseId}`;

}


/**
 * Load quiz button if a quiz exists
 * for the lesson
 */
async function loadQuizButton() {

    // Hide until valid quiz is found
    quizBtn.style.display =
        "none";


    try {

        const response = await fetch(
            apiUrl(
                `/quizzes/lesson/${lessonId}`
            ),
            {
                headers:
                    authHeaders()
            }
        );


        const quizzes =
            await handleApiResponse(
                response
            );


        if (
            quizzes.length === 0
        ) {
            return;
        }


        const quiz =
            quizzes[0];


        const quizId =
            quiz.id;


        const quizTitle =
            quiz.title;


        quizBtn.style.display =
            "inline-flex";


        quizBtn.textContent =
            `Take Quiz: ${quizTitle}`;


        quizBtn.onclick = () => {

            window.location.href =
                `../quizzes/quiz.html?quizId=${quizId}&lessonId=${lessonId}&title=${encodeURIComponent(quizTitle)}`;

        };

    }

    catch (error) {

        console.error(
            "Quiz loading error:",
            error
        );


        if (
            error.message ===
            "Authentication required"
        ) {

            return;

        }


        if (
            error.status === 403 &&
            error.message ===
            "Complete all required chapters before accessing this quiz"
        ) {

            quizBtn.style.display =
                "inline-flex";

            quizBtn.disabled =
                true;

            quizBtn.textContent =
                "Complete Required Chapters to Unlock Quiz";

            return;

        }


        quizBtn.style.display =
            "none";


        showToast(
            error.message ||
            "Unable to load lesson quiz.",
            "error"
        );

    }

}



/**
 * Check lesson completion
 * and quiz status
 */
async function checkCompletion() {

    try {

        const response = await fetch(
            apiUrl(
                `/progress/lesson/${lessonId}`
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


        // Lesson already completed
        if (data.completed) {

            completeBtn.textContent =
                "✓ Lesson Completed";

            completeBtn.disabled =
                true;

            return;

        }


        // Lesson has no quiz
        if (!data.quizExists) {

            completeBtn.textContent =
                "Quiz Required";

            completeBtn.disabled =
                true;

            return;

        }


        // Quiz exists but has not been passed
        if (!data.quizPassed) {

            completeBtn.textContent =
                "Pass Quiz to Complete Lesson";

            completeBtn.disabled =
                true;

            return;

        }


        // Quiz passed
        completeBtn.textContent =
            "Mark Lesson Complete";

        completeBtn.disabled =
            false;

    }

    catch (error) {

        console.error(
            "Completion check error:",
            error
        );


        completeBtn.disabled =
            true;

        completeBtn.textContent =
            "Unable to Verify Progress";


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to check lesson progress.",
                "error"
            );

        }

    }

}



/**
 * Mark lesson as completed
 */
async function completeLesson() {

    completeBtn.disabled =
        true;

    completeBtn.textContent =
        "Marking Complete...";


    try {

        const response = await fetch(
            apiUrl(
                `/progress/lesson/${lessonId}/complete`
            ),
            {
                method: "POST",

                headers:
                    authHeaders()
            }
        );


        await handleApiResponse(
            response
        );


        completeBtn.textContent =
            "✓ Lesson Completed";

        completeBtn.disabled =
            true;


        showToast(
            "Lesson completed successfully!",
            "success"
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


        showToast(
            error.message ||
            "Unable to complete lesson.",
            "error"
        );


        // Recheck eligibility instead of
        // blindly enabling the button
        await checkCompletion();

    }

}



/**
 * Complete lesson button
 */
completeBtn.addEventListener(
    "click",
    completeLesson
);


/**
 * Load lesson page
 */
if (lessonId) {

    loadLesson();

}