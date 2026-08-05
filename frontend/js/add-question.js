const token = getToken();


if(!token){

    window.location.href =
    "../auth/login.html";

}



const params =
new URLSearchParams(
window.location.search
);



const quizId =
params.get("quizId");

if(!quizId){

    alert("No quiz selected.");

    window.location.href =
    "create-quiz.html";

}

const courseId =
params.get("courseId");

if(!courseId){

    alert("Course information missing.");

    window.location.href =
    "../dashboard/instructor-dashboard.html";

}

document
.getElementById("questionForm")
.addEventListener(
"submit",
addQuestion
);


// Function to add a question to the quiz
async function addQuestion(e){

    e.preventDefault();

    const button =document.getElementById(
        "addQuestionBtn"
    );

    button.disabled = true;


    button.textContent =
    "Adding...";

    const question =
    document.getElementById(
        "question"
    ).value.trim();



    const option_a =
    document.getElementById(
        "option_a"
    ).value.trim();


    const option_b =
    document.getElementById(
        "option_b"
    ).value.trim();


    const option_c =
    document.getElementById(
        "option_c"
    ).value.trim();


    const option_d =
    document.getElementById(
        "option_d"
    ).value.trim();


    const correct_answer =
    document.getElementById(
        "correct_answer"
    ).value.trim();

    if(
        !question ||
        !option_a ||
        !option_b ||
        !option_c ||
        !option_d
    ){

        alert(
            "All fields are required."
        );

        return;

    }

    try{


        const response =
        await fetch(

            apiUrl(
            `/quizzes/${quizId}/questions`
            ),

            {

                method:"POST",

                headers:authHeaders(),

                body:JSON.stringify({

                    question,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer

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
            "Question added successfully!"
        );



        document
        .getElementById(
            "questionForm"
        )
        .reset();

    }


    catch(error){

        console.error(error);

        alert(
            error.message
        );

    }

    finally{

        button.disabled = false;

        button.textContent =
        "Add Question";

    }

}


document
.getElementById("finishQuizBtn")
.addEventListener(
"click",
()=>{


    window.location.href =
    `manage-course.html?courseId=${courseId}`;


}
);