const token = getToken();

if(!token){

    window.location.href =
        "../auth/login.html";
}

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if(
    user &&
    user.role !== "instructor"
){

    window.location.href =
        "../dashboard/student-dashboard.html";
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
    "../dashboard/instructor-dashboard.html";

}


// Load course details
async function loadCourse(){

    try{

        const response = await fetch(

            apiUrl(
                API.endpoints.courses +
                "/" +
                courseId +
                "/manage"
            ),

            {
                headers: authHeaders()
            }

        );


        const course =
            await handleApiResponse(response);


        document.getElementById(
            "courseTitle"
        ).textContent =
            course.title;


        document.getElementById(
            "courseDescription"
        ).textContent =
            course.description;


        displayLessons(
            course.lessons || []
        );

    }

    catch(error){

        console.error(error);


        if(
            error.message ===
            "Authentication required"
        ){

            return;
        }


        alert(
            error.message ||
            "Unable to load course."
        );


        // An instructor tried to manage
        // another instructor's course
        if(error.status === 403){

            window.location.href =
                "../dashboard/instructor-dashboard.html";

        }

    }

}



// Display lessons
function displayLessons(lessons){

    const list =
    document.getElementById(
        "lessonList"
    );

    list.innerHTML="";

    if(lessons.length===0){

        list.innerHTML=
        "<p>No lessons yet.</p>";

        return;

    }

    lessons.forEach(lesson=>{

        const card =
        document.createElement("div");

        card.className="card";

        card.innerHTML=`

        <h3>

        Lesson ${lesson.lesson_order}

        </h3>

        <p>

        ${lesson.title}

        </p>

        <p>
        ${lesson.content.substring(0,100)}...
        </p>
        
        <button
        onclick="editLesson(${lesson.id})">

        Edit Lesson

        </button>

        `;

        list.appendChild(card);

    });

}



// Edit lesson
document.getElementById(
"addLessonBtn"
).onclick=()=>{

window.location.href=
`add-lesson.html?courseId=${courseId}`;

};


// Edit lesson
document.getElementById(
"createQuizBtn"
).onclick=()=>{

window.location.href=
`create-quiz.html?courseId=${courseId}`;

};


// View students
document.getElementById(
"viewStudentsBtn"
).onclick=()=>{

window.location.href=
`students.html?courseId=${courseId}`;

};



// Edit lesson (Temporary)
function editLesson(id){

alert(
"Lesson editor coming next."
);

}




loadCourse();