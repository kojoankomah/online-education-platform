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
        "../dashboard/student-dashboard.html";

}


// =========================
// PAGE ELEMENTS
// =========================

const chapterTitle =
    document.getElementById(
        "chapterTitle"
    );


const chapterDescription =
    document.getElementById(
        "chapterDescription"
    );


const chapterMeta =
    document.getElementById(
        "chapterMeta"
    );


const contentList =
    document.getElementById(
        "contentList"
    );


const completeChapterBtn =
    document.getElementById(
        "completeChapterBtn"
    );


const previousChapterBtn =
    document.getElementById(
        "previousChapterBtn"
    );


const nextChapterBtn =
    document.getElementById(
        "nextChapterBtn"
    );



// =========================
// BACK TO LESSON
// =========================

document.getElementById(
    "backToLesson"
).href =
    `../lessons/lesson.html?lessonId=${lessonId}`;

    
// =========================
// LOAD CHAPTER
// =========================

async function loadChapter() {

    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapterContent +
                    "/student/chapter/" +
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


        const chapter =
            data.chapter;


        chapterTitle.textContent =
            chapter.title;


        chapterDescription.textContent =
            chapter.description ||
            "No description available.";


        chapterMeta.textContent =
            chapter.estimated_minutes
                ? `${chapter.estimated_minutes} minutes`
                : "Estimated time not specified";


        displayContentBlocks(
            data.content_blocks || []
        );


        await loadChapterProgress();

    }

    catch (error) {

        console.error(
            "Load chapter error:",
            error
        );


        completeChapterBtn.disabled =
            true;

        completeChapterBtn.textContent =
            "Chapter Unavailable";


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
                "Unable to access this chapter.",
                "error"
            );


            window.location.href =
                `../lessons/lesson.html?lessonId=${lessonId}`;

            return;

        }


        showToast(
            error.message ||
            "Unable to load chapter.",
            "error"
        );

    }

}



// Allow only normal web URLs
function getSafeMediaUrl(value) {

    if (
        typeof value !== "string" ||
        !value.trim()
    ) {
        return null;
    }


    try {

        const parsedUrl =
            new URL(
                value.trim()
            );


        if (
            parsedUrl.protocol !== "http:" &&
            parsedUrl.protocol !== "https:"
        ) {
            return null;
        }


        return parsedUrl.href;

    }

    catch {

        return null;

    }

}



// =========================
// DISPLAY CONTENT
// =========================

function displayContentBlocks(blocks) {

    contentList.innerHTML =
        "";


    if (
        blocks.length === 0
    ) {

        contentList.innerHTML =
            "<p>No content has been added to this chapter yet.</p>";

        return;

    }


    blocks.forEach(
        block => {

            const container =
                document.createElement(
                    "div"
                );


            container.className =
                "chapter-content-block";


            if (
                block.block_type ===
                "text"
            ) {

                const paragraph =
                    document.createElement(
                        "p"
                    );


                paragraph.textContent =
                    block.text_content || "";


                container.appendChild(
                    paragraph
                );

            }


            else if (
                block.block_type ===
                "image"
            ) {

                const safeUrl =
                    getSafeMediaUrl(
                        block.media_url
                    );


                if (!safeUrl) {

                    const message =
                        document.createElement(
                            "p"
                        );

                    message.textContent =
                        "Image unavailable.";

                    container.appendChild(
                        message
                    );

                }

                else {

                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        safeUrl;

                    image.alt =
                        "Chapter content image";

                    image.loading =
                        "lazy";


                    container.appendChild(
                        image
                    );

                }

            }


            else if (
                block.block_type ===
                "video"
            ) {

                const safeUrl =
                    getSafeMediaUrl(
                        block.media_url
                    );


                if (!safeUrl) {

                    const message =
                        document.createElement(
                            "p"
                        );

                    message.textContent =
                        "Video unavailable.";

                    container.appendChild(
                        message
                    );

                }

                else {

                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        safeUrl;

                    link.target =
                        "_blank";

                    link.rel =
                        "noopener noreferrer";

                    link.textContent =
                        "Open Video";


                    container.appendChild(
                        link
                    );

                }

            }


            else if (
                block.block_type ===
                "resource"
            ) {

                const safeUrl =
                    getSafeMediaUrl(
                        block.media_url
                    );


                if (!safeUrl) {

                    const message =
                        document.createElement(
                            "p"
                        );

                    message.textContent =
                        "Learning resource unavailable.";

                    container.appendChild(
                        message
                    );

                }

                else {

                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        safeUrl;

                    link.target =
                        "_blank";

                    link.rel =
                        "noopener noreferrer";

                    link.textContent =
                        "Open Learning Resource";


                    container.appendChild(
                        link
                    );

                }

            }


            contentList.appendChild(
                container
            );

        }
    );

}


