const token =
localStorage.getItem("token");


// If no token exists,
if(!token){

    window.location.href =
    "../auth/login.html";

}




// Get course ID from URL

const params =
new URLSearchParams(
window.location.search
);


// Get course ID from URL
const courseId =
params.get("courseId");





async function loadCourse(){


try{

// Fetch course details
const response =
await fetch(

apiUrl(`/courses/${courseId}`),

{

headers:{

Authorization:
`Bearer ${token}`

}

}

);


// Fetch completed lessons for the course
const progressResponse = await fetch(
    apiUrl(`/progress/course/${courseId}/lessons`),
    {
        headers:{
            Authorization:`Bearer ${token}`
        }
    }
);


// Get the completed lessons data
const completedLessons =
await progressResponse.json();



// Fetch overall course progress
const courseProgressResponse =
await fetch(

apiUrl(`/progress/course/${courseId}`),

{
headers:{
Authorization:`Bearer ${token}`
}
}

);


const courseProgress =
await courseProgressResponse.json();


// Check if the response is OK
const data =
await response.json();


// If the response is not OK, throw an error
if(!response.ok){

throw new Error(data.error);

}


// Display course details
document.getElementById(
"courseTitle"
).textContent =
data.title;


// Display course description
document.getElementById(
"courseDescription"
).textContent =
data.description;



displayLessons(
    data.lessons,
    completedLessons
);



displayProgress(courseProgress);

}


// Catch any errors that occur during the fetch
catch(error){

console.error(error);

alert(
"Unable to load course"
);

}


}



// Function to display lessons in the course
function displayLessons(lessons, completedLessons){


const lessonList =
document.getElementById(
"lessonList"
);



lessonList.innerHTML="";


// Extract completed lesson IDs

const completedLessonIds =
completedLessons.map(
    lesson => lesson.lesson_id
);



lessons.forEach(lesson=>{


const item =
document.createElement(
"div"
);


item.className="card";


// Check if current lesson is completed

const isCompleted =
completedLessonIds.includes(
    lesson.id
);



item.innerHTML=`


<h3>

${isCompleted ? "✅" : "📖"}

Lesson ${lesson.lesson_order}: 
${lesson.title}

</h3>



<p>
${lesson.content.substring(0,150)}...
</p>



<button
onclick="openLesson(${lesson.id})">

${isCompleted 
? "Review Lesson" 
: "Open Lesson"}

</button>


`;



lessonList.appendChild(item);


});


}


// Function to display overall course progress
function displayProgress(progress){


const progressBar =
document.getElementById(
"courseProgressBar"
);


const progressText =
document.getElementById(
"courseProgressText"
);



progressBar.style.width =
`${progress.overallProgress}%`;



progressText.textContent =
`${progress.overallProgress}% completed 
(${progress.lessonProgress.completed}/${progress.lessonProgress.total} lessons completed)`;



}



loadCourse();



function openLesson(lessonId){

    window.location.href =
    `../lessons/lesson.html?lessonId=${lessonId}`;

}