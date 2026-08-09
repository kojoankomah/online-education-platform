const token = getToken();

if(!token){

    window.location.href =
    "../auth/login.html";

}

const user =
JSON.parse(localStorage.getItem("user"));

if(user && user.role !== "instructor"){

    window.location.href =
    "../dashboard/student-dashboard.html";

}

document
.getElementById("courseForm")
.addEventListener(
"submit",
createCourse
);



async function createCourse(e){

    e.preventDefault();

    const button =
        e.target.querySelector("button");


    const title =
        document.getElementById(
            "title"
        ).value.trim();


    const description =
        document.getElementById(
            "description"
        ).value.trim();


    // Validate before disabling button
    if(!title){

        alert(
            "Course title is required."
        );

        return;
    }


    button.disabled = true;

    button.textContent =
        "Creating...";


    try{

        const response =
            await fetch(

                apiUrl(
                    API.endpoints.courses
                ),

                {
                    method:"POST",

                    headers:authHeaders(),

                    body:JSON.stringify({
                        title,
                        description
                    })
                }

            );


        await handleApiResponse(
            response
        );


        alert(
            "Course created successfully!"
        );


        window.location.href =
            "../dashboard/instructor-dashboard.html";

    }

    catch(error){

        console.error(error);


        if(
            error.message !==
            "Authentication required"
        ){

            alert(
                error.message ||
                "Unable to create course."
            );

        }

    }

    finally{

        button.disabled = false;

        button.textContent =
            "Create Course";

    }

}