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


document.getElementById(
    "backToCourse"
).href =
    `manage-course.html?courseId=${courseId}`;

    
document
.getElementById("lessonForm")
.addEventListener(
"submit",
createLesson
);

async function createLesson(e){

    e.preventDefault();

    const button =
    e.target.querySelector("button");

    const title =
    document.getElementById(
        "title"
    ).value.trim();

    const content =
    document.getElementById(
        "content"
    ).value.trim();

    const lesson_order =
    parseInt(
        document.getElementById(
            "lessonOrder"
        ).value
    );


    // Validate title and content
    if(!title || !content){

        alert(
            "Title and lesson content are required."
        );

        return;
    }


    // Validate lesson order
    if(
        !lesson_order ||
        lesson_order <= 0
    ){

        alert(
            "Lesson order must be greater than zero."
        );

        return;
    }


    // Disable only after validation passes
    button.disabled = true;

    button.textContent =
    "Creating...";


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
        await handleApiResponse(
            response
        );


        alert(
            "Lesson created successfully!"
        );


        window.location.href =
        `manage-course.html?courseId=${courseId}`;

    }

    catch(error){

        console.error(error);

        // handleApiResponse already handles
        // authentication errors
        if(
            error.message !==
            "Authentication required"
        ){

            alert(
                error.message
            );

        }

    }

    finally{

        button.disabled = false;

        button.textContent =
        "Create Lesson";

    }

}