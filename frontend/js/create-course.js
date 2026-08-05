const token = getToken();

if(!token){

    window.location.href =
    "../auth/login.html";

}

document
.getElementById("courseForm")
.addEventListener(
"submit",
createCourse
);

async function createCourse(e){

    e.preventDefault();

    const title =
    document.getElementById("title").value;

    const description =
    document.getElementById("description").value;

    try{

        const response =
        await fetch(

            apiUrl(API.endpoints.courses),

            {

                method:"POST",

                headers:authHeaders(),

                body:JSON.stringify({

                    title,
                    description

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
            "Course created successfully!"
        );

        window.location.href =
        "../dashboard/instructor-dashboard.html";

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}