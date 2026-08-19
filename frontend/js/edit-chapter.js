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


const chapterId =
    params.get("chapterId");


const lessonId =
    params.get("lessonId");


const courseId =
    params.get("courseId");


if (
    !chapterId ||
    !lessonId ||
    !courseId
) {

    setFlashToast(
        "Chapter information is missing.",
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
// FORM ELEMENTS
// =========================

const titleInput =
    document.getElementById(
        "title"
    );


const descriptionInput =
    document.getElementById(
        "description"
    );


const chapterOrderInput =
    document.getElementById(
        "chapterOrder"
    );


const estimatedMinutesInput =
    document.getElementById(
        "estimatedMinutes"
    );


const isRequiredInput =
    document.getElementById(
        "isRequired"
    );


const statusInput =
    document.getElementById(
        "status"
    );


// =========================
// LOAD CURRENT CHAPTER
// =========================

async function loadChapter() {

    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapters +
                    "/lesson/" +
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


        const chapter =
            chapters.find(
                item =>
                    Number(item.id) ===
                    Number(chapterId)
            );


        if (!chapter) {

            throw new Error(
                "Chapter not found."
            );

        }


        titleInput.value =
            chapter.title || "";


        descriptionInput.value =
            chapter.description || "";


        chapterOrderInput.value =
            chapter.chapter_order;


        estimatedMinutesInput.value =
            chapter.estimated_minutes || "";


        isRequiredInput.value =
            chapter.is_required
                ? "true"
                : "false";


        statusInput.value =
            chapter.status;

    }

    catch (error) {

        console.error(
            "Load chapter error:",
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
            "Unable to load chapter.",
            "error"
        );

    }

}


// =========================
// FORM EVENT
// =========================

document
    .getElementById(
        "chapterForm"
    )
    .addEventListener(
        "submit",
        updateChapter
    );


// =========================
// UPDATE CHAPTER
// =========================

async function updateChapter(e) {

    e.preventDefault();


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    const title =
        titleInput.value.trim();


    const description =
        descriptionInput.value.trim();


    const chapterOrder =
        Number(
            chapterOrderInput.value
        );


    const estimatedMinutesValue =
        estimatedMinutesInput.value;


    const estimatedMinutes =
        estimatedMinutesValue
            ? Number(
                estimatedMinutesValue
            )
            : null;


    const isRequired =
        isRequiredInput.value ===
        "true";


    const status =
        statusInput.value;


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
        "Saving...";


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapters +
                    "/" +
                    chapterId
                ),
                {
                    method:
                        "PATCH",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
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
            "Chapter updated successfully!",
            "success"
        );


        window.location.href =
            `manage-chapters.html?lessonId=${lessonId}&courseId=${courseId}`;

    }

    catch (error) {

        console.error(
            "Update chapter error:",
            error
        );


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to update chapter.",
                "error"
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Save Changes";

    }

}


// =========================
// INITIAL LOAD
// =========================

loadChapter();