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


// =========================
// VALIDATE PARAMETERS
// =========================

if (
    !chapterId ||
    !lessonId ||
    !courseId
) {

    setFlashToast(
        "Chapter, lesson, or course information is missing.",
        "warning"
    );


    window.location.href =
        "../dashboard/instructor-dashboard.html";

}


// =========================
// BACK TO CONTENT
// =========================

document.getElementById(
    "backToContent"
).href =
    `manage-chapter-content.html?chapterId=${chapterId}&lessonId=${lessonId}&courseId=${courseId}`;

    
// =========================
// CONTENT TYPE FIELDS
// =========================

const blockType =
    document.getElementById(
        "blockType"
    );


const textField =
    document.getElementById(
        "textField"
    );


const mediaField =
    document.getElementById(
        "mediaField"
    );


blockType.addEventListener(
    "change",
    () => {

        if (
            blockType.value ===
            "text"
        ) {

            textField.style.display =
                "block";

            mediaField.style.display =
                "none";

        }

        else if (
            blockType.value
        ) {

            textField.style.display =
                "none";

            mediaField.style.display =
                "block";

        }

        else {

            textField.style.display =
                "block";

            mediaField.style.display =
                "none";

        }

    }
);


// =========================
// FORM EVENT
// =========================

document
    .getElementById(
        "contentForm"
    )
    .addEventListener(
        "submit",
        createContentBlock
    );


// =========================
// CREATE CONTENT BLOCK
// =========================

async function createContentBlock(e) {

    e.preventDefault();


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    const type =
        document.getElementById(
            "blockType"
        ).value;


    const textContent =
        document.getElementById(
            "textContent"
        ).value.trim();


    const mediaUrl =
        document.getElementById(
            "mediaUrl"
        ).value.trim();


    const blockOrder =
        Number(
            document.getElementById(
                "blockOrder"
            ).value
        );


    // =========================
    // VALIDATION
    // =========================

    if (!type) {

        showToast(
            "Select a content type.",
            "warning"
        );

        return;

    }


    if (
        type === "text" &&
        !textContent
    ) {

        showToast(
            "Text content is required.",
            "warning"
        );

        return;

    }


    if (
        type !== "text" &&
        !mediaUrl
    ) {

        showToast(
            "Media URL is required.",
            "warning"
        );

        return;

    }


    if (
        !Number.isInteger(
            blockOrder
        ) ||
        blockOrder <= 0
    ) {

        showToast(
            "Block order must be a positive whole number.",
            "warning"
        );

        return;

    }


    button.disabled =
        true;

    button.textContent =
        "Adding...";


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapterContent
                ),
                {
                    method:
                        "POST",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
                            chapter_id:
                                Number(
                                    chapterId
                                ),

                            block_type:
                                type,

                            text_content:
                                type === "text"
                                    ? textContent
                                    : null,

                            media_url:
                                type === "text"
                                    ? null
                                    : mediaUrl,

                            media_public_id:
                                null,

                            block_order:
                                blockOrder
                        })
                }
            );


        await handleApiResponse(
            response
        );


        setFlashToast(
            "Content added successfully!",
            "success"
        );


        window.location.href =
            `manage-chapter-content.html?chapterId=${chapterId}&lessonId=${lessonId}&courseId=${courseId}`;

    }

    catch (error) {

        console.error(
            "Create content block error:",
            error
        );


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to add content.",
                "error"
            );

        }

    }

    finally {

        button.disabled =
            false;

        button.textContent =
            "Add Content";

    }

}