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

        data.lessons.forEach(lesson=>{

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

    const lessonId =
    document.getElementById(
        "lessonSelect"
    ).value;

    const title =
    document.getElementById(
        "quizTitle"
    ).value;

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

}



loadLessons();