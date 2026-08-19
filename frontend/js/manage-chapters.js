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


const lessonId =
    params.get("lessonId");


const courseId =
    params.get("courseId");


let currentChapters = [];

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
// BACK TO COURSE
// =========================

document.getElementById(
    "backToCourseBtn"
).onclick = (event) => {

    event.preventDefault();


    window.location.href =
        `manage-course.html?courseId=${courseId}`;

};


// =========================
// ADD CHAPTER
// =========================

document.getElementById(
    "addChapterBtn"
).onclick = () => {

    window.location.href =
        `add-chapter.html?lessonId=${lessonId}&courseId=${courseId}`;

};


// =========================
// LOAD LESSON
// =========================

async function loadLesson() {

    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.lessons +
                    "/" +
                    lessonId
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


        document.getElementById(
            "lessonTitle"
        ).textContent =
            `Manage Chapters — ${lesson.title}`;

    }

    catch (error) {

        console.error(
            "Load lesson error:",
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
            "Unable to load lesson.",
            "error"
        );

    }

}


// =========================
// LOAD CHAPTERS
// =========================

async function loadChapters() {

    const list =
        document.getElementById(
            "chapterList"
        );


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


        currentChapters =
            data.chapters || [];


        displayChapters(
            currentChapters
        );

    }

    catch (error) {

        console.error(
            "Load chapters error:",
            error
        );


        if (
            error.message ===
            "Authentication required"
        ) {

            return;

        }


        list.innerHTML =
            "<p>Unable to load chapters.</p>";


        showToast(
            error.message ||
            "Unable to load chapters.",
            "error"
        );

    }

}


// =========================
// DISPLAY CHAPTERS
// =========================

function displayChapters(chapters) {

    const list =
        document.getElementById(
            "chapterList"
        );


    list.innerHTML = "";


    if (
        chapters.length === 0
    ) {

        list.innerHTML =
            "<p>No chapters yet.</p>";

        return;

    }


    chapters.forEach(
        (chapter, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.innerHTML = `

                <h3>
                    Chapter ${chapter.chapter_order}:
                    ${chapter.title}
                </h3>

                <p>
                    ${
                        chapter.description ||
                        "No description."
                    }
                </p>

                <p>
                    Estimated time:
                    ${
                        chapter.estimated_minutes
                            ? chapter.estimated_minutes + " minutes"
                            : "Not specified"
                    }
                </p>

                <p>
                    Required:
                    ${
                        chapter.is_required
                            ? "Yes"
                            : "No"
                    }
                </p>

                <p>
                    Status:
                    ${chapter.status}
                </p>

                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="moveChapter(${index}, -1)"
                    ${index === 0 ? "disabled" : ""}
                >
                    Move Up
                </button>

                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="moveChapter(${index}, 1)"
                    ${index === chapters.length - 1 ? "disabled" : ""}
                >
                    Move Down
                </button>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="manageChapterContent(${chapter.id})"
                >
                    Manage Content
                </button>

                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="editChapter(${chapter.id})"
                >
                    Edit Chapter
                </button>

                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="deleteChapter(${chapter.id})"
                >
                    Delete Chapter
                </button>

            `;


            list.appendChild(
                card
            );

        }
    );

}



// =========================
// MOVE CHAPTER
// =========================

async function moveChapter(
    currentIndex,
    direction
) {

    const newIndex =
        currentIndex +
        direction;


    if (
        newIndex < 0 ||
        newIndex >= currentChapters.length
    ) {

        return;

    }


    const reordered =
        [...currentChapters];


    [
        reordered[currentIndex],
        reordered[newIndex]
    ] = [
        reordered[newIndex],
        reordered[currentIndex]
    ];


    const chapterIds =
        reordered.map(
            chapter =>
                Number(chapter.id)
        );


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapters +
                    "/lesson/" +
                    lessonId +
                    "/reorder"
                ),
                {
                    method:
                        "PATCH",

                    headers:
                        authHeaders(),

                    body:
                        JSON.stringify({
                            chapter_ids:
                                chapterIds
                        })
                }
            );


        await handleApiResponse(
            response
        );


        showToast(
            "Chapter order updated successfully!",
            "success"
        );


        await loadChapters();

    }

    catch (error) {

        console.error(
            "Reorder chapters error:",
            error
        );


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to reorder chapters.",
                "error"
            );

        }

    }

}



// =========================
// MANAGE CHAPTER CONTENT
// =========================

function manageChapterContent(chapterId) {

    window.location.href =
        `manage-chapter-content.html?chapterId=${chapterId}&lessonId=${lessonId}&courseId=${courseId}`;

}


// =========================
// EDIT CHAPTER
// =========================

function editChapter(chapterId) {

    window.location.href =
        `edit-chapter.html?chapterId=${chapterId}&lessonId=${lessonId}&courseId=${courseId}`;

}


// =========================
// DELETE CHAPTER
// =========================

async function deleteChapter(chapterId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this chapter? Its content will also be deleted."
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                apiUrl(
                    API.endpoints.chapters +
                    "/" +
                    chapterId
                ),
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );


        await handleApiResponse(
            response
        );


        showToast(
            "Chapter deleted successfully!",
            "success"
        );


        loadChapters();

    }

    catch (error) {

        console.error(
            "Delete chapter error:",
            error
        );


        if (
            error.message !==
            "Authentication required"
        ) {

            showToast(
                error.message ||
                "Unable to delete chapter.",
                "error"
            );

        }

    }

}


// =========================
// INITIAL LOAD
// =========================

loadLesson();

loadChapters();