const token = getToken();


if(!token){

    window.location.href =
    "../auth/login.html";

}


const params =
new URLSearchParams(
window.location.search
);


const courseId =
params.get("courseId");



async function loadStudents(){

    try{


        const response =
        await fetch(

            apiUrl(
            `/enrollments/course/${courseId}/students`
            ),

            {

                headers:authHeaders()

            }

        );



        const students =
        await response.json();



        if(!response.ok){

            throw new Error(
                students.message ||
                students.error
            );

        }



        displayStudents(students);



    }


    catch(error){

        console.error(error);

        alert(
            error.message
        );

    }

}



// Function to display students in the UI
function displayStudents(students){


    const list =
    document.getElementById(
        "studentList"
    );


    list.innerHTML="";


    if(students.length===0){

        list.innerHTML =
        "<p>No students enrolled.</p>";

        return;

    }



    students.forEach(student=>{


        const card =
        document.createElement(
            "div"
        );


        card.className="card";


        card.innerHTML=`

        <h3>
        ${student.name}
        </h3>

        <p>
        Email:
        ${student.email}
        </p>

        `;


        list.appendChild(card);


    });


}



loadStudents();