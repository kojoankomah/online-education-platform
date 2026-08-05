const token = getToken();

if(!token){

    window.location.href =
    "../auth/login.html";

}

const params =
new URLSearchParams(
window.location.search
);

const courseId =
params.get("courseId");

document
.getElementById("lessonForm")
.addEventListener(
"submit",
createLesson
);

async function createLesson(e){

    e.preventDefault();

    const title =
    document.getElementById("title").value;

    const content =
    document.getElementById("content").value;

    const lesson_order =
    parseInt(
        document.getElementById(
            "lessonOrder"
        ).value
    );

    try{

        const response =
        await fetch(

            apiUrl(
                `/lessons/course/${courseId}`
            ),

            {

                method:"POST",

                headers:authHeaders(),

                body:JSON.stringify({

                    title,
                    content,
                    lesson_order

                })

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            throw new Error(
                data.message ||
                data.error
            );

        }

        alert(
            "Lesson created successfully!"
        );

        window.location.href =
        `manage-course.html?courseId=${courseId}`;

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}