// =========================
// LOAD PROGRESS
// =========================

async function loadChapterProgress() {

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


        const currentIndex =
            chapters.findIndex(
                item =>
                    Number(item.id) ===
                    Number(chapterId)
            );


        const chapter =
            currentIndex !== -1
                ? chapters[currentIndex]
                : null;


        if (!chapter) {

            throw new Error(
                "Chapter progress could not be found."
            );

        }


        setupChapterNavigation(
            chapters,
            currentIndex
        );



        if (
            chapter.progress_status ===
            "completed"
        ) {

            completeChapterBtn.textContent =
                "✓ Chapter Completed";

            completeChapterBtn.disabled =
                true;

            return;

        }


        await markChapterInProgress();


        completeChapterBtn.textContent =
            "Mark Chapter Complete";

        completeChapterBtn.disabled =
            false;

    }

    catch (error) {

        console.error(
            "Chapter progress error:",
            error
        );


        completeChapterBtn.disabled =
            true;

        completeChapterBtn.textContent =
            "Unable to Verify Progress";


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to verify chapter progress.",
                "error"
            );

        }

    }

}



// =========================
// CHAPTER NAVIGATION
// =========================

function setupChapterNavigation(
    chapters,
    currentIndex
) {

    previousChapterBtn.style.display =
        "none";

    nextChapterBtn.style.display =
        "none";


    // Previous chapter
    if (
        currentIndex > 0
    ) {

        const previousChapter =
            chapters[currentIndex - 1];


        previousChapterBtn.style.display =
            "inline-flex";

        previousChapterBtn.disabled =
            previousChapter.is_locked;


        previousChapterBtn.textContent =
            "Previous Chapter";


        previousChapterBtn.onclick =
            () => {

                if (
                    previousChapter.is_locked
                ) {

                    return;

                }


                openChapter(
                    previousChapter.id
                );

            };

    }


    // Next chapter
    if (
        currentIndex <
        chapters.length - 1
    ) {

        const nextChapter =
            chapters[currentIndex + 1];


        nextChapterBtn.style.display =
            "inline-flex";


        if (
            nextChapter.is_locked
        ) {

            nextChapterBtn.disabled =
                true;

            nextChapterBtn.textContent =
                "Complete Current Chapter to Unlock Next";

        }

        else {

            nextChapterBtn.disabled =
                false;

            nextChapterBtn.textContent =
                "Next Chapter";


            nextChapterBtn.onclick =
                () => {

                    openChapter(
                        nextChapter.id
                    );

                };

        }

    }

}


// =========================
// OPEN CHAPTER
// =========================

function openChapter(targetChapterId) {

    window.location.href =
        `chapter.html?chapterId=${targetChapterId}&lessonId=${lessonId}&courseId=${courseId}`;

}



// =========================
// MARK IN PROGRESS
// =========================

async function markChapterInProgress() {

    const response =
        await fetch(
            apiUrl(
                API.endpoints.chapters +
                "/student/" +
                chapterId +
                "/progress"
            ),
            {
                method:
                    "PATCH",

                headers:
                    authHeaders(),

                body:
                    JSON.stringify({
                        status:
                            "in_progress"
                    })
            }
        );


    await handleApiResponse(
        response
    );

}


// =========================
// COMPLETE CHAPTER
// =========================

async function completeChapter() {

    completeChapterBtn.disabled =
        true;

    completeChapterBtn.textContent =
        "Marking Complete...";


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapters +
                    "/student/" +
                    chapterId +
                    "/progress"
                ),
                {
                    method:
                        "PATCH",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
                            status:
                                "completed"
                        })
                }
            );


        await handleApiResponse(
            response
        );


        completeChapterBtn.textContent =
            "✓ Chapter Completed";

        completeChapterBtn.disabled =
            true;


        showToast(
            "Chapter completed successfully!",
            "success"
        );

        await loadChapterProgress();

    }

    catch (error) {

        console.error(
            "Complete chapter error:",
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
            "Unable to complete chapter.",
            "error"
        );


        completeChapterBtn.textContent =
            "Mark Chapter Complete";

        completeChapterBtn.disabled =
            false;

    }

}


// =========================
// COMPLETE BUTTON
// =========================

completeChapterBtn.addEventListener(
    "click",
    completeChapter
);


// =========================
// INITIAL LOAD
// =========================

loadChapter();