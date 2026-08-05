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



const courseId =
params.get("courseId");



document
.getElementById("questionForm")
.addEventListener(
"submit",
addQuestion
);


// Function to add a question to the quiz
async function addQuestion(e){

    e.preventDefault();



    const question =
    document.getElementById(
        "question"
    ).value;



    const option_a =
    document.getElementById(
        "option_a"
    ).value;


    const option_b =
    document.getElementById(
        "option_b"
    ).value;


    const option_c =
    document.getElementById(
        "option_c"
    ).value;


    const option_d =
    document.getElementById(
        "option_d"
    ).value;


    const correct_answer =
    document.getElementById(
        "correct_answer"
    ).value;



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

}