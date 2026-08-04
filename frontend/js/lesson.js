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



}

catch(error){

console.error(error);

alert(
"Unable to load lesson"
);

}


}






async function completeLesson(){

try{


const response =
await fetch(

apiUrl(`/progress/lesson/${lessonId}`),

{

method:"POST",

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
data.error
);

}



alert(
"Lesson completed!"
);



}

catch(error){

console.error(error);

alert(
"Unable to complete lesson"
);

}

}





document
.getElementById("completeBtn")
.addEventListener(
"click",
completeLesson
);




loadLesson();