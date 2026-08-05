const token = localStorage.getItem("token");

if (!token) {

    window.location.href =
    "../auth/login.html";

}

const user =
JSON.parse(localStorage.getItem("user"));

if (user) {

    document.getElementById(
        "instructorName"
    ).textContent = user.name;

}


/**
 * Load instructor dashboard
 */
async function loadInstructorDashboard(){

    try{

        const response = await fetch(

            apiUrl(API.endpoints.instructorDashboard),

            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }

        );

        const data = await response.json();

        if(!response.ok){

            throw new Error(
                data.error || "Unable to load dashboard"
            );

        }

        displayDashboard(data);

    }

    catch(error){

        console.error(error);

        alert("Unable to load instructor dashboard.");

    }

}



// Display dashboard data
function displayDashboard(data){

    document.getElementById("courseCount").textContent =
    data.courses.length;

    const totalStudents =
    data.courseStats.reduce(

        (total,course)=>

        total + Number(course.students),

        0

    );

    document.getElementById("studentCount").textContent =
    totalStudents;

    const courseList =
    document.getElementById("courseList");

    courseList.innerHTML = "";

    if(data.courses.length===0){

        courseList.innerHTML =
        "<p>No courses created yet.</p>";

        return;

    }

    data.courseStats.forEach(course=>{

        const card =
        document.createElement("div");

        card.className="card";

        card.innerHTML=`

            <h3>

            ${course.title}

            </h3>

            <p>

            Students Enrolled:
            ${course.students}

            </p>

            <button
            onclick="manageCourse(${course.id})">

            Manage Course

            </button>

        `;

        courseList.appendChild(card);

    });

}


// Navigate to manage course page
function manageCourse(courseId){

    window.location.href =
    `../courses/manage-course.html?courseId=${courseId}`;

}



// Logout functionality
document.getElementById("logoutBtn")
.addEventListener("click",()=>{

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
    "../auth/login.html";

});




loadInstructorDashboard();