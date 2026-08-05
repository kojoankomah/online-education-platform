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

// Check if courseId is present
if(!courseId){

    alert("No course selected.");

    window.location.href =
    "manage-course.html";

}

// Load course details
async function loadLessons(){

    try{

        const response =
        await fetch(

            apiUrl(
                `/lessons/course/${courseId}`
            ),

            {

                headers:authHeaders()

            }

        );

        const data =
        await response.json();

        const select =
        document.getElementById(
            "lessonSelect"
        );

        select.innerHTML="";


        const lessons =
        data.lessons || data;


        if(lessons.length === 0){

            select.innerHTML =
            `
            <option>
            No lessons available
            </option>
            `;

            return;

        }


        lessons.forEach(lesson=>{


            const option =
            document.createElement("option");

            option.value =
            lesson.id;

            option.textContent =
            `Lesson ${lesson.lesson_order}: ${lesson.title}`;

            select.appendChild(option);

        });

    }

    catch(error){

        console.error(error);

    }

}



// Submit quiz
document
.getElementById("quizForm")
.addEventListener(
"submit",
createQuiz
);

async function createQuiz(e){

    e.preventDefault();

// Validate lesson selection
const lessonId = document.getElementById(
    "lessonSelect"
).value;


if(!lessonId){

    alert(
    "Please select a lesson."
    );

    return;

}


const button =
e.target.querySelector("button");

button.disabled = true;

button.textContent =
"Creating...";


    const title =
    document.getElementById(
    "quizTitle"
    ).value.trim();

    try{

        const response =
        await fetch(

            apiUrl(
                `/quizzes/lesson/${lessonId}`
            ),

            {

                method:"POST",

                headers:authHeaders(),

                body:JSON.stringify({

                    title

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
            "Quiz created successfully!"
        );


        window.location.href =
        `add-question.html?quizId=${data.quiz.id}&courseId=${courseId}`;

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

    finally{

        button.disabled = false;

        button.textContent =
        "Create Quiz";

    }

}



loadLessons();