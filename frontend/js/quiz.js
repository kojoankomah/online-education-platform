const token = localStorage.getItem("token");


if (!token) {

    window.location.href =
    "../auth/login.html";

}


// Get quiz ID from URL

const params =
new URLSearchParams(
window.location.search
);


const quizId =
params.get("quizId");



let questions = [];




// Load quiz questions

async function loadQuiz(){

    try {


        const response =
        await fetch(

            apiUrl(`/quizzes/${quizId}/questions`),

            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }

        );


        const data =
        await response.json();



        if(!response.ok){

            throw new Error(
                data.error || "Unable to load quiz"
            );

        }


        questions = data;


        displayQuestions();


    }

    catch(error){

        console.error(error);

        alert(
            "Unable to load quiz"
        );

    }

}





// Display questions

function displayQuestions(){


    const container =
    document.getElementById(
        "quizContainer"
    );


    container.innerHTML = "";



    questions.forEach((q,index)=>{


        const card =
        document.createElement(
            "div"
        );


        card.className =
        "card";



        card.innerHTML = `

        <h3>
        ${index + 1}. ${q.question}
        </h3>


        <label>
        <input 
        type="radio"
        name="question${q.id}"
        value="A">

        ${q.option_a}

        </label>

        <br>


        <label>
        <input 
        type="radio"
        name="question${q.id}"
        value="B">

        ${q.option_b}

        </label>

        <br>


        <label>
        <input 
        type="radio"
        name="question${q.id}"
        value="C">

        ${q.option_c}

        </label>

        <br>


        <label>
        <input 
        type="radio"
        name="question${q.id}"
        value="D">

        ${q.option_d}

        </label>


        `;


        container.appendChild(card);


    });


}





// Submit quiz

async function submitQuiz(){


    const answers =
    questions.map(q=>{


        const selected =
        document.querySelector(
            `input[name="question${q.id}"]:checked`
        );


        return {

            questionId:q.id,

            answer:
            selected ?
            selected.value :
            null

        };


    });



    try{


        const response =
        await fetch(

            apiUrl(`/quizzes/${quizId}/submit`),

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json",

                    Authorization:
                    `Bearer ${token}`

                },


                body:
                JSON.stringify({
                    answers
                })

            }

        );



        const data =
        await response.json();



        if(!response.ok){

            throw new Error(
                data.error || data.message
            );

        }



const result =
document.getElementById("result");


if(data.passed){

    result.innerHTML = `

    <div class="card">

        <h2>
        Quiz Completed ✅
        </h2>


        <p>
        Score:
        ${data.score}/${data.totalQuestions}
        </p>


        <p>
        Percentage:
        ${data.percentage}%
        </p>


        <h3>
        Status: Passed
        </h3>

    </div>

    `;

}
else{

    result.innerHTML = `

    <div class="card">

        <h2>
        Quiz Completed
        </h2>


        <p>
        Score:
        ${data.score}/${data.totalQuestions}
        </p>


        <p>
        Percentage:
        ${data.percentage}%
        </p>


        <h3>
        Status: Failed
        </h3>


        <p>
        You need 70% or higher to pass.
        </p>

    </div>

    `;

}


    }

    catch(error){

        console.error(error);

        alert(
            error.message
        );

    }

}




document
.getElementById(
    "submitQuizBtn"
)
.addEventListener(
    "click",
    submitQuiz
);



loadQuiz();