const token =
localStorage.getItem("token");



if(!token){

    window.location.href =
    "../auth/login.html";

}




// Get course ID from URL

const params =
new URLSearchParams(
window.location.search
);


const courseId =
params.get("courseId");





async function loadCourse(){


try{


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



const data =
await response.json();



if(!response.ok){

throw new Error(data.error);

}



document.getElementById(
"courseTitle"
).textContent =
data.title;



document.getElementById(
"courseDescription"
).textContent =
data.description;



displayLessons(data.lessons);



}

catch(error){

console.error(error);

alert(
"Unable to load course"
);

}


}




function displayLessons(lessons){


const lessonList =
document.getElementById(
"lessonList"
);



lessonList.innerHTML="";



lessons.forEach(lesson=>{


const item =
document.createElement(
"div"
);


item.className="card";



item.innerHTML=`

<h3>
Lesson ${lesson.lesson_order}: 
${lesson.title}
</h3>


<p>
${lesson.content.substring(0,150)}...
</p>


<button>
Open Lesson
</button>

`;



lessonList.appendChild(item);


});


}



loadCourse();