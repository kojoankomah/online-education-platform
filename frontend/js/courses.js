const token = localStorage.getItem("token");


if(!token){

    window.location.href =
    "../auth/login.html";

}



async function loadCourses(){

    try{

        // Fetch courses from the API
        const response = await fetch(

            apiUrl("/courses"),

            {
                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }

        );

        const courses =
        await response.json();


        if(!response.ok){

            throw new Error(
                courses.error ||
                "Unable to load courses"
            );

        }

        displayCourses(courses);

    }

    catch(error){

        console.error(error);

        alert(
            "Unable to load courses"
        );

    }

}


/// Display courses in the UI
function displayCourses(courses){

    const courseList =
    document.getElementById(
        "courseList"
    );

    // Clear existing courses
    courseList.innerHTML="";

    if(courses.length === 0){

        courseList.innerHTML =
        "<p>No courses available yet.</p>";

        return;

    }

    // Create course cards
    courses.forEach(course=>{

        const card =
        document.createElement(
            "div"
        );

        card.className =
        "card";

        card.innerHTML = `


        <h2>
        ${course.title}
        </h2>


        <p>
        ${course.description}
        </p>


        <p>
        Instructor:
        ${course.instructor_name}
        </p>


        <button
        onclick="enrollCourse(${course.id})">

        Enroll

        </button>

        `;

        courseList.appendChild(card);

    });

}


async function enrollCourse(courseId){

    try{

        const response =
        await fetch(

            apiUrl("/enrollments"),

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

                    courseId

                })

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            throw new Error(
                data.message ||
                "Enrollment failed"
            );

        }

        alert(
            "Enrollment successful!"
        );

        window.location.href =
        "../dashboard/student-dashboard.html";

    }

    catch(error){

        console.error(error);

        alert(
            error.message
        );

    }

}

loadCourses();