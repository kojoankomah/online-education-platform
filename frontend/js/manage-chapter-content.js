const token =
    getToken();


if (!token) {

    window.location.href =
        "../auth/login.html";

}


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


let currentContentBlocks = [];


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
// BACK TO CHAPTERS
// =========================

document.getElementById(
    "backToChaptersBtn"
).onclick = (event) => {

    event.preventDefault();


    window.location.href =
        `manage-chapters.html?lessonId=${lessonId}&courseId=${courseId}`;

};


// =========================
// ADD CONTENT
// =========================

document.getElementById(
    "addContentBtn"
).onclick = () => {

    window.location.href =
        `add-chapter-content.html?chapterId=${chapterId}&lessonId=${lessonId}&courseId=${courseId}`;

};


// =========================
// LOAD CHAPTER DETAILS
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


        document.getElementById(
            "chapterTitle"
        ).textContent =
            `Manage Content — ${chapter.title}`;

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
// LOAD CONTENT BLOCKS
// =========================

async function loadContentBlocks() {

    const list =
        document.getElementById(
            "contentList"
        );


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


        currentContentBlocks =
            data.content_blocks || [];


        displayContentBlocks(
            currentContentBlocks
        );

    }

    catch (error) {

        console.error(
            "Load content blocks error:",
            error
        );


        if (
            error.message ===
            "Authentication required"
        ) {

            return;

        }


        list.innerHTML =
            "<p>Unable to load chapter content.</p>";


        showToast(
            error.message ||
            "Unable to load chapter content.",
            "error"
        );

    }

}


// =========================
// DISPLAY CONTENT BLOCKS
// =========================

function displayContentBlocks(blocks) {

    const list =
        document.getElementById(
            "contentList"
        );


    list.textContent = "";


    if (
        blocks.length === 0
    ) {

        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "No content has been added to this chapter yet.";

        list.appendChild(
            message
        );

        return;

    }


    blocks.forEach(
        (block, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "card";


            // Content preview
            let contentPreview =
                "";


            if (
                block.block_type ===
                "text"
            ) {

                const text =
                    block.text_content ||
                    "";


                contentPreview =
                    text.length > 150
                        ? text.substring(
                            0,
                            150
                        ) + "..."
                        : text;

            }

            else {

                contentPreview =
                    block.media_url ||
                    "No media URL";

            }


            // Block heading
            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                `Block ${block.block_order}`;


            // Type
            const type =
                document.createElement(
                    "p"
                );

            type.textContent =
                `Type: ${block.block_type}`;


            // Preview
            const preview =
                document.createElement(
                    "p"
                );

            preview.textContent =
                contentPreview;


            // Move Up
            const moveUpBtn =
                document.createElement(
                    "button"
                );

            moveUpBtn.type =
                "button";

            moveUpBtn.className =
                "btn btn-secondary";

            moveUpBtn.textContent =
                "Move Up";

            moveUpBtn.disabled =
                index === 0;

            moveUpBtn.addEventListener(
                "click",
                () => {

                    moveContentBlock(
                        index,
                        -1
                    );

                }
            );


            // Move Down
            const moveDownBtn =
                document.createElement(
                    "button"
                );

            moveDownBtn.type =
                "button";

            moveDownBtn.className =
                "btn btn-secondary";

            moveDownBtn.textContent =
                "Move Down";

            moveDownBtn.disabled =
                index ===
                blocks.length - 1;

            moveDownBtn.addEventListener(
                "click",
                () => {

                    moveContentBlock(
                        index,
                        1
                    );

                }
            );


            // Edit
            const editBtn =
                document.createElement(
                    "button"
                );

            editBtn.type =
                "button";

            editBtn.className =
                "btn btn-primary";

            editBtn.textContent =
                "Edit";

            editBtn.addEventListener(
                "click",
                () => {

                    editContentBlock(
                        block.id
                    );

                }
            );


            // Delete
            const deleteBtn =
                document.createElement(
                    "button"
                );

            deleteBtn.type =
                "button";

            deleteBtn.className =
                "btn btn-secondary";

            deleteBtn.textContent =
                "Delete";

            deleteBtn.addEventListener(
                "click",
                () => {

                    deleteContentBlock(
                        block.id
                    );

                }
            );


            card.appendChild(
                title
            );

            card.appendChild(
                type
            );

            card.appendChild(
                preview
            );

            card.appendChild(
                moveUpBtn
            );

            card.appendChild(
                moveDownBtn
            );

            card.appendChild(
                editBtn
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



// =========================
// MOVE CONTENT BLOCK
// =========================

async function moveContentBlock(
    currentIndex,
    direction
) {

    const newIndex =
        currentIndex +
        direction;


    if (
        newIndex < 0 ||
        newIndex >= currentContentBlocks.length
    ) {

        return;

    }


    const reordered =
        [...currentContentBlocks];


    [
        reordered[currentIndex],
        reordered[newIndex]
    ] = [
        reordered[newIndex],
        reordered[currentIndex]
    ];


    const blockIds =
        reordered.map(
            block =>
                Number(block.id)
        );


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapterContent +
                    "/chapter/" +
                    chapterId +
                    "/reorder"
                ),
                {
                    method:
                        "PATCH",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
                            block_ids:
                                blockIds
                        })
                }
            );


        await handleApiResponse(
            response
        );


        showToast(
            "Content order updated successfully!",
            "success"
        );


        await loadContentBlocks();

    }

    catch (error) {

        console.error(
            "Reorder content blocks error:",
            error
        );


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to reorder content.",
                "error"
            );

        }

    }

}


// =========================
// EDIT CONTENT BLOCK
// =========================

function editContentBlock(blockId) {

    window.location.href =
        `edit-chapter-content.html?blockId=${blockId}&chapterId=${chapterId}&lessonId=${lessonId}&courseId=${courseId}`;

}


// =========================
// DELETE CONTENT BLOCK
// =========================

async function deleteContentBlock(blockId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this content block?"
        );


    if (!confirmed) {

        return;

    }


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
                        "DELETE",

                    headers:
                        authHeaders()
                }
            );


        await handleApiResponse(
            response
        );


        showToast(
            "Content block deleted successfully!",
            "success"
        );


        loadContentBlocks();

    }

    catch (error) {

        console.error(
            "Delete content block error:",
            error
        );


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to delete content block.",
                "error"
            );

        }

    }

}




// =========================
// INITIAL LOAD
// =========================

loadChapter();

loadContentBlocks();