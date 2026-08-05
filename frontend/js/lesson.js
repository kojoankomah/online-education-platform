const token =
localStorage.getItem("token");


if(!token){

    window.location.href =
    "../auth/login.html";

}


// Get lesson ID from URL

const params =
new URLSearchParams(
window.location.search
);


const lessonId =
params.get("lessonId");




// Load lesson details
async function loadLesson(){

try{


const response =
await fetch(

apiUrl(`/lessons/${lessonId}`),

{

headers:{
Authorization:
`Bearer ${token}`
}

}

);



const lesson =
await response.json();



if(!response.ok){

throw new Error(
lesson.message
);

}



document.getElementById(
"lessonTitle"
).textContent =
lesson.title;



document.getElementById(
"lessonContent"
).textContent =
lesson.content;


loadQuizButton();

}

catch(error){

console.error(error);

alert(
"Unable to load lesson"
);

}


}


// Load quiz button if a quiz exists for the lesson
async function loadQuizButton(){

try{


const response =
await fetch(

apiUrl(`/quizzes/lesson/${lessonId}`),

{
headers:{
Authorization:
`Bearer ${token}`
}
}

);


const quizzes =
await response.json();



const quizBtn =
document.getElementById(
"quizBtn"
);



if(quizzes.length > 0){


const quizId =
quizzes[0].id;



quizBtn.style.display =
"block";



quizBtn.onclick = ()=>{


window.location.href =
`../quizzes/quiz.html?quizId=${quizId}`;


};


}
else{


quizBtn.style.display =
"none";


}



}

catch(error){

console.error(
"Quiz loading error:",
error
);

}

}



// Check if the lesson is completed
async function checkCompletion(){

const response =
await fetch(

apiUrl(`/progress/lesson/${lessonId}`),

{
headers:{
Authorization:`Bearer ${token}`
}
}

);


const data =
await response.json();


const button =
document.getElementById(
"completeBtn"
);



if(data.completed){

    button.textContent =
    "✅ Lesson Completed";

    button.disabled = true;

}


}



// Mark lesson as completed
async function completeLesson(){

try{


const response =
await fetch(

apiUrl(`/progress/lesson/${lessonId}/complete`),

{

method:"POST",

headers:{

Authorization:
`Bearer ${token}`

}

}

);



const data = await response.json();

if (!response.ok) {
    throw new Error(
        data.error || data.message || "Unable to complete lesson"
    );
}



const button =
document.getElementById(
"completeBtn"
);


button.textContent =
"✅ Lesson Completed";


button.disabled = true;



}

catch(error){

    console.error(error);

    alert(error.message);

}

}




document
.getElementById("completeBtn")
.addEventListener(
"click",
completeLesson
);


loadLesson();
checkCompletion();