const token =
    getToken();


if (!token) {

    window.location.href =
        "../auth/login.html";

}


// =========================
// URL PARAMETERS
// =========================

const params =
    new URLSearchParams(
        window.location.search
    );


const lessonId =
    params.get("lessonId");


const courseId =
    params.get("courseId");


// =========================
// VALIDATE PARAMETERS
// =========================

if (
    !lessonId ||
    !courseId
) {

    setFlashToast(
        "Lesson or course information is missing.",
        "warning"
    );


    window.location.href =
        "../dashboard/instructor-dashboard.html";

}


// =========================
// BACK TO CHAPTERS
// =========================

document.getElementById(
    "backToChapters"
).href =
    `manage-chapters.html?lessonId=${lessonId}&courseId=${courseId}`;

    
// =========================
// FORM EVENT
// =========================

document
    .getElementById(
        "chapterForm"
    )
    .addEventListener(
        "submit",
        createChapter
    );


// =========================
// CREATE CHAPTER
// =========================

async function createChapter(e) {

    e.preventDefault();


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    const title =
        document.getElementById(
            "title"
        ).value.trim();


    const description =
        document.getElementById(
            "description"
        ).value.trim();


    const chapterOrder =
        Number(
            document.getElementById(
                "chapterOrder"
            ).value
        );


    const estimatedMinutesValue =
        document.getElementById(
            "estimatedMinutes"
        ).value;


    const estimatedMinutes =
        estimatedMinutesValue
            ? Number(
                estimatedMinutesValue
            )
            : null;


    const isRequired =
        document.getElementById(
            "isRequired"
        ).value === "true";


    const status =
        document.getElementById(
            "status"
        ).value;


    // =========================
    // VALIDATION
    // =========================

    if (!title) {

        showToast(
            "Chapter title is required.",
            "warning"
        );

        return;

    }


    if (
        !Number.isInteger(
            chapterOrder
        ) ||
        chapterOrder <= 0
    ) {

        showToast(
            "Chapter order must be a positive whole number.",
            "warning"
        );

        return;

    }


    if (
        estimatedMinutes !== null &&
        (
            !Number.isInteger(
                estimatedMinutes
            ) ||
            estimatedMinutes <= 0
        )
    ) {

        showToast(
            "Estimated minutes must be a positive whole number.",
            "warning"
        );

        return;

    }


    button.disabled =
        true;

    button.textContent =
        "Creating...";


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapters
                ),
                {
                    method:
                        "POST",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
                            lesson_id:
                                Number(
                                    lessonId
                                ),

                            title,

                            description,

                            chapter_order:
                                chapterOrder,

                            estimated_minutes:
                                estimatedMinutes,

                            is_required:
                                isRequired,

                            status
                        })
                }
            );


        await handleApiResponse(
            response
        );


        setFlashToast(
            "Chapter created successfully!",
            "success"
        );


        window.location.href =
            `manage-chapters.html?lessonId=${lessonId}&courseId=${courseId}`;

    }

    catch (error) {

        console.error(
            "Create chapter error:",
            error
        );


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to create chapter.",
                "error"
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Create Chapter";

    }

}