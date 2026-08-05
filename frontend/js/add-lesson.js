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

if(!courseId){

    alert("No course selected.");

    window.location.href =
    "manage-course.html";

}

document
.getElementById("lessonForm")
.addEventListener(
"submit",
createLesson
);

async function createLesson(e){

    e.preventDefault();

    const button = e.target.querySelector("button");

    button.disabled = true;

    button.textContent =
    "Creating...";

const title =
document.getElementById("title").value.trim();

const content =
document.getElementById("content").value.trim();


// (Validate lesson order) Get the lesson order as an integer
    const lesson_order =
    parseInt(
        document.getElementById(
            "lessonOrder"
        ).value
    );


    if(!lesson_order || lesson_order <= 0){

        alert(
        "Lesson order must be greater than zero."
        );

        return;

    }

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

    finally{

        button.disabled = false;

        button.textContent =
        "Create Lesson";

    }

}