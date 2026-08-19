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

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    block.media_url;

                image.alt =
                    "Chapter content image";

                image.loading =
                    "lazy";


                container.appendChild(
                    image
                );

            }


            else if (
                block.block_type ===
                "video"
            ) {

                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    block.media_url;

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


            else if (
                block.block_type ===
                "resource"
            ) {

                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    block.media_url;

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


        const chapter =
            (data.chapters || [])
                .find(
                    item =>
                        Number(item.id) ===
                        Number(chapterId)
                );


        if (!chapter) {

            throw new Error(
                "Chapter progress could not be found."
            );

        }


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