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


const blockId =
    params.get("blockId");


const chapterId =
    params.get("chapterId");


const lessonId =
    params.get("lessonId");


const courseId =
    params.get("courseId");


if (
    !blockId ||
    !chapterId ||
    !lessonId ||
    !courseId
) {

    setFlashToast(
        "Content block information is missing.",
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
// FORM ELEMENTS
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


const textContent =
    document.getElementById(
        "textContent"
    );


const mediaUrl =
    document.getElementById(
        "mediaUrl"
    );


const blockOrder =
    document.getElementById(
        "blockOrder"
    );


// =========================
// TOGGLE FIELDS
// =========================

function updateVisibleFields() {

    if (
        blockType.value ===
        "text"
    ) {

        textField.style.display =
            "block";

        mediaField.style.display =
            "none";

    }

    else {

        textField.style.display =
            "none";

        mediaField.style.display =
            "block";

    }

}


blockType.addEventListener(
    "change",
    updateVisibleFields
);


// =========================
// LOAD CURRENT BLOCK
// =========================

async function loadContentBlock() {

    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapterContent +
                    "/chapter/" +
                    chapterId
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


        const blocks =
            data.content_blocks || [];


        const block =
            blocks.find(
                item =>
                    Number(item.id) ===
                    Number(blockId)
            );


        if (!block) {

            throw new Error(
                "Content block not found."
            );

        }


        blockType.value =
            block.block_type;


        textContent.value =
            block.text_content || "";


        mediaUrl.value =
            block.media_url || "";


        blockOrder.value =
            block.block_order;


        updateVisibleFields();

    }

    catch (error) {

        console.error(
            "Load content block error:",
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
            "Unable to load content block.",
            "error"
        );

    }

}


// =========================
// FORM EVENT
// =========================

document
    .getElementById(
        "contentForm"
    )
    .addEventListener(
        "submit",
        updateContentBlock
    );


// =========================
// UPDATE CONTENT BLOCK
// =========================

async function updateContentBlock(e) {

    e.preventDefault();


    const button =
        e.target.querySelector(
            "button[type='submit']"
        );


    const type =
        blockType.value;


    const text =
        textContent.value.trim();


    const media =
        mediaUrl.value.trim();


    const order =
        Number(
            blockOrder.value
        );


    // =========================
    // VALIDATION
    // =========================

    if (
        type === "text" &&
        !text
    ) {

        showToast(
            "Text content is required.",
            "warning"
        );

        return;

    }


    if (
        type !== "text" &&
        !media
    ) {

        showToast(
            "Media URL is required.",
            "warning"
        );

        return;

    }


    if (
        !Number.isInteger(order) ||
        order <= 0
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
        "Saving...";


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapterContent +
                    "/" +
                    blockId
                ),
                {
                    method:
                        "PATCH",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
                            block_type:
                                type,

                            text_content:
                                type === "text"
                                    ? text
                                    : null,

                            media_url:
                                type === "text"
                                    ? null
                                    : media,

                            block_order:
                                order
                        })
                }
            );


        await handleApiResponse(
            response
        );


        setFlashToast(
            "Content block updated successfully!",
            "success"
        );


        window.location.href =
            `manage-chapter-content.html?chapterId=${chapterId}&lessonId=${lessonId}&courseId=${courseId}`;

    }

    catch (error) {

        console.error(
            "Update content block error:",
            error
        );


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to update content block.",
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

loadContentBlock